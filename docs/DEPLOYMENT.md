# Руководство по развёртыванию CV-Portfolio в Kubernetes

## Содержание

1. [Архитектура](#1-архитектура)
2. [Расчёт ресурсов сервера](#2-расчёт-ресурсов-сервера)
3. [Предварительные требования](#3-предварительные-требования)
4. [Установка k3s на сервере](#4-установка-k3s-на-сервере)
5. [Настройка kubectl на рабочей машине](#5-настройка-kubectl-на-рабочей-машине)
6. [Docker Hub — создание репозиториев](#6-docker-hub--создание-репозиториев)
7. [Production Dockerfile для Go-бэкенда](#7-production-dockerfile-для-go-бэкенда)
8. [Kubernetes-манифесты](#8-kubernetes-манифесты)
9. [Первый деплой](#9-первый-деплой)
10. [Jenkins CI/CD](#10-jenkins-cicd)
11. [Проверка работы](#11-проверка-работы)
12. [Полезные команды kubectl](#12-полезные-команды-kubectl)

---

## 1. Архитектура

```
Разработчик
    │ git push
    ▼
GitHub (3 репозитория)
    │ webhook
    ▼
Jenkins (на сервере) ──► Docker Hub
    │                    (образы)
    │ kubectl set image       │
    ▼                         │
k3s Cluster (bare metal)      │
┌──────────────────────────────────────────────────┐
│  Namespace: cv-portfolio                         │
│                                                  │
│  Traefik Ingress                                 │
│    /              ──► cv-frontend:4000           │
│    /api/contact   ──► cv-contact-me:8090         │
│    /api           ──► cv-backend:3333            │
│                                                  │
│  Pods:                                           │
│    cv-frontend   (Angular SSR, Node.js)          │
│    cv-backend    (Go)                            │
│    cv-contact-me (Spring Boot / Java 8)          │
│    postgres      (StatefulSet, опционально)       │
└──────────────────────────────────────────────────┘
```

**Сервисы и порты:**

| Сервис | Технология | Контейнерный порт | Репозиторий |
|---|---|---|---|
| `cv-frontend` | Angular 17 SSR (Node) | 4000 | `<dockerhub-user>/cv-frontend` |
| `cv-backend` | Go + chi | 3333 | `<dockerhub-user>/cv-backend` |
| `cv-contact-me` | Spring Boot 2.7 / Java 8 | 8090 | `<dockerhub-user>/cv-contact-me` |
| `postgres` | PostgreSQL 16 | 5432 | `postgres:16-alpine` (Docker Hub official) |

---

## 2. Расчёт ресурсов сервера

Все компоненты размещаются на **одном сервере**: k3s + приложения + PostgreSQL + Jenkins.

### RAM по компонентам

| Компонент | Минимум | Рекомендуется | Примечание |
|---|---|---|---|
| **k3s** (control plane) | 256 MB | 512 MB | Намного легче kubeadm |
| **Traefik Ingress** (встроен в k3s) | 64 MB | 128 MB | — |
| **CoreDNS** | 32 MB | 64 MB | — |
| **cv-frontend** (Angular SSR, Node) | 256 MB | 512 MB | SSR держит Node-процесс в памяти |
| **cv-backend** (Go) | 64 MB | 128 MB | Go очень экономен |
| **cv-contact-me** (Java 8 Spring Boot) | 512 MB | 768 MB | JVM резервирует heap даже в idle |
| **PostgreSQL 16** | 256 MB | 512 MB | `shared_buffers` по умолчанию 128 MB |
| **Jenkins** (без agents) | 512 MB | 1024 MB | Пики до 1.5 GB при сборке Maven |
| **ОС + системные процессы** | 512 MB | 512 MB | — |
| **Итого** | **~2.5 GB** | **~4.1 GB** | — |

### CPU по компонентам

| Компонент | Idle | Пик (сборка Jenkins) |
|---|---|---|
| k3s + system | 0.05–0.1 vCPU | 0.2 vCPU |
| cv-frontend | 0.05 vCPU | 0.2 vCPU |
| cv-backend | 0.02 vCPU | 0.1 vCPU |
| cv-contact-me | 0.05 vCPU | 0.15 vCPU |
| PostgreSQL | 0.02 vCPU | 0.1 vCPU |
| **Jenkins (сборка Maven)** | 0.1 vCPU | **1–2 vCPU** |

### Хранилище (SSD)

| Назначение | Размер |
|---|---|
| ОС + k3s | 10 GB |
| Docker images + кэш сборок Jenkins | 20–30 GB |
| PostgreSQL данные (PVC) | 5–10 GB |
| Jenkins workspace + артефакты | 10 GB |
| **Итого** | **~50 GB** |

### Итоговые рекомендации

| Сценарий | CPU | RAM | SSD |
|---|---|---|---|
| **Минимальный** (всё запустится, но Jenkins тормозит) | 2 vCPU | 4 GB | 50 GB |
| **Рекомендуемый** (комфортные сборки) | 4 vCPU | 8 GB | 80 GB |
| **С резервом роста** | 4 vCPU | 16 GB | 100 GB |

> ⚠️ **Java и память:** при сборке `cv-contact-me` через Maven Jenkins форкает второй JVM-процесс. При 2 GB RAM возможны `OOM`-ошибки. Добавьте в Jenkinsfile флаг `MAVEN_OPTS="-Xmx512m"` для ограничения heap.

---

## 3. Предварительные требования

### На сервере

- **OS:** Ubuntu 22.04 LTS (рекомендуется)
- **Ресурсы:** минимум 4 vCPU / 8 GB RAM / 80 GB SSD
- **Открытые порты:** 22 (SSH), 80 (HTTP), 443 (HTTPS), 6443 (k8s API), 8080 (Jenkins)
- **Docker:** установлен (нужен для Jenkins)

```bash
# Установка Docker на Ubuntu
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

### На рабочей машине (Windows)

- **kubectl** — утилита для управления k8s
- **Git**

### Аккаунты

- [Docker Hub](https://hub.docker.com) — для хранения образов
- GitHub — репозитории уже существуют

---

## 4. Установка k3s на сервере

Подключитесь к серверу по SSH и выполните:

```bash
# Установка k3s (single-node кластер)
curl -sfL https://get.k3s.io | sh -

# Проверка статуса
sudo systemctl status k3s

# Проверка нод (через ~1 минуту после установки)
sudo kubectl get nodes
```

Ожидаемый вывод:
```
NAME       STATUS   ROLES                  AGE   VERSION
my-server  Ready    control-plane,master   1m    v1.29.x+k3s1
```

### Права доступа к kubeconfig

```bash
# Сделать kubeconfig доступным без sudo
sudo chmod 644 /etc/rancher/k3s/k3s.yaml
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

# Добавить в .bashrc для постоянства
echo 'export KUBECONFIG=/etc/rancher/k3s/k3s.yaml' >> ~/.bashrc
```

### Что уже установлено в k3s

k3s автоматически включает:
- **Traefik v2** — Ingress-контроллер (маршрутизация трафика снаружи)
- **CoreDNS** — DNS внутри кластера
- **local-path-provisioner** — автоматическое создание PersistentVolumes на диске сервера

---

## 5. Настройка kubectl на рабочей машине

### Установка kubectl (Windows)

```powershell
# Через winget
winget install Kubernetes.kubectl

# Или через scoop
scoop install kubectl
```

### Подключение к кластеру

Скопируйте kubeconfig с сервера на локальную машину:

```bash
# На сервере — показать содержимое kubeconfig
sudo cat /etc/rancher/k3s/k3s.yaml
```

Создайте файл `%USERPROFILE%\.kube\config` на Windows и вставьте содержимое.  
**Замените** `127.0.0.1` на реальный IP вашего сервера:

```yaml
server: https://<IP-СЕРВЕРА>:6443
```

Проверка подключения:

```bash
kubectl get nodes
kubectl get pods -A
```

---

## 6. Docker Hub — создание репозиториев

1. Войдите на [hub.docker.com](https://hub.docker.com)
2. Создайте три **приватных** репозитория:
   - `<ваш-логин>/cv-frontend`
   - `<ваш-логин>/cv-backend`
   - `<ваш-логин>/cv-contact-me`

3. Создайте **Access Token** для Jenkins:  
   Account Settings → Security → New Access Token → скопируйте токен (показывается один раз)

---

## 7. Production Dockerfile для Go-бэкенда

Текущий `Dockerfile` в `cv-backend` запускает Air (hot-reload, только для разработки).  
Для production создан отдельный `Dockerfile.prod` — multi-stage сборка в минимальный образ:

```dockerfile
# Stage 1: Build
FROM golang:1.25-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git gcc musl-dev
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o cv-backend ./cmd/main.go

# Stage 2: Run
FROM alpine:3.20
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app
COPY --from=builder /app/cv-backend .
COPY --from=builder /app/migrations ./migrations
EXPOSE 3333
ENTRYPOINT ["./cv-backend"]
```

> Файл находится в `cv-backend/Dockerfile.prod`. Jenkins использует `-f Dockerfile.prod` при сборке.

---

## 8. Kubernetes-манифесты

Все файлы находятся в папке `k8s/` этого репозитория.  
**Применять в следующем порядке:** namespace → secrets → configmaps → pvc → statefulset → deployments → services → ingress.

### 8.1 Namespace

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: cv-portfolio
```

### 8.2 Secrets

Secrets хранят чувствительные данные (пароли, токены). **Никогда не коммитьте реальные значения в Git.**

Создание секретов через команды (рекомендуется):

```bash
# Секрет для cv-backend
kubectl create secret generic cv-backend-secret \
  --namespace=cv-portfolio \
  --from-literal=POSTGRES_HOST=postgres \
  --from-literal=POSTGRES_PORT=5432 \
  --from-literal=POSTGRES_USER=postgres \
  --from-literal=POSTGRES_PASSWORD=postgres \
  --from-literal=POSTGRES_DB=cvdb \
  --from-literal=SERVER_ADDRESS=0.0.0.0:3333 \
  --from-literal=MIGRATION_PATH=migrations \
  --from-literal=LOG_LEVEL=info \
  --from-literal=APP_ENV=production \
  --from-literal=ALLOWED_ORIGIN=https://localhost \
  --from-literal=ADMIN_USER=admin \
  --from-literal=ADMIN_PASSWORD=postgres \
  --from-literal=APP_SECRET=APP_SECRET

# Секрет для cv-contact-me
kubectl create secret generic cv-contact-me-secret \
  --namespace=cv-portfolio \
  --from-literal=TELEGRAM_BOT_TOKEN=empty \
  --from-literal=TELEGRAM_BOT_USERNAME=empty \
  --from-literal=TELEGRAM_CHAT_ID=empty \
  --from-literal=SMTP_HOST=smtp.yandex.ru \
  --from-literal=SMTP_PORT=587 \
  --from-literal=SMTP_USER=empty \
  --from-literal=SMTP_PASSWORD=empty \
  --from-literal=SMTP_TO=empty \
  --from-literal=DB_URL='jdbc:postgresql://postgres:5432/postgres' \
  --from-literal=DB_USER=postgres \
  --from-literal=DB_PASSWORD=postgres \
  --from-literal=CORS_ALLOWED_ORIGINS='https://localhost'

# Секрет для pull образов с Docker Hub (если репозитории приватные)
kubectl create secret docker-registry dockerhub-secret \
  --namespace=cv-portfolio \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=empty \
  --docker-password=empty
```

### 8.3 PostgreSQL — вариант А: внешняя БД

Если PostgreSQL уже запущен на сервере вне кластера:

```yaml
# k8s/services/postgres-external-svc.yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: cv-portfolio
spec:
  type: ExternalName
  externalName: <IP-СЕРВЕРА>   # например: 192.168.1.10
  ports:
    - port: 5432
```

> В этом случае заменяйте `POSTGRES_HOST` / `DB_URL` на `<IP-СЕРВЕРА>` при создании секретов.

### 8.4 PostgreSQL — вариант Б: StatefulSet внутри кластера

```yaml
# k8s/pvc/postgres-pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: cv-portfolio
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: local-path   # встроен в k3s
```

```yaml
# k8s/deployments/postgres-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: cv-portfolio
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: cv-backend-secret
                  key: POSTGRES_USER
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: cv-backend-secret
                  key: POSTGRES_PASSWORD
            - name: POSTGRES_DB
              valueFrom:
                secretKeyRef:
                  name: cv-backend-secret
                  key: POSTGRES_DB
          volumeMounts:
            - name: postgres-data
              mountPath: /var/lib/postgresql/data
          resources:
            requests:
              memory: "256Mi"
              cpu: "100m"
            limits:
              memory: "512Mi"
              cpu: "500m"
      volumes:
        - name: postgres-data
          persistentVolumeClaim:
            claimName: postgres-pvc
```

```yaml
# k8s/services/postgres-svc.yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: cv-portfolio
spec:
  selector:
    app: postgres
  ports:
    - port: 5432
      targetPort: 5432
  type: ClusterIP
```

### 8.5 Deployments

#### cv-frontend

```yaml
# k8s/deployments/cv-frontend-deploy.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cv-frontend
  namespace: cv-portfolio
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cv-frontend
  template:
    metadata:
      labels:
        app: cv-frontend
    spec:
      imagePullSecrets:
        - name: dockerhub-secret
      containers:
        - name: cv-frontend
          image: <dockerhub-user>/cv-frontend:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 4000
          resources:
            requests:
              memory: "256Mi"
              cpu: "100m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /
              port: 4000
            initialDelaySeconds: 30
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /
              port: 4000
            initialDelaySeconds: 15
            periodSeconds: 10
```

#### cv-backend

```yaml
# k8s/deployments/cv-backend-deploy.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cv-backend
  namespace: cv-portfolio
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cv-backend
  template:
    metadata:
      labels:
        app: cv-backend
    spec:
      imagePullSecrets:
        - name: dockerhub-secret
      containers:
        - name: cv-backend
          image: <dockerhub-user>/cv-backend:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 3333
          envFrom:
            - secretRef:
                name: cv-backend-secret
          resources:
            requests:
              memory: "64Mi"
              cpu: "50m"
            limits:
              memory: "256Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /healthz
              port: 3333
            initialDelaySeconds: 10
            periodSeconds: 20
          readinessProbe:
            httpGet:
              path: /healthz
              port: 3333
            initialDelaySeconds: 5
            periodSeconds: 10
```

#### cv-contact-me

```yaml
# k8s/deployments/cv-contact-me-deploy.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cv-contact-me
  namespace: cv-portfolio
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cv-contact-me
  template:
    metadata:
      labels:
        app: cv-contact-me
    spec:
      imagePullSecrets:
        - name: dockerhub-secret
      containers:
        - name: cv-contact-me
          image: <dockerhub-user>/cv-contact-me:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 8090
          envFrom:
            - secretRef:
                name: cv-contact-me-secret
          env:
            - name: JAVA_OPTS
              value: "-Xmx384m -Xms128m"
          resources:
            requests:
              memory: "384Mi"
              cpu: "100m"
            limits:
              memory: "768Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /actuator/health
              port: 8090
            initialDelaySeconds: 60
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /actuator/health
              port: 8090
            initialDelaySeconds: 40
            periodSeconds: 15
```

> ⚠️ Если Spring Boot Actuator не подключён, замените `/actuator/health` на `/api/contact` с `httpGet` методом POST или используйте `tcpSocket` probe.

### 8.6 Services

```yaml
# k8s/services/cv-frontend-svc.yaml
apiVersion: v1
kind: Service
metadata:
  name: cv-frontend
  namespace: cv-portfolio
spec:
  selector:
    app: cv-frontend
  ports:
    - port: 4000
      targetPort: 4000
  type: ClusterIP
---
# k8s/services/cv-backend-svc.yaml
apiVersion: v1
kind: Service
metadata:
  name: cv-backend
  namespace: cv-portfolio
spec:
  selector:
    app: cv-backend
  ports:
    - port: 3333
      targetPort: 3333
  type: ClusterIP
---
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
    - port: 8090
      targetPort: 8090
  type: ClusterIP
```

### 8.7 Ingress

Traefik (встроен в k3s) маршрутизирует входящий HTTP-трафик по путям.  
**Порядок правил важен:** `/api/contact` должно быть до `/api`.

```yaml
# k8s/ingress/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: cv-ingress
  namespace: cv-portfolio
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: web
spec:
  rules:
    - host: <ваш-домен>   # например: myportfolio.com (или IP сервера без host)
      http:
        paths:
          - path: /api/contact
            pathType: Prefix
            backend:
              service:
                name: cv-contact-me
                port:
                  number: 8090
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: cv-backend
                port:
                  number: 3333
          - path: /
            pathType: Prefix
            backend:
              service:
                name: cv-frontend
                port:
                  number: 4000
```

> Если домена нет и хотите использовать только IP, уберите строку `- host:` — тогда Ingress сработает для любого хоста.

---

## 9. Первый деплой

### Шаг 1. Создать Namespace

```bash
kubectl apply -f k8s/namespace.yaml
```

### Шаг 2. Создать Secrets

Выполните команды из раздела [8.2](#82-secrets) с реальными значениями.

### Шаг 3. Развернуть PostgreSQL (вариант Б)

```bash
kubectl apply -f k8s/pvc/postgres-pvc.yaml
kubectl apply -f k8s/deployments/postgres-statefulset.yaml
kubectl apply -f k8s/services/postgres-svc.yaml

# Ждём готовности
kubectl rollout status statefulset/postgres -n cv-portfolio
```

### Шаг 4. Собрать и запушить образы вручную (первый раз)

На рабочей машине (или на сервере):

```bash
# Логин в Docker Hub
docker login -u <dockerhub-user>

# cv-frontend
docker build -t <dockerhub-user>/cv-frontend:latest ./path/to/cv
docker push <dockerhub-user>/cv-frontend:latest

# cv-backend (production Dockerfile)
docker build -f Dockerfile.prod -t <dockerhub-user>/cv-backend:latest ./path/to/cv-backend
docker push <dockerhub-user>/cv-backend:latest

# cv-contact-me
docker build -t <dockerhub-user>/cv-contact-me:latest ./path/to/cv-contact-me
docker push <dockerhub-user>/cv-contact-me:latest
```

### Шаг 5. Применить все остальные манифесты

```bash
kubectl apply -f k8s/deployments/cv-frontend-deploy.yaml
kubectl apply -f k8s/deployments/cv-backend-deploy.yaml
kubectl apply -f k8s/deployments/cv-contact-me-deploy.yaml
kubectl apply -f k8s/services/
kubectl apply -f k8s/ingress/ingress.yaml
```

### Шаг 6. Проверка

```bash
# Все поды в namespace
kubectl get pods -n cv-portfolio

# Ожидаемый результат (все Running):
# NAME                             READY   STATUS    RESTARTS   AGE
# postgres-0                       1/1     Running   0          5m
# cv-backend-xxx                   1/1     Running   0          2m
# cv-contact-me-xxx                1/1     Running   0          2m
# cv-frontend-xxx                  1/1     Running   0          2m

# Ingress
kubectl get ingress -n cv-portfolio
```

---

## 10. Jenkins CI/CD

### 10.1 Установка Jenkins на сервере

```bash
# Запуск Jenkins в Docker (на сервере)
docker run -d \
  --name jenkins \
  --restart=unless-stopped \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /etc/rancher/k3s/k3s.yaml:/root/.kube/config:ro \
  jenkins/jenkins:lts-jdk17
```

Получить начальный пароль:

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Откройте `http://<IP-сервера>:8080` и завершите установку, установив рекомендуемые плагины.

### 10.2 Установка дополнительных плагинов

В Jenkins: Manage Jenkins → Plugins → Available:
- **Docker Pipeline**
- **Kubernetes CLI Plugin**
- **GitHub plugin** (для webhooks)

### 10.3 Настройка credentials в Jenkins

Jenkins → Manage Jenkins → Credentials → System → Global:

| ID | Тип | Описание |
|---|---|---|
| `dockerhub-credentials` | Username/Password | логин и **Access Token** Docker Hub |
| `kubeconfig` | Secret file | `/etc/rancher/k3s/k3s.yaml` с заменой `127.0.0.1` на IP сервера |

### 10.4 Jenkinsfile

Добавьте `Jenkinsfile` в корень каждого репозитория.

#### cv-frontend (Jenkinsfile)

```groovy
pipeline {
  agent any

  environment {
    IMAGE = "<dockerhub-user>/cv-frontend"
    DEPLOY = "cv-frontend"
    NS = "cv-portfolio"
  }

  stages {
    stage('Build') {
      steps {
        script {
          docker.build("${IMAGE}:${GIT_COMMIT}")
        }
      }
    }

    stage('Push') {
      steps {
        script {
          docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
            docker.image("${IMAGE}:${GIT_COMMIT}").push()
            docker.image("${IMAGE}:${GIT_COMMIT}").push('latest')
          }
        }
      }
    }

    stage('Deploy') {
      steps {
        withKubeConfig([credentialsId: 'kubeconfig']) {
          sh """
            kubectl set image deployment/${DEPLOY} \
              ${DEPLOY}=${IMAGE}:${GIT_COMMIT} \
              -n ${NS}
            kubectl rollout status deployment/${DEPLOY} -n ${NS}
          """
        }
      }
    }
  }

  post {
    failure {
      echo 'Pipeline failed!'
    }
  }
}
```

#### cv-backend (Jenkinsfile)

```groovy
pipeline {
  agent any

  environment {
    IMAGE = "<dockerhub-user>/cv-backend"
    DEPLOY = "cv-backend"
    NS = "cv-portfolio"
  }

  stages {
    stage('Build') {
      steps {
        script {
          docker.build("${IMAGE}:${GIT_COMMIT}", "-f Dockerfile.prod .")
        }
      }
    }

    stage('Push') {
      steps {
        script {
          docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
            docker.image("${IMAGE}:${GIT_COMMIT}").push()
            docker.image("${IMAGE}:${GIT_COMMIT}").push('latest')
          }
        }
      }
    }

    stage('Deploy') {
      steps {
        withKubeConfig([credentialsId: 'kubeconfig']) {
          sh """
            kubectl set image deployment/${DEPLOY} \
              ${DEPLOY}=${IMAGE}:${GIT_COMMIT} \
              -n ${NS}
            kubectl rollout status deployment/${DEPLOY} -n ${NS}
          """
        }
      }
    }
  }
}
```

#### cv-contact-me (Jenkinsfile)

```groovy
pipeline {
  agent any

  environment {
    IMAGE = "<dockerhub-user>/cv-contact-me"
    DEPLOY = "cv-contact-me"
    NS = "cv-portfolio"
    MAVEN_OPTS = "-Xmx512m"
  }

  stages {
    stage('Build') {
      steps {
        script {
          docker.build("${IMAGE}:${GIT_COMMIT}")
        }
      }
    }

    stage('Push') {
      steps {
        script {
          docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
            docker.image("${IMAGE}:${GIT_COMMIT}").push()
            docker.image("${IMAGE}:${GIT_COMMIT}").push('latest')
          }
        }
      }
    }

    stage('Deploy') {
      steps {
        withKubeConfig([credentialsId: 'kubeconfig']) {
          sh """
            kubectl set image deployment/${DEPLOY} \
              ${DEPLOY}=${IMAGE}:${GIT_COMMIT} \
              -n ${NS}
            kubectl rollout status deployment/${DEPLOY} -n ${NS}
          """
        }
      }
    }
  }
}
```

### 10.5 Создание Pipeline-задач в Jenkins

1. New Item → **Multibranch Pipeline** (название: `cv-frontend`, `cv-backend`, `cv-contact-me`)
2. Branch Sources → GitHub → указать URL репозитория
3. Build Configuration → by Jenkinsfile (путь: `Jenkinsfile`)
4. Сохранить → Scan Repository Now

### 10.6 Webhook GitHub → Jenkins

В каждом GitHub-репозитории:  
Settings → Webhooks → Add webhook:
- **Payload URL:** `http://<IP-сервера>:8080/github-webhook/`
- **Content type:** `application/json`
- **Events:** Just the push event

---

## 11. Проверка работы

```bash
# Статус всех подов
kubectl get pods -n cv-portfolio -w

# Детали пода (при проблемах)
kubectl describe pod <pod-name> -n cv-portfolio

# Логи сервисов
kubectl logs -n cv-portfolio deployment/cv-frontend
kubectl logs -n cv-portfolio deployment/cv-backend
kubectl logs -n cv-portfolio deployment/cv-contact-me

# Проверить Ingress-маршруты
kubectl get ingress -n cv-portfolio

# Тест через curl (замените на IP или домен)
curl http://<IP-сервера>/healthz                  # Go backend health check
curl http://<IP-сервера>/                         # Angular SSR frontend
curl -X POST http://<IP-сервера>/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"hello"}'
```

---

## 12. Полезные команды kubectl

### Просмотр ресурсов

```bash
# Все ресурсы в namespace
kubectl get all -n cv-portfolio

# События (для диагностики ошибок)
kubectl get events -n cv-portfolio --sort-by='.lastTimestamp'

# Использование ресурсов подами
kubectl top pods -n cv-portfolio
```

### Управление деплоем

```bash
# Принудительный перезапуск пода (без изменения образа)
kubectl rollout restart deployment/cv-backend -n cv-portfolio

# Откат к предыдущей версии
kubectl rollout undo deployment/cv-backend -n cv-portfolio

# История деплоев
kubectl rollout history deployment/cv-backend -n cv-portfolio
```

### Отладка

```bash
# Войти внутрь контейнера
kubectl exec -it <pod-name> -n cv-portfolio -- /bin/sh

# Пробросить порт на локальную машину (для тестирования)
kubectl port-forward deployment/cv-backend 3333:3333 -n cv-portfolio

# Смотреть логи в реальном времени
kubectl logs -f deployment/cv-backend -n cv-portfolio
```

### Управление секретами

```bash
# Просмотр списка секретов
kubectl get secrets -n cv-portfolio

# Обновление одного значения в секрете (через patch)
kubectl patch secret cv-backend-secret -n cv-portfolio \
  --type='json' \
  -p='[{"op":"replace","path":"/data/ADMIN_PASSWORD","value":"'$(echo -n 'newpassword' | base64)'"}]'

# После обновления секрета — перезапустить деплой
kubectl rollout restart deployment/cv-backend -n cv-portfolio
```

### Масштабирование

```bash
# Увеличить количество реплик (при росте нагрузки)
kubectl scale deployment/cv-frontend --replicas=2 -n cv-portfolio
```

---

## Структура файлов k8s/

```
k8s/
├── namespace.yaml
├── pvc/
│   └── postgres-pvc.yaml
├── deployments/
│   ├── postgres-statefulset.yaml
│   ├── cv-frontend-deploy.yaml
│   ├── cv-backend-deploy.yaml
│   └── cv-contact-me-deploy.yaml
├── services/
│   ├── postgres-svc.yaml
│   ├── postgres-external-svc.yaml   ← альтернатива для внешней БД
│   ├── cv-frontend-svc.yaml
│   ├── cv-backend-svc.yaml
│   └── cv-contact-me-svc.yaml
└── ingress/
    └── ingress.yaml
```

> Создание Secrets командами `kubectl create secret` (раздел 8.2) предпочтительнее хранения их в YAML-файлах, чтобы не допустить попадания паролей в Git.
