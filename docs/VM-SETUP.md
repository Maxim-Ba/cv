# Руководство по настройке VM в Oracle VirtualBox для отработки K8s-развертывания

## Содержание

1. [Требования к хост-машине](#1-требования-к-хост-машине)
2. [Загрузка Ubuntu Server ISO](#2-загрузка-ubuntu-server-iso)
3. [Создание виртуальной машины](#3-создание-виртуальной-машины)
4. [Установка Ubuntu Server](#4-установка-ubuntu-server)
5. [Первичная настройка системы](#5-первичная-настройка-системы)
6. [Настройка сети](#6-настройка-сети)
7. [Доступ по SSH с хост-машины](#7-доступ-по-ssh-с-хост-машины)
8. [Установка необходимого ПО](#8-установка-необходимого-по)
9. [Проверка готовности](#9-проверка-готовности)
10. [Переход к развертыванию](#10-переход-к-развертыванию)
11. [Полезные советы](#11-полезные-советы)
12. [Резервное копирование](#12-резервное-копирование)

---

## 1. Требования к хост-машине

Ваша физическая машина (Windows с VirtualBox) должна иметь:

| Ресурс | Минимум | Рекомендуется | Комментарий |
|---|---|---|---|
| **CPU** | 4 ядра (физические) | 6+ ядер | Поддержка виртуализации (Intel VT-x / AMD-V) |
| **RAM** | 12 GB | 16+ GB | 8 GB выделим VM, остальное для Windows |
| **Свободное место на диске** | 80 GB | 120+ GB | Динамический диск VM |
| **VirtualBox** | 7.0+ | 7.1+ | [Скачать](https://www.virtualbox.org/) |

### Проверка виртуализации

В Windows PowerShell (от администратора):

```powershell
systeminfo | findstr /i "hyper"
```

Если видите **"Виртуализация включена в микропрограмме: Да"** — всё в порядке.  
Если нет — включите **Intel VT-x** или **AMD-V** в BIOS/UEFI.

---

## 2. Загрузка Ubuntu Server ISO

1. Перейдите на [ubuntu.com/download/server](https://ubuntu.com/download/server)
2. Скачайте **Ubuntu Server 22.04.x LTS** (рекомендуется именно эта версия, т.к. она указана в `DEPLOYMENT.md`)
3. Размер файла: ~2 GB, название: `ubuntu-22.04.x-live-server-amd64.iso`

> **Важно:** используйте **Server**, а не Desktop — Server легче и не содержит графического интерфейса.

---

## 3. Создание виртуальной машины

Запустите Oracle VirtualBox и создайте новую VM:

### Шаг 1. Общие параметры

1. **Нажмите:** Machine → New
2. **Имя:** `k8s-cv-test` (или любое другое)
3. **Папка машины:** по умолчанию (или выберите диск с достаточным местом)
4. **ISO Image:** выберите скачанный `ubuntu-22.04.x-live-server-amd64.iso`
5. **Type:** Linux
6. **Version:** Ubuntu (64-bit)
7. **Skip Unattended Installation:** ✅ **Включить** (настроим вручную)

### Шаг 2. Аппаратные ресурсы (Hardware)

| Параметр | Значение | Комментарий |
|---|---|---|
| **Base Memory** | 8192 MB (8 GB) | Минимум 4 GB, рекомендуется 8 GB |
| **Processors** | 4 | Минимум 2, рекомендуется 4 |
| **Enable EFI** | ❌ Отключить | BIOS проще для совместимости |

### Шаг 3. Виртуальный жёсткий диск (Hard Disk)

1. **Create a Virtual Hard Disk Now**
2. **Disk Size:** 100 GB
3. **Hard Disk File Type:** VDI (VirtualBox Disk Image)
4. **Storage on physical hard disk:** **Dynamically allocated** (диск растёт по мере заполнения)

### Шаг 4. Финальные настройки перед установкой

После создания VM откройте её настройки (Settings):

#### System

- **Motherboard → Boot Order:**
  - ✅ Optical
  - ✅ Hard Disk
  - ❌ Floppy
  - ❌ Network
- **Processor → Enable PAE/NX:** ✅
- **Acceleration → Paravirtualization Interface:** Default

#### Network

- **Adapter 1:**
  - ✅ Enable Network Adapter
  - **Attached to:** Bridged Adapter (для получения IP в вашей локальной сети)
  - **Name:** выберите ваш активный сетевой адаптер (Ethernet или Wi-Fi)
  - **Promiscuous Mode:** Allow All

> **Альтернатива (если Bridged не работает):** используйте **NAT** + Port Forwarding (настроим в разделе 6).

#### Display

- **Video Memory:** 16 MB (минимум для Server)
- **Graphics Controller:** VMSVGA

---

## 4. Установка Ubuntu Server

Запустите VM (Start) и следуйте мастеру установки:

### Экран 1: Язык

- Выберите **English** (рекомендуется для совместимости с документацией)

### Экран 2: Keyboard Configuration

- **Layout:** English (US) или ваша раскладка

### Экран 3: Type of Install

- Выберите **Ubuntu Server** (не minimized)

### Экран 4: Network Connections

- Должен отобразиться интерфейс **enp0s3** с автоматически полученным IP (через DHCP)
- Если IP не получен:
  - Выберите интерфейс → Edit IPv4 → Automatic (DHCP)
- **Запишите IP-адрес** (например, `192.168.1.50`) — понадобится для SSH

### Экран 5: Proxy

- Оставьте пустым (если не используете прокси)

### Экран 6: Mirror Address

- Оставьте по умолчанию (официальное зеркало Ubuntu)

### Экран 7: Guided Storage Configuration

- **Use an entire disk:**
  - ✅ VBOX_HARDDISK (100 GB)
- **Set up this disk as an LVM group:** ✅ (рекомендуется)
- Подтвердите разметку → Continue

### Экран 8: Profile Setup

| Поле | Значение | Комментарий |
|---|---|---|
| **Your name** | `k8suser` | Имя пользователя |
| **Server's name** | `k8s-server` | Hostname |
| **Pick a username** | `k8suser` | Логин |
| **Choose a password** | `<strong-password>` | Надёжный пароль |

### Экран 9: SSH Setup

- ✅ **Install OpenSSH server**
- ❌ **Import SSH identity:** No (настроим позже)

### Экран 10: Featured Server Snaps

- ❌ Ничего не выбирайте (установим вручную позже)

### Завершение установки

- Дождитесь завершения установки (~5-10 минут)
- После сообщения **"Install complete!"** нажмите **Reboot Now**
- **Важно:** извлеките ISO-образ:
  - Devices → Optical Drives → Remove disk from virtual drive

VM перезагрузится и покажет приглашение входа:

```
k8s-server login: _
```

---

## 5. Первичная настройка системы

Войдите в систему:

```
login: k8suser
password: <ваш-пароль>
```

### 5.1 Обновление системы

```bash
sudo apt update && sudo apt upgrade -y
```

### 5.2 Установка базовых утилит

```bash
sudo apt install -y \
  curl \
  wget \
  git \
  vim \
  net-tools \
  htop \
  ca-certificates \
  gnupg \
  lsb-release
```

### 5.3 Настройка статического IP (опционально, рекомендуется)

Чтобы IP VM не менялся при перезагрузке:

```bash
# Узнать текущий IP и интерфейс
ip addr show

# Пример вывода:
# 2: enp0s3: inet 192.168.1.50/24
```

Редактируем netplan:

```bash
sudo vim /etc/netplan/00-installer-config.yaml
```

Замените содержимое на (подставьте ваши значения):

```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    enp0s3:
      addresses:
        - 192.168.1.50/24    # Ваш желаемый статический IP
      routes:
        - to: default
          via: 192.168.1.1    # IP вашего роутера (gateway)
      nameservers:
        addresses:
          - 8.8.8.8
          - 8.8.4.4
```

Применяем:

```bash
sudo netplan apply

# Проверка
ip addr show enp0s3
```

### 5.4 Настройка hostname (опционально)

Если хотите изменить имя сервера:

```bash
sudo hostnamectl set-hostname k8s-server
```

---

## 6. Настройка сети

### Вариант A: Bridged Adapter (рекомендуется)

Если вы выбрали **Bridged Adapter** в настройках VirtualBox:

- VM получит IP в вашей локальной сети (например, `192.168.1.50`)
- Доступ с хост-машины: прямое подключение по IP
- Никаких дополнительных настроек не требуется

**Проверка:**

На хост-машине (Windows PowerShell):

```powershell
ping 192.168.1.50
```

Если пинг идёт — всё работает. Переходите к разделу 7.

### Вариант Б: NAT + Port Forwarding

Если **Bridged Adapter** не работает (например, в корпоративной сети):

1. Выключите VM
2. Settings → Network → Adapter 1:
   - **Attached to:** NAT
3. **Advanced → Port Forwarding** → добавьте правила:

| Имя | Протокол | Host IP | Host Port | Guest IP | Guest Port |
|---|---|---|---|---|---|
| SSH | TCP | 127.0.0.1 | 2222 | (пусто) | 22 |
| HTTP | TCP | 127.0.0.1 | 8081 | (пусто) | 80 |
| K8s API | TCP | 127.0.0.1 | 6443 | (пусто) | 6443 |
| Jenkins | TCP | 127.0.0.1 | 8090 | (пусто) | 8080 |

Теперь доступ будет через:
- SSH: `ssh k8suser@localhost -p 2222`
- HTTP: `http://localhost:8081`
- K8s API: `https://localhost:6443`

---

## 7. Доступ по SSH с хост-машины

### 7.1 Подключение (Bridged Adapter)

На хост-машине (Windows PowerShell или WSL):

```bash
ssh k8suser@192.168.1.50
```

При первом подключении подтвердите fingerprint (yes).

### 7.2 Подключение (NAT)

```bash
ssh k8suser@localhost -p 2222
```

### 7.3 Настройка SSH-ключей (рекомендуется)

На хост-машине (PowerShell или WSL):

```bash
# Генерация ключа (если ещё не создан)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Копирование ключа на VM
ssh-copy-id k8suser@192.168.1.50
# Или для NAT:
# ssh-copy-id -p 2222 k8suser@localhost
```

Теперь можно подключаться без пароля.

---

## 8. Установка необходимого ПО

Подключитесь к VM по SSH и выполните:

### 8.1 Docker

```bash
# Установка Docker (официальный скрипт)
curl -fsSL https://get.docker.com | sh

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER

# Применение изменений (или перелогиньтесь)
newgrp docker

# Проверка
docker --version
docker run hello-world
```

### 8.2 Увеличение лимитов системы (для Kubernetes)

```bash
# Увеличение лимитов открытых файлов
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
echo "fs.inotify.max_user_instances=512" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Отключение swap (требование Kubernetes)
sudo swapoff -a
sudo sed -i '/ swap / s/^/#/' /etc/fstab
```

### 8.3 Установка kubectl (опционально, на VM)

Если хотите управлять кластером прямо с VM:

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
kubectl version --client
```

---

## 9. Проверка готовности

Убедитесь, что всё готово к установке k3s:

```bash
# 1. Версия Ubuntu
lsb_release -a
# Ожидается: Ubuntu 22.04.x LTS

# 2. Ресурсы
free -h
# Ожидается: Total > 7.5 GB
df -h
# Ожидается: свободно > 70 GB на /

# 3. Docker
docker ps
# Должно выполниться без ошибок

# 4. Сеть
ping -c 3 google.com
# Должно пройти успешно

# 5. Открытые порты
sudo ss -tuln | grep -E ':(22|80|443|6443|8080)'
# Порт 22 должен быть занят (SSH), остальные свободны
```

---

## 10. Переход к развертыванию

Теперь VM готова! Переходите к основному руководству:

```bash
# На VM выполните команды из DEPLOYMENT.md, начиная с раздела 4:
cd ~
```

Следуйте инструкциям в файле **`DEPLOYMENT.md`**:

1. **Раздел 4:** Установка k3s
2. **Раздел 5:** Настройка kubectl на хост-машине (Windows)
   - Скопируйте kubeconfig с VM: `sudo cat /etc/rancher/k3s/k3s.yaml`
   - Замените `127.0.0.1` на **IP вашей VM** (`192.168.1.50` или `localhost:6443` для NAT)
3. **Раздел 6-9:** Деплой приложений

### Доступ к сервисам после развертывания

После применения всех манифестов из `DEPLOYMENT.md`:

- **Frontend:** `http://192.168.1.50` (или `http://localhost:8080` для NAT)
- **Backend API:** `http://192.168.1.50/api`
- **Contact-me API:** `http://192.168.1.50/api/contact`
- **Jenkins:** `http://192.168.1.50:8080` (или `http://localhost:8090` для NAT)
- **K8s API:** `https://192.168.1.50:6443`

---

## 11. Полезные советы

### 11.1 Управление VM

```bash
# Выключение VM (из консоли VM)
sudo poweroff

# Перезагрузка
sudo reboot

# Проверка аптайма
uptime
```

### 11.2 Мониторинг ресурсов

```bash
# CPU и память в реальном времени
htop

# Использование диска
df -h

# Топ процессов по памяти
ps aux --sort=-%mem | head -n 10
```

### 11.3 Логи системы

```bash
# Журнал системы (systemd)
sudo journalctl -xe

# Логи конкретного сервиса
sudo journalctl -u k3s -f

# Логи Docker
docker logs <container-id>
```

### 11.4 Ускорение работы с SSH

Создайте файл `~/.ssh/config` на хост-машине (Windows):

```
# Для Bridged Adapter
Host k8s
  HostName 192.168.1.50
  User k8suser
  IdentityFile ~/.ssh/id_ed25519

# Для NAT
Host k8s-nat
  HostName localhost
  Port 2222
  User k8suser
  IdentityFile ~/.ssh/id_ed25519
```

Теперь подключение: `ssh k8s` или `ssh k8s-nat`

### 11.5 Расширение диска VM (если закончилось место)

Если 100 GB оказалось мало:

1. Выключите VM
2. VirtualBox → Tools → Virtual Media Manager → выберите диск → увеличьте размер (например, до 150 GB)
3. Запустите VM и выполните:

```bash
# Расширение LVM
sudo lvextend -l +100%FREE /dev/ubuntu-vg/ubuntu-lv
sudo resize2fs /dev/ubuntu-vg/ubuntu-lv

# Проверка
df -h
```

---

## 12. Резервное копирование

### 12.1 Snapshot VM

Перед критическими изменениями создавайте снимки состояния:

1. VirtualBox → выберите VM (выключенную или запущенную)
2. Machine → Take Snapshot
3. **Имя:** `before-k3s-install` или `working-state`

Откат: Machine → Restore Snapshot

### 12.2 Экспорт VM

Для переноса VM на другой компьютер:

1. File → Export Appliance
2. Выберите VM → Next
3. **Format:** OVF 2.0 (совместимость с другими гипервизорами)
4. Сохраните `.ova` файл

---

## Структура дальнейших действий

```
┌──────────────────────────────────────┐
│  1. Создание VM (этот файл)          │
│     VM-SETUP.md                      │
│     └─► Готова VM с Ubuntu 22.04    │
└──────────────────────────────────────┘
              ▼
┌──────────────────────────────────────┐
│  2. Развертывание K8s                │
│     DEPLOYMENT.md                    │
│     ├─► k3s установлен               │
│     ├─► Приложения задеплоены        │
│     └─► Jenkins настроен             │
└──────────────────────────────────────┘
```

---

## Частые проблемы

### Проблема: VM не получает IP (DHCP)

**Решение:**
1. Проверьте, что сетевой адаптер включён (Settings → Network → Enable Network Adapter)
2. Попробуйте другой тип подключения (Bridged → NAT или наоборот)
3. Перезапустите сеть в VM:
   ```bash
   sudo netplan apply
   ```

### Проблема: Не могу подключиться по SSH

**Решение:**
1. Проверьте, что SSH-сервер запущен в VM:
   ```bash
   sudo systemctl status ssh
   ```
2. Проверьте firewall:
   ```bash
   sudo ufw status
   # Если активен:
   sudo ufw allow 22/tcp
   ```
3. Для NAT: проверьте Port Forwarding в настройках VirtualBox

### Проблема: VM тормозит / зависает

**Решение:**
1. Увеличьте RAM VM (8 GB → 12 GB)
2. Увеличьте количество CPU (4 → 6)
3. Проверьте, что на хост-машине не запущены другие тяжёлые приложения
4. Включите VT-x/AMD-V в BIOS

### Проблема: Не хватает места на диске

**Решение:**
1. Очистите Docker:
   ```bash
   docker system prune -a --volumes
   ```
2. Удалите старые snap-пакеты:
   ```bash
   sudo snap list --all | awk '/disabled/{print $1, $3}' | while read snapname revision; do sudo snap remove "$snapname" --revision="$revision"; done
   ```
3. Расширьте диск VM (см. раздел 11.5)

---

**Готово!** Ваша VM настроена и готова к установке K8s-кластера по инструкции из `DEPLOYMENT.md`.

Если возникнут вопросы — используйте комбинацию:
- `journalctl -xe` — для логов системы
- `kubectl logs <pod>` — для логов в K8s
- `docker logs <container>` — для логов Docker-контейнеров
