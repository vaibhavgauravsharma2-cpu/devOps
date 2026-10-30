# 🛠️ Jenkins & Docker Environment Setup Guide

This guide provides step-by-step instructions to configure **Docker Desktop** and **Jenkins CI/CD Automation Server** to run the pipeline for this project.

---

## 1. Docker Installation & Configuration (Windows)

### Step 1.1: Install Docker Desktop
1. Download Docker Desktop for Windows: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Run the installer and ensure **"Use WSL 2 instead of Hyper-V"** is checked.
3. Restart your computer if prompted.
4. Launch Docker Desktop and accept the service agreements.

### Step 1.2: Verify Docker
Open PowerShell and verify Docker engine and Compose:
```powershell
docker --version
docker compose version
```

---

## 2. Jenkins Installation & Setup

You can run Jenkins using **Method A (Native Windows Service)** or **Method B (Docker Container)**. Method A is simplest on Windows development machines.

### Option A: Jenkins Native on Windows (Recommended for Windows Hosts)

#### Step 2.1: Install Java 17 or 21 (Prerequisite for Jenkins)
Jenkins requires Java 17 or 21:
```powershell
winget install EclipseAdoptium.Temurin.17.JDK
```
Verify Java:
```powershell
java -version
```

#### Step 2.2: Download and Run Jenkins
1. Download the Jenkins generic Java package (`jenkins.war` LTS):
   [https://www.jenkins.io/download/](https://www.jenkins.io/download/)
   Or place it in `D:\tools\jenkins\jenkins.war`.
2. Start Jenkins on port 8081 (to avoid conflict with React client on 8080):
   ```powershell
   java -jar jenkins.war --httpPort=8081
   ```
3. Open your browser at [http://localhost:8081](http://localhost:8081).
4. Copy the initial administrator password displayed in the terminal (or from `C:\Users\<user>\.jenkins\secrets\initialAdminPassword`) and paste it into the Jenkins setup screen.
5. Select **"Install Suggested Plugins"**.
6. Create your admin user account (e.g. `admin` / `admin123`).

---

### Option B: Jenkins Running in Docker (With Secure Docker Socket Access)

> ⚠️ **Security Warning**: Do not blindly mount `/var/run/docker.sock` in untrusted or multi-tenant environments, as any process inside the container effectively gains root privileges on the host Docker daemon. For local college evaluations and development, mounting the socket is standard practice.

Run the official Jenkins LTS image with Docker CLI:
```bash
docker run -d \
  --name jenkins \
  -p 8081:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```

---

## 3. Required Jenkins Plugins

Navigate to **Manage Jenkins** -> **Plugins** -> **Available Plugins** and install:

| Plugin Name | Purpose |
| :--- | :--- |
| **Pipeline** | Core Declarative and Scripted Pipeline capabilities. |
| **Git Plugin** | Clones and inspects GitHub repositories. |
| **Credentials Binding Plugin** | Securely masks and injects credentials (`withCredentials`). |
| **Docker Pipeline** | Allows Jenkins pipeline to build and execute inside Docker containers. |
| **AnsiColor** | Renders colorized console output in pipeline logs. |
| **Timestamper** | Adds timestamps to each pipeline stage log line. |

Restart Jenkins after installing plugins if prompted.

---

## 4. Configuring Docker Hub Credentials in Jenkins

1. Go to **Manage Jenkins** -> **Credentials** -> **System** -> **Global credentials (unrestricted)**.
2. Click **+ Add Credentials**.
3. Configure the following:
   - **Kind**: `Username with password`
   - **Scope**: `Global (Jenkins, nodes, items, all child items, etc)`
   - **Username**: Your Docker Hub username (e.g. `vaibhavgauravsharma2` or `vaibhavsharma`)
   - **Password**: Your Docker Hub **Personal Access Token** (generate from Docker Hub -> Account Settings -> Security -> New Access Token).
   - **ID**: `dockerhub-credentials` *(Must match the ID in the Jenkinsfile)*
   - **Description**: `Docker Hub Registry Credentials`
4. Click **Create**.

---

## 5. Creating & Connecting the Jenkins Pipeline Job

1. On the Jenkins dashboard, click **New Item**.
2. Enter item name: `mern-ecommerce-pipeline`.
3. Select **Pipeline** and click **OK**.
4. In the configuration page, scroll down to the **Pipeline** section:
   - **Definition**: Select `Pipeline script from SCM`.
   - **SCM**: Select `Git`.
   - **Repository URL**: `https://github.com/vaibhavgauravsharma2-cpu/devOps.git`
   - **Credentials**: (None if repository is public; otherwise add GitHub Personal Access Token).
   - **Branch Specifier**: `*/main`
   - **Script Path**: `Jenkinsfile`
5. Click **Save**.

---

## 6. Configuring GitHub Webhook (For Automated Execution)

To trigger the pipeline automatically whenever code is pushed to GitHub:

1. Open your GitHub repository: [https://github.com/vaibhavgauravsharma2-cpu/devOps](https://github.com/vaibhavgauravsharma2-cpu/devOps)
2. Go to **Settings** -> **Webhooks** -> **Add webhook**.
3. **Payload URL**: `http://<your-jenkins-ip-or-ngrok>:8081/github-webhook/`
4. **Content type**: `application/json`
5. **Which events would you like to trigger this webhook?**: Select **Just the push event**.
6. Check **Active** and click **Add webhook**.
7. In your Jenkins Pipeline job configuration, check **"GitHub hook trigger for GITScm polling"** under **Build Triggers**.

*(Note: For localhost testing without a public IP, you can use [ngrok](https://ngrok.com/) via `ngrok http 8081` or run the build manually by clicking **Build Now**).*

---

## 7. Running the Pipeline

### Manual Execution:
1. Go to your pipeline job: `mern-ecommerce-pipeline`.
2. Click **Build with Parameters** in the left sidebar.
3. Review or adjust parameters:
   - `DOCKERHUB_USERNAME`: Your Docker Hub username
   - `DOCKERHUB_CREDENTIALS_ID`: `dockerhub-credentials`
   - `RUN_TESTS`: `true`
   - `PUSH_TO_REGISTRY`: `true`
   - `DEPLOY_LOCAL`: `true`
4. Click **Build**.
5. Watch the build execute across all 11 stages in the **Stage View**.
