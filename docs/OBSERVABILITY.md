# Руководство по Observability: ELK + Jaeger + Prometheus + Grafana

> **Продолжение** [DEPLOYMENT.md](./DEPLOYMENT.md).  
> Предполагается, что k3s-кластер уже поднят, namespace `cv-portfolio` существует,  
> все три сервиса запущены согласно разделам 8–9 основного руководства.

---

## Содержание

1. [Архитектура стека наблюдаемости](#1-архитектура-стека-наблюдаемости)
2. [Расчёт дополнительных ресурсов](#2-расчёт-дополнительных-ресурсов)
3. [Установка Helm](#3-установка-helm)
4. [Namespace и RBAC](#4-namespace-и-rbac)
5. [Prometheus + Grafana (kube-prometheus-stack)](#5-prometheus--grafana)
6. [ELK Stack (Elasticsearch + Fluent Bit + Kibana)](#6-elk-stack)
7. [Jaeger (распределённая трассировка)](#7-jaeger)
8. [Обновление манифестов приложений](#8-обновление-манифестов-приложений)
9. [Инструментирование приложений](#9-инструментирование-приложений)
10. [Ingress для UI мониторинга](#10-ingress-для-ui-мониторинга)
11. [Порядок применения манифестов](#11-порядок-применения-манифестов)
12. [Первичная настройка дашбордов](#12-первичная-настройка-дашбордов)
13. [Полезные команды](#13-полезные-команды)

---

## 1. Архитектура стека наблюдаемости

```
┌─────────────────────────────────────────────────────────────────┐
│  Namespace: cv-portfolio                                        │
│                                                                 │
│  cv-frontend  ──►  /metrics (Node.js prom-client)              │
│  cv-backend   ──►  /metrics (promhttp)                         │
│  cv-contact-me ──► /actuator/prometheus (Micrometer)           │
│                                                                 │
│  Все сервисы пишут логи в stdout → containerd → /var/log/       │
└───────────┬──────────────────────────────────────┬─────────────┘
            │ scrape /metrics                      │ logs
            ▼                                      ▼
┌────────────────────────────────────────────────────────────────┐
│  Namespace: observability                                      │
│                                                                │
│  ┌─────────────────┐   ┌──────────────────┐                   │
│  │   Prometheus    │   │   Fluent Bit      │  ← DaemonSet      │
│  │   (scrape)      │   │   (log shipping)  │    /var/log       │
│  └────────┬────────┘   └────────┬─────────┘                   │
│           │ query               │ index                        │
│           ▼                     ▼                              │
│  ┌─────────────────┐   ┌──────────────────┐                   │
│  │   Grafana       │   │  Elasticsearch   │ ◄── Jaeger spans  │
│  │   (dashboards)  │   │  (single-node)   │                   │
│  └─────────────────┘   └────────┬─────────┘                   │
│                                  │                             │
│                         ┌────────▼─────────┐                  │
│                         │     Kibana        │                  │
│                         │  (log UI)         │                  │
│                         └──────────────────┘                  │
│                                                                │
│  ┌──────────────────────────────────────┐                     │
│  │  Jaeger all-in-one                   │                     │
│  │  (collector + query UI)              │                     │
│  │  OTLP :4317/:4318 ← apps            │                     │
│  │  UI :16686                           │                     │
│  └──────────────────────────────────────┘                     │
└────────────────────────────────────────────────────────────────┘
            │                    │                  │
            ▼                    ▼                  ▼
      Grafana UI            Kibana UI          Jaeger UI
      :3000                 :5601              :16686
      (port-forward / Ingress + BasicAuth)
```

**Три столпа наблюдаемости:**

| Столп | Инструменты | Данные |
|---|---|---|
| **Метрики** | Prometheus + Grafana | CPU, RAM, RPS, latency, JVM heap |
| **Логи** | Fluent Bit → Elasticsearch → Kibana | Structured logs всех сервисов |
| **Трассировка** | OpenTelemetry → Jaeger | Spans HTTP/DB запросов |

---

## 2. Расчёт дополнительных ресурсов

### Новые компоненты

| Компонент | RAM request | RAM limit | CPU request | CPU limit | Диск |
|---|---|---|---|---|---|
| **Elasticsearch** (1 нода, heap 512m) | 512 MB | 1536 MB | 250m | 1000m | 30 GB |
| **Kibana** | 256 MB | 512 MB | 100m | 300m | — |
| **Fluent Bit** (DaemonSet, 1 нода) | 32 MB | 128 MB | 10m | 100m | — |
| **Prometheus** (retention 15d) | 256 MB | 1024 MB | 100m | 500m | 20 GB |
| **Grafana** | 128 MB | 256 MB | 50m | 200m | 2 GB |
| **Alertmanager** | 64 MB | 128 MB | 10m | 100m | 1 GB |
| **kube-state-metrics** | 32 MB | 128 MB | 10m | 100m | — |
| **node-exporter** (DaemonSet) | 16 MB | 64 MB | 10m | 50m | — |
| **Jaeger all-in-one** | 128 MB | 512 MB | 50m | 300m | — |
| **Итого** | **~1.4 GB** | **~4.3 GB** | **~0.6 vCPU** | **~2.75 vCPU** | **~53 GB** |

> ⚠️ **Elasticsearch требует `vm.max_map_count=262144` на хосте.**  
> Это системный параметр ядра — без него ES не запустится. Init-контейнер в манифесте устанавливает его автоматически.

### Итоговые требования к серверу (с observability)

| Сценарий | CPU | RAM | SSD | Примечание |
|---|---|---|---|---|
| **Минимальный** | 4 vCPU | 8 GB | 130 GB | Elasticsearch будет тормозить при 512m heap |
| **Рекомендуемый** | 8 vCPU | 16 GB | 200 GB | Комфортная работа всего стека |
| **С резервом роста** | 8 vCPU | 32 GB | 300 GB | Можно добавить ES replica shards и Loki |

### Сравнение до и после

| | До observability | После observability |
|---|---|---|
| **RAM (лимиты)** | ~4.1 GB | ~8.4 GB |
| **CPU (пик сборки)** | ~2 vCPU | ~4.75 vCPU |
| **SSD** | ~50 GB | ~103 GB |

> **Если сервер 4 vCPU / 8 GB**, observability запустится, но при пике сборки Jenkins  
> возможен OOM. Решение: вынести Jenkins на отдельный сервер или увеличить RAM до 16 GB.

---

## 3. Установка Helm

Helm нужен для установки `kube-prometheus-stack`. Все остальные компоненты — plain YAML.

```bash
# На сервере (или на рабочей машине с доступом к кластеру)
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Проверка
helm version

# Добавить репозитории
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add jaegertracing https://jaegertracing.github.io/helm-charts
helm repo update
```

---

## 4. Namespace и RBAC

```yaml
# k8s/observability/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: observability
  labels:
    monitoring: "true"
```

```bash
kubectl apply -f k8s/observability/namespace.yaml
```

### RBAC для Fluent Bit

Fluent Bit читает метаданные подов через k8s API — ему нужен ClusterRole.

```yaml
# k8s/observability/fluent-bit/fluent-bit-rbac.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: fluent-bit
  namespace: observability
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: fluent-bit-read
rules:
  - apiGroups: [""]
    resources: ["namespaces", "pods", "nodes"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: fluent-bit-read
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: fluent-bit-read
subjects:
  - kind: ServiceAccount
    name: fluent-bit
    namespace: observability
```

---

## 5. Prometheus + Grafana

Используем Helm-чарт `kube-prometheus-stack` — он разворачивает Prometheus, Grafana, Alertmanager, node-exporter, kube-state-metrics и CRD для ServiceMonitor одной командой.

### 5.1 values.yaml

```yaml
# k8s/observability/prometheus/values.yaml

grafana:
  enabled: true
  adminPassword: "<grafana-admin-password>"  # сменить!
  persistence:
    enabled: true
    size: 2Gi
    storageClassName: local-path
  service:
    type: ClusterIP
  resources:
    requests:
      memory: "128Mi"
      cpu: "50m"
    limits:
      memory: "256Mi"
      cpu: "200m"
  grafana.ini:
    server:
      root_url: "%(protocol)s://%(domain)s/_obs/grafana/"
      serve_from_sub_path: true

prometheus:
  prometheusSpec:
    retention: 15d
    scrapeInterval: "30s"
    storageSpec:
      volumeClaimTemplate:
        spec:
          storageClassName: local-path
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 20Gi
    resources:
      requests:
        memory: "256Mi"
        cpu: "100m"
      limits:
        memory: "1Gi"
        cpu: "500m"
    # Разрешаем ServiceMonitor из всех namespace
    serviceMonitorNamespaceSelector: {}
    serviceMonitorSelector: {}

alertmanager:
  alertmanagerSpec:
    resources:
      requests:
        memory: "64Mi"
        cpu: "10m"
      limits:
        memory: "128Mi"
        cpu: "100m"

prometheus-node-exporter:
  resources:
    requests:
      memory: "16Mi"
      cpu: "10m"
    limits:
      memory: "64Mi"
      cpu: "50m"

kube-state-metrics:
  resources:
    requests:
      memory: "32Mi"
      cpu: "10m"
    limits:
      memory: "128Mi"
      cpu: "100m"
```

### 5.2 Установка

```bash
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace observability \
  -f k8s/observability/prometheus/values.yaml \
  --version 61.3.2

# Проверка
kubectl get pods -n observability
kubectl get svc -n observability
```

### 5.3 ServiceMonitor для cv-backend

```yaml
# k8s/observability/prometheus/servicemonitor-cv-backend.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: cv-backend
  namespace: observability
  labels:
    release: prometheus    # должно совпадать с именем helm release
spec:
  namespaceSelector:
    matchNames:
      - cv-portfolio
  selector:
    matchLabels:
      app: cv-backend
  endpoints:
    - port: http           # имя порта в Service (см. раздел 8)
      path: /metrics
      interval: 30s
```

### 5.4 ServiceMonitor для cv-contact-me

```yaml
# k8s/observability/prometheus/servicemonitor-cv-contact-me.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: cv-contact-me
  namespace: observability
  labels:
    release: prometheus
spec:
  namespaceSelector:
    matchNames:
      - cv-portfolio
  selector:
    matchLabels:
      app: cv-contact-me
  endpoints:
    - port: http
      path: /actuator/prometheus
      interval: 30s
```

### 5.5 PrometheusRule — базовые алерты

```yaml
# k8s/observability/prometheus/alert-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: cv-portfolio-alerts
  namespace: observability
  labels:
    release: prometheus
spec:
  groups:
    - name: cv-portfolio.rules
      rules:
        - alert: PodNotReady
          expr: kube_pod_status_ready{namespace="cv-portfolio",condition="true"} == 0
          for: 5m
          labels:
            severity: warning
          annotations:
            summary: "Pod {{ $labels.pod }} не готов"

        - alert: HighMemoryUsage
          expr: |
            container_memory_usage_bytes{namespace="cv-portfolio"}
            / container_spec_memory_limit_bytes{namespace="cv-portfolio"} > 0.85
          for: 5m
          labels:
            severity: warning
          annotations:
            summary: "Контейнер {{ $labels.container }} использует >85% памяти"

        - alert: PodCrashLooping
          expr: rate(kube_pod_container_status_restarts_total{namespace="cv-portfolio"}[15m]) > 0
          for: 5m
          labels:
            severity: critical
          annotations:
            summary: "Pod {{ $labels.pod }} перезапускается"

        - alert: BackendDown
          expr: up{job="cv-backend"} == 0
          for: 2m
          labels:
            severity: critical
          annotations:
            summary: "cv-backend недоступен"
```

---

## 6. ELK Stack

Используем:
- **Elasticsearch 8.13** — single-node, security отключён (только внутри кластера)
- **Fluent Bit 3.1** — DaemonSet, читает `/var/log/containers/*.log`
- **Kibana 8.13** — UI для поиска логов

> Версии Elasticsearch и Kibana **должны совпадать**.

### 6.1 Elasticsearch

```yaml
# k8s/observability/elasticsearch/elasticsearch-sts.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: elasticsearch
  namespace: observability
spec:
  serviceName: elasticsearch
  replicas: 1
  selector:
    matchLabels:
      app: elasticsearch
  template:
    metadata:
      labels:
        app: elasticsearch
    spec:
      initContainers:
        - name: fix-permissions
          image: busybox:1.36
          command: ["sh", "-c", "chown -R 1000:1000 /usr/share/elasticsearch/data"]
          securityContext:
            privileged: true
          volumeMounts:
            - name: es-data
              mountPath: /usr/share/elasticsearch/data
        - name: increase-vm-max-map
          image: busybox:1.36
          command: ["sysctl", "-w", "vm.max_map_count=262144"]
          securityContext:
            privileged: true
      containers:
        - name: elasticsearch
          image: elasticsearch:8.13.4
          env:
            - name: discovery.type
              value: single-node
            - name: ES_JAVA_OPTS
              value: "-Xmx512m -Xms512m"
            - name: xpack.security.enabled
              value: "false"
            - name: xpack.security.http.ssl.enabled
              value: "false"
            - name: cluster.name
              value: cv-logs
          ports:
            - containerPort: 9200
              name: http
            - containerPort: 9300
              name: transport
          volumeMounts:
            - name: es-data
              mountPath: /usr/share/elasticsearch/data
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1536Mi"
              cpu: "1000m"
          readinessProbe:
            httpGet:
              path: /_cluster/health?wait_for_status=yellow&timeout=5s
              port: 9200
            initialDelaySeconds: 30
            periodSeconds: 15
            failureThreshold: 10
          livenessProbe:
            httpGet:
              path: /_cluster/health
              port: 9200
            initialDelaySeconds: 60
            periodSeconds: 30
  volumeClaimTemplates:
    - metadata:
        name: es-data
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: local-path
        resources:
          requests:
            storage: 30Gi
---
apiVersion: v1
kind: Service
metadata:
  name: elasticsearch
  namespace: observability
spec:
  selector:
    app: elasticsearch
  ports:
    - name: http
      port: 9200
      targetPort: 9200
    - name: transport
      port: 9300
      targetPort: 9300
  type: ClusterIP
```

### 6.2 Kibana

```yaml
# k8s/observability/kibana/kibana-deploy.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kibana
  namespace: observability
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kibana
  template:
    metadata:
      labels:
        app: kibana
    spec:
      containers:
        - name: kibana
          image: kibana:8.13.4
          env:
            - name: ELASTICSEARCH_HOSTS
              value: "http://elasticsearch:9200"
            - name: SERVER_PUBLICBASEURL
              value: "http://<ваш-домен>/_obs/kibana"
            - name: SERVER_BASEPATH
              value: "/_obs/kibana"
            - name: SERVER_REWRITEBASEPATH
              value: "true"
          ports:
            - containerPort: 5601
          resources:
            requests:
              memory: "256Mi"
              cpu: "100m"
            limits:
              memory: "512Mi"
              cpu: "300m"
          readinessProbe:
            httpGet:
              path: /_obs/kibana/api/status
              port: 5601
            initialDelaySeconds: 60
            periodSeconds: 20
            failureThreshold: 10
---
apiVersion: v1
kind: Service
metadata:
  name: kibana
  namespace: observability
spec:
  selector:
    app: kibana
  ports:
    - port: 5601
      targetPort: 5601
  type: ClusterIP
```

### 6.3 Fluent Bit — ConfigMap

```yaml
# k8s/observability/fluent-bit/fluent-bit-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluent-bit-config
  namespace: observability
data:
  fluent-bit.conf: |
    [SERVICE]
        Flush           1
        Log_Level       info
        Daemon          off
        Parsers_File    parsers.conf
        HTTP_Server     On
        HTTP_Listen     0.0.0.0
        HTTP_Port       2020

    [INPUT]
        Name              tail
        Path              /var/log/containers/*.log
        multiline.parser  cri
        Tag               kube.*
        Refresh_Interval  5
        Mem_Buf_Limit     5MB
        Skip_Long_Lines   On

    [FILTER]
        Name                kubernetes
        Match               kube.*
        Kube_URL            https://kubernetes.default.svc:443
        Kube_CA_File        /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        Kube_Token_File     /var/run/secrets/kubernetes.io/serviceaccount/token
        Kube_Tag_Prefix     kube.var.log.containers.
        Merge_Log           On
        Keep_Log            Off
        K8S-Logging.Parser  On
        K8S-Logging.Exclude On
        Annotations         Off
        Labels              On

    [OUTPUT]
        Name              es
        Match             kube.*
        Host              elasticsearch
        Port              9200
        Logstash_Format   On
        Logstash_Prefix   cv-logs
        Retry_Limit       False
        tls               Off
        tls.verify        Off
        Suppress_Type_Name On

  parsers.conf: |
    [PARSER]
        Name        cri
        Format      regex
        Regex       ^(?<time>[^ ]+) (?<stream>stdout|stderr) (?<logtag>[^ ]*) (?<log>.*)$
        Time_Key    time
        Time_Format %Y-%m-%dT%H:%M:%S.%L%z
```

### 6.4 Fluent Bit — DaemonSet

```yaml
# k8s/observability/fluent-bit/fluent-bit-daemonset.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluent-bit
  namespace: observability
  labels:
    app: fluent-bit
spec:
  selector:
    matchLabels:
      app: fluent-bit
  template:
    metadata:
      labels:
        app: fluent-bit
    spec:
      serviceAccountName: fluent-bit
      tolerations:
        - key: node-role.kubernetes.io/control-plane
          effect: NoSchedule
        - key: node-role.kubernetes.io/master
          effect: NoSchedule
      containers:
        - name: fluent-bit
          image: cr.fluentbit.io/fluent/fluent-bit:3.1
          resources:
            requests:
              memory: "32Mi"
              cpu: "10m"
            limits:
              memory: "128Mi"
              cpu: "100m"
          ports:
            - containerPort: 2020
              name: metrics
          readinessProbe:
            httpGet:
              path: /api/v1/health
              port: 2020
            initialDelaySeconds: 10
            periodSeconds: 15
          volumeMounts:
            - name: varlog
              mountPath: /var/log
              readOnly: true
            - name: config
              mountPath: /fluent-bit/etc/
      volumes:
        - name: varlog
          hostPath:
            path: /var/log
        - name: config
          configMap:
            name: fluent-bit-config
```

---

## 7. Jaeger

Jaeger all-in-one — содержит collector, query и UI в одном поде.  
Использует Elasticsearch (из раздела 6) как backend для персистентного хранения span-ов.

```yaml
# k8s/observability/jaeger/jaeger-deploy.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jaeger
  namespace: observability
spec:
  replicas: 1
  selector:
    matchLabels:
      app: jaeger
  template:
    metadata:
      labels:
        app: jaeger
    spec:
      containers:
        - name: jaeger
          image: jaegertracing/all-in-one:1.57
          env:
            - name: SPAN_STORAGE_TYPE
              value: elasticsearch
            - name: ES_SERVER_URLS
              value: http://elasticsearch:9200
            - name: ES_TAGS_AS_FIELDS_ALL
              value: "true"
            - name: COLLECTOR_OTLP_ENABLED
              value: "true"
            - name: QUERY_BASE_PATH
              value: /_obs/jaeger
          ports:
            - containerPort: 6831
              protocol: UDP
              name: agent-compact
            - containerPort: 14268
              protocol: TCP
              name: collector-http
            - containerPort: 4317
              protocol: TCP
              name: otlp-grpc
            - containerPort: 4318
              protocol: TCP
              name: otlp-http
            - containerPort: 16686
              protocol: TCP
              name: query-ui
          resources:
            requests:
              memory: "128Mi"
              cpu: "50m"
            limits:
              memory: "512Mi"
              cpu: "300m"
          readinessProbe:
            httpGet:
              path: /
              port: 14269
            initialDelaySeconds: 15
            periodSeconds: 15
---
apiVersion: v1
kind: Service
metadata:
  name: jaeger
  namespace: observability
spec:
  selector:
    app: jaeger
  ports:
    - name: agent-compact
      port: 6831
      protocol: UDP
      targetPort: 6831
    - name: collector-http
      port: 14268
      targetPort: 14268
    - name: otlp-grpc
      port: 4317
      targetPort: 4317
    - name: otlp-http
      port: 4318
      targetPort: 4318
    - name: query-ui
      port: 16686
      targetPort: 16686
  type: ClusterIP
```

---

## 8. Обновление манифестов приложений

ServiceMonitor требует **именованных портов** в Service. Обновите Services в `cv-portfolio`:

```yaml
# k8s/services/cv-backend-svc.yaml — добавить name: http к порту
apiVersion: v1
kind: Service
metadata:
  name: cv-backend
  namespace: cv-portfolio
spec:
  selector:
    app: cv-backend
  ports:
    - name: http          # ← добавить name
      port: 3333
      targetPort: 3333
  type: ClusterIP
```

```yaml
# k8s/services/cv-contact-me-svc.yaml
apiVersion: v1
kind: Service
metadata:
  name: cv-contact-me
  namespace: cv-portfolio
spec:
  selector:
    app: cv-contact-me
  ports:
    - name: http          # ← добавить name
      port: 8090
      targetPort: 8090
  type: ClusterIP
```

Применить:
```bash
kubectl apply -f k8s/services/cv-backend-svc.yaml
kubectl apply -f k8s/services/cv-contact-me-svc.yaml
```

Также добавьте переменные окружения для OpenTelemetry в Deployment манифесты:

```yaml
# Добавить в spec.template.spec.containers[0].env в cv-backend-deploy.yaml
- name: OTEL_EXPORTER_OTLP_ENDPOINT
  value: "http://jaeger.observability:4318"
- name: OTEL_SERVICE_NAME
  value: "cv-backend"
- name: OTEL_TRACES_EXPORTER
  value: "otlp"
```

```yaml
# Добавить в cv-contact-me-deploy.yaml
- name: JAVA_TOOL_OPTIONS
  value: "-javaagent:/app/otel-javaagent.jar -Xmx384m -Xms128m"
- name: OTEL_EXPORTER_OTLP_ENDPOINT
  value: "http://jaeger.observability:4318"
- name: OTEL_SERVICE_NAME
  value: "cv-contact-me"
- name: OTEL_TRACES_EXPORTER
  value: "otlp"
```

> ℹ️ `otel-javaagent.jar` должен быть добавлен в Docker-образ `cv-contact-me` (см. раздел 9.2).

---

## 9. Инструментирование приложений

### 9.1 Go Backend (cv-backend)

**Зависимости** (`go.mod`):

```bash
go get github.com/prometheus/client_golang/prometheus
go get github.com/prometheus/client_golang/prometheus/promhttp
go get go.opentelemetry.io/otel@v1.27.0
go get go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp@v1.27.0
go get go.opentelemetry.io/otel/sdk/trace@v1.27.0
go get go.opentelemetry.io/otel/semconv/v1.26.0
```

**Инициализация трейсера** (например, `internal/telemetry/tracer.go`):

```go
package telemetry

import (
    "context"
    "os"

    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
    "go.opentelemetry.io/otel/sdk/resource"
    sdktrace "go.opentelemetry.io/otel/sdk/trace"
    semconv "go.opentelemetry.io/otel/semconv/v1.26.0"
)

func InitTracer(ctx context.Context) (*sdktrace.TracerProvider, error) {
    endpoint := os.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
    if endpoint == "" {
        endpoint = "http://localhost:4318"
    }

    exp, err := otlptracehttp.New(ctx,
        otlptracehttp.WithEndpoint(endpoint),
        otlptracehttp.WithInsecure(),
    )
    if err != nil {
        return nil, err
    }

    tp := sdktrace.NewTracerProvider(
        sdktrace.WithBatcher(exp),
        sdktrace.WithResource(resource.NewWithAttributes(
            semconv.SchemaURL,
            semconv.ServiceName("cv-backend"),
        )),
    )
    otel.SetTracerProvider(tp)
    return tp, nil
}
```

**Endpoint `/metrics`** — добавить в роутер:

```go
import "github.com/prometheus/client_golang/prometheus/promhttp"

// В router.New() или аналогичном месте регистрации маршрутов:
r.Handle("/metrics", promhttp.Handler())
```

### 9.2 Spring Boot (cv-contact-me)

**`pom.xml`** — добавить зависимости:

```xml
<!-- Prometheus метрики через Micrometer -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>

<!-- Actuator (если ещё не добавлен) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

**`application.properties`** (или `application.yml`):

```properties
management.endpoints.web.exposure.include=health,prometheus,info
management.endpoint.prometheus.enabled=true
management.metrics.export.prometheus.enabled=true
management.endpoint.health.show-details=always
```

**Dockerfile** — добавить OpenTelemetry Java agent:

```dockerfile
# В Stage 2 (runtime) добавить:
ADD https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v2.4.0/opentelemetry-javaagent.jar /app/otel-javaagent.jar
RUN chmod 644 /app/otel-javaagent.jar
```

> После изменения pom.xml и Dockerfile пересоберите и запушите образ. Jenkins сделает это автоматически при следующем `git push`.

### 9.3 Angular SSR (cv-frontend)

Для Node.js SSR-процесса можно добавить базовые метрики через `prom-client`:

```bash
wsl bash -c "cd /mnt/u/projects/cv && npm install prom-client"
```

В `server.ts` добавить эндпоинт `/metrics`:

```typescript
import client from 'prom-client';

// После создания app
const register = new client.Registry();
client.collectDefaultMetrics({ register });

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

После этого добавьте ServiceMonitor для `cv-frontend` аналогично разделу 5.3.

---

## 10. Ingress для UI мониторинга

UI инструментов мониторинга (Grafana, Kibana, Jaeger) **не должны быть публично доступны** без аутентификации.

### Вариант А: BasicAuth через Traefik Middleware (рекомендуется)

```bash
# Генерация htpasswd (apache2-utils или openssl)
echo $(htpasswd -nB admin) | sed -e s/\\$/\\$\\$/g
# Скопировать вывод в secret ниже
```

```yaml
# k8s/observability/ingress/obs-middleware.yaml
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: obs-auth
  namespace: observability
spec:
  basicAuth:
    secret: obs-auth-secret
---
apiVersion: v1
kind: Secret
metadata:
  name: obs-auth-secret
  namespace: observability
stringData:
  users: "admin:$$2y$$10$$<ваш-htpasswd-hash>"  # двойной $ для escaping
```

```yaml
# k8s/observability/ingress/obs-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: obs-ingress
  namespace: observability
  annotations:
    traefik.ingress.kubernetes.io/router.middlewares: observability-obs-auth@kubernetescrd
    traefik.ingress.kubernetes.io/router.entrypoints: web
spec:
  rules:
    - host: <ваш-домен>
      http:
        paths:
          - path: /_obs/grafana
            pathType: Prefix
            backend:
              service:
                name: prometheus-grafana
                port:
                  number: 80
          - path: /_obs/kibana
            pathType: Prefix
            backend:
              service:
                name: kibana
                port:
                  number: 5601
          - path: /_obs/jaeger
            pathType: Prefix
            backend:
              service:
                name: jaeger
                port:
                  number: 16686
```

### Вариант Б: Port-forward (без публичного доступа)

```bash
# Grafana
kubectl port-forward -n observability svc/prometheus-grafana 3000:80 &
# Открыть: http://localhost:3000  (admin / <grafana-admin-password>)

# Kibana
kubectl port-forward -n observability svc/kibana 5601:5601 &
# Открыть: http://localhost:5601

# Jaeger
kubectl port-forward -n observability svc/jaeger 16686:16686 &
# Открыть: http://localhost:16686
```

> Для Windows-рабочей машины с SSH-туннелем к серверу:
> ```powershell
> ssh -L 3000:localhost:3000 -L 5601:localhost:5601 -L 16686:localhost:16686 user@<IP-сервера>
> ```

---

## 11. Порядок применения манифестов

```bash
# 1. Namespace
kubectl apply -f k8s/observability/namespace.yaml

# 2. RBAC для Fluent Bit
kubectl apply -f k8s/observability/fluent-bit/fluent-bit-rbac.yaml

# 3. Elasticsearch (ждём готовности — ~2 минуты)
kubectl apply -f k8s/observability/elasticsearch/elasticsearch-sts.yaml
kubectl rollout status statefulset/elasticsearch -n observability

# 4. Kibana
kubectl apply -f k8s/observability/kibana/kibana-deploy.yaml

# 5. Fluent Bit
kubectl apply -f k8s/observability/fluent-bit/fluent-bit-configmap.yaml
kubectl apply -f k8s/observability/fluent-bit/fluent-bit-daemonset.yaml

# 6. Jaeger (запускать после Elasticsearch)
kubectl apply -f k8s/observability/jaeger/jaeger-deploy.yaml

# 7. Prometheus + Grafana через Helm
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace observability \
  -f k8s/observability/prometheus/values.yaml \
  --version 61.3.2

# Ждём готовности
kubectl rollout status deployment/prometheus-grafana -n observability
kubectl rollout status statefulset/prometheus-prometheus-kube-prometheus-prometheus -n observability

# 8. ServiceMonitors и PrometheusRules
kubectl apply -f k8s/observability/prometheus/servicemonitor-cv-backend.yaml
kubectl apply -f k8s/observability/prometheus/servicemonitor-cv-contact-me.yaml
kubectl apply -f k8s/observability/prometheus/alert-rules.yaml

# 9. Обновить Services в cv-portfolio (добавление name: http)
kubectl apply -f k8s/services/cv-backend-svc.yaml
kubectl apply -f k8s/services/cv-contact-me-svc.yaml

# 10. Ingress для мониторинга (опционально)
kubectl apply -f k8s/observability/ingress/obs-middleware.yaml
kubectl apply -f k8s/observability/ingress/obs-ingress.yaml

# 11. Финальная проверка
kubectl get pods -n observability
```

Ожидаемый результат:
```
NAME                                                   READY   STATUS    RESTARTS
elasticsearch-0                                        1/1     Running   0
kibana-xxx                                             1/1     Running   0
fluent-bit-xxx                                         1/1     Running   0
jaeger-xxx                                             1/1     Running   0
prometheus-grafana-xxx                                 3/3     Running   0
prometheus-kube-prometheus-operator-xxx                1/1     Running   0
prometheus-kube-prometheus-prometheus-0                2/2     Running   0
prometheus-kube-prometheus-alertmanager-0              2/2     Running   0
prometheus-kube-state-metrics-xxx                      1/1     Running   0
prometheus-prometheus-node-exporter-xxx                1/1     Running   0
```

---

## 12. Первичная настройка дашбордов

### Grafana

1. Открыть `http://localhost:3000` (или через Ingress `/_obs/grafana`)
2. Войти: `admin` / `<grafana-admin-password>`
3. **Datasource** — автоматически настроен Prometheus при установке через kube-prometheus-stack
4. **Импорт готовых дашбордов** (Dashboards → Import → по ID):

| Дашборд | ID | Описание |
|---|---|---|
| Kubernetes / Compute Resources / Cluster | `15757` | Общий обзор кластера |
| Kubernetes / Compute Resources / Namespace | `15758` | Ресурсы cv-portfolio |
| Node Exporter Full | `1860` | Метрики хост-машины |
| Go Metrics | `10826` | Метрики Go-приложения |
| JVM Overview (Micrometer) | `4701` | JVM heap, threads, GC |
| Spring Boot 3.x Statistics | `19004` | HTTP requests, latency |

5. Настройка **Alertmanager** для Telegram-уведомлений:

```yaml
# Добавить в values.yaml в секцию alertmanager.config:
alertmanager:
  config:
    global:
      resolve_timeout: 5m
    receivers:
      - name: telegram
        telegram_configs:
          - bot_token: "<TELEGRAM_BOT_TOKEN>"
            chat_id: <TELEGRAM_CHAT_ID>
            message: |
              🚨 {{ .CommonLabels.alertname }}
              {{ range .Alerts }}{{ .Annotations.summary }}{{ end }}
    route:
      receiver: telegram
      group_wait: 30s
      group_interval: 5m
      repeat_interval: 4h
```

### Kibana

1. Открыть `http://localhost:5601`
2. **Stack Management → Index Patterns → Create**:
   - Pattern: `cv-logs-*`
   - Time field: `@timestamp`
3. **Discover** → выбрать `cv-logs-*` → фильтровать по `kubernetes.namespace_name: cv-portfolio`
4. Полезные поля для фильтрации:
   - `kubernetes.container_name` — имя контейнера
   - `kubernetes.pod_name` — имя пода
   - `log` — текст лога

### Jaeger

1. Открыть `http://localhost:16686`
2. Service → выбрать `cv-backend` или `cv-contact-me`
3. Find Traces — найти медленные запросы
4. Для появления трейсов приложения должны быть пересобраны с OTel-инструментацией (раздел 9)

---

## 13. Полезные команды

### Диагностика Prometheus

```bash
# Проверить таргеты (что scrape-ится)
kubectl port-forward -n observability svc/prometheus-kube-prometheus-prometheus 9090:9090 &
# Открыть: http://localhost:9090/targets

# Посмотреть правила алертов
kubectl get prometheusrule -n observability

# Статус Prometheus оператора
kubectl get prometheuses -n observability
kubectl describe prometheus prometheus-kube-prometheus-prometheus -n observability
```

### Диагностика ELK

```bash
# Здоровье Elasticsearch кластера
kubectl exec -n observability elasticsearch-0 -- \
  curl -s http://localhost:9200/_cluster/health?pretty

# Список индексов (cv-logs-*)
kubectl exec -n observability elasticsearch-0 -- \
  curl -s http://localhost:9200/_cat/indices?v

# Размер индексов
kubectl exec -n observability elasticsearch-0 -- \
  curl -s "http://localhost:9200/_cat/indices/cv-logs-*?v&s=store.size:desc"

# Логи Fluent Bit (диагностика отправки)
kubectl logs -n observability daemonset/fluent-bit --tail=50

# Очистка старых индексов (старше 30 дней)
kubectl exec -n observability elasticsearch-0 -- \
  curl -X DELETE "http://localhost:9200/cv-logs-$(date -d '30 days ago' +%Y.%m.%d)"
```

### Управление Helm-релизом

```bash
# Статус релиза
helm status prometheus -n observability

# Обновить values (например, сменить пароль Grafana)
helm upgrade prometheus prometheus-community/kube-prometheus-stack \
  --namespace observability \
  -f k8s/observability/prometheus/values.yaml

# История релизов
helm history prometheus -n observability

# Откат к предыдущей версии
helm rollback prometheus 1 -n observability
```

### Быстрые проверки

```bash
# Все ресурсы в observability
kubectl get all -n observability

# Потребление ресурсов подами мониторинга
kubectl top pods -n observability

# Проверить, что Prometheus видит сервисы cv-portfolio
kubectl get servicemonitor -n observability

# Проверить, что Jaeger получает span-ы
kubectl logs -n observability deployment/jaeger --tail=30
```

---

## Структура файлов k8s/observability/

```
k8s/observability/
├── namespace.yaml
├── elasticsearch/
│   └── elasticsearch-sts.yaml           ← StatefulSet + Service
├── kibana/
│   └── kibana-deploy.yaml               ← Deployment + Service
├── fluent-bit/
│   ├── fluent-bit-rbac.yaml             ← SA + ClusterRole + Binding
│   ├── fluent-bit-configmap.yaml        ← конфиг и парсеры
│   └── fluent-bit-daemonset.yaml        ← DaemonSet
├── prometheus/
│   ├── values.yaml                      ← Helm values
│   ├── servicemonitor-cv-backend.yaml
│   ├── servicemonitor-cv-contact-me.yaml
│   └── alert-rules.yaml                 ← PrometheusRule
├── jaeger/
│   └── jaeger-deploy.yaml               ← Deployment + Service
└── ingress/
    ├── obs-middleware.yaml              ← Traefik BasicAuth
    └── obs-ingress.yaml                 ← Ingress с путями /_obs/*
```

---

> **Следующий шаг после настройки observability:**  
> Настройте **ILM (Index Lifecycle Management)** в Elasticsearch для автоматического  
> удаления индексов логов старше 30 дней — это предотвратит переполнение 30 GB PVC.  
> Kibana → Stack Management → Index Lifecycle Policies → Create Policy.
