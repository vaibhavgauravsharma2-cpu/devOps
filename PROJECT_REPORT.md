# PROJECT REPORT

## MERN Ecommerce DevOps Pipeline
### CI/CD with Jenkins · Docker · Kubernetes · Prometheus · Grafana

---

**Student Name:** *(Your Name)*  
**Roll Number:** *(Your Roll No)*  
**Subject:** DevOps / Cloud Computing  
**Academic Year:** 2025–26  
**Institution:** *(College Name)*  
**Submission Date:** *(Date)*  
**GitHub Repository:** https://github.com/vaibhavgauravsharma2-cpu/devOps

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Objectives](#2-project-objectives)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Application Overview](#5-application-overview)
6. [Docker Implementation](#6-docker-implementation)
7. [Jenkins CI/CD Pipeline](#7-jenkins-cicd-pipeline)
8. [Kubernetes Deployment](#8-kubernetes-deployment)
9. [Monitoring: Prometheus & Grafana](#9-monitoring-prometheus--grafana)
10. [Testing Strategy](#10-testing-strategy)
11. [Security Practices](#11-security-practices)
12. [Challenges and Solutions](#12-challenges-and-solutions)
13. [Results and Outcomes](#13-results-and-outcomes)
14. [Future Improvements](#14-future-improvements)
15. [References](#15-references)

---

## 1. Executive Summary

This project implements a complete, industry-standard DevOps pipeline for a full-stack MERN (MongoDB, Express, React, Node.js) ecommerce web application. The pipeline automates every phase of the software delivery lifecycle — from source code management through automated testing, containerisation, image publication, orchestration, and live monitoring.

The core objective is to eliminate manual deployment errors, reduce delivery time, and provide operational visibility. The pipeline is triggered automatically on every code push, builds and tests the application, packages it in Docker containers, pushes images to Docker Hub, deploys to a Kubernetes cluster, and displays live metrics in a Grafana dashboard sourced from Prometheus.

---

## 2. Project Objectives

| # | Objective | Status |
|---|---|---|
| 1 | Containerise the full-stack MERN application with Docker | ✅ Done |
| 2 | Build an 11-stage Jenkins declarative CI/CD pipeline | ✅ Done |
| 3 | Deploy to Kubernetes (minikube) with health probes and scaling | ✅ Done |
| 4 | Integrate Prometheus metrics collection from the Node.js server | ✅ Done |
| 5 | Visualise metrics in a pre-configured Grafana dashboard | ✅ Done |
| 6 | Maintain a versioned Git history with every change committed | ✅ Done |
| 7 | Write automated tests covering server and client layers | ✅ Done |

---

## 3. Technology Stack

| Category | Technology | Version | Purpose |
|---|---|---|---|
| Frontend | React.js | 16.x | Single-page UI |
| Backend | Node.js + Express | 18.x / 4.x | REST API server |
| Database | MongoDB | 4.4 | Document store |
| Package Manager | npm | 8.x | Dependency management |
| Version Control | Git + GitHub | 2.44 | Source code repository |
| Containerisation | Docker + Docker Compose | 24.x | Image build and multi-service orchestration |
| CI/CD Server | Jenkins | 2.x LTS | Pipeline automation |
| Orchestration | Kubernetes (minikube) | 1.28 | Container scheduling and scaling |
| Metrics Collection | Prometheus | 2.47 | Time-series metrics scraping |
| Metrics Visualisation | Grafana | 10.1 | Dashboard and alerting |
| Metrics SDK | prom-client | 14.x | Node.js Prometheus instrumentation |
| Web Server | Nginx | 1.25 (alpine) | Static file serving for React build |
| Process Manager | nodemon | 1.19 | Dev-mode auto-restart |

---

## 4. System Architecture

### 4.1 High-Level DevOps Architecture

```
Developer Workstation
        │
        │  git push
        ▼
  GitHub Repository
  (vaibhavgauravsharma2-cpu/devOps)
        │
        │  Webhook / Manual trigger
        ▼
  ┌─────────────────────────────────────────────┐
  │             Jenkins Pipeline                 │
  │  1. Checkout → 2. Install → 3. Build         │
  │  4. Test → 5. Lint → 6. Docker Build         │
  │  7. Docker Validate → 8. Registry Login      │
  │  9. Docker Push → 10. Docker Deploy          │
  │  11. Kubernetes Deploy                        │
  └─────────────────────┬───────────────────────┘
                        │
            ┌───────────┼───────────┐
            ▼           ▼           ▼
       Docker Hub   Docker        Kubernetes
       (images)     Compose       (minikube)
                    (local)
                        │
            ┌───────────┼───────────┐
            ▼           ▼           ▼
         mongo       server       client
        :27017       :3000        :8080
                        │
                        │ /metrics
                        ▼
                  Prometheus :9090
                        │
                        ▼
                  Grafana :3001
```

### 4.2 Kubernetes Namespace Architecture

```
mern-ecommerce namespace
├── StatefulSet:  mern-mongodb       (1 replica, PVC 2Gi)
├── Deployment:   mern-server        (2 replicas, ClusterIP :3000)
├── Deployment:   mern-client        (2 replicas, NodePort :30080)
├── Deployment:   mern-prometheus    (1 replica, NodePort :30090)
├── Deployment:   mern-grafana       (1 replica, NodePort :30030, PVC 1Gi)
├── ConfigMap:    mern-server-config
├── Secret:       mern-server-secrets
├── RBAC:         prometheus-sa → prometheus-clusterrole
└── Ingress:      mern-ingress (optional)
```

---

## 5. Application Overview

The application is a full-stack MERN ecommerce platform with:

- **Frontend (React):** Product catalogue, shopping cart, user authentication, merchant dashboard, admin panel
- **Backend (Express):** RESTful API with JWT authentication, product/order/user management, Passport.js OAuth support
- **Database (MongoDB):** Stores users, products, brands, categories, orders, carts

### Entry Points

| Layer | Command | Port |
|---|---|---|
| Client (dev) | `npm run dev` in `client/` | 8080 |
| Server (dev) | `npm run dev` in `server/` | 3000 |
| MongoDB | `mongod --dbpath D:\tools\mongodb\data` | 27017 |
| Metrics | — | `GET /metrics` on :3000 |
| Health | — | `GET /health` on :3000 |

---

## 6. Docker Implementation

### 6.1 Multi-Stage Dockerfile — Client

The React frontend uses a **two-stage build**:

1. **Stage 1 (builder):** `node:18-bullseye` — installs npm dependencies, runs `npm run build` to produce a static `dist/` folder
2. **Stage 2 (production):** `nginx:1.25-alpine` — serves the compiled static files

Benefits: final image contains no Node.js, no source code, no dev dependencies. Only the ~27MB nginx image plus the compiled bundle.

```dockerfile
FROM node:18-bullseye AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN NODE_OPTIONS=--openssl-legacy-provider npm run build

FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
...
```

### 6.2 Dockerfile — Server

The Express server uses a **single-stage build** on `node:18-bullseye-slim` (slim for smaller size, not alpine — alpine lacks native module support for some npm packages):

- Runs as `USER node` (non-root, security best practice)
- Installs only `--production` dependencies
- Includes a Docker HEALTHCHECK calling `/health`

### 6.3 Docker Compose

`docker-compose.yml` orchestrates 5 services:

| Service | Image | Port | Notes |
|---|---|---|---|
| mongo | `mongo:4.4` | 27017 | Named volume, healthcheck |
| server | Built from `./server` | 3000 | Depends on mongo health |
| client | Built from `./client` | 8080 | Depends on server |
| prometheus | `prom/prometheus:v2.47.0` | 9090 | Config from `monitoring/prometheus.yml` |
| grafana | `grafana/grafana:10.1.0` | 3001 | Auto-provisioned datasource + dashboard |

### 6.4 Image Naming Convention

```
<DOCKERHUB_USERNAME>/mern-server:<BUILD_NUMBER>-<GIT_COMMIT_SHORT>
<DOCKERHUB_USERNAME>/mern-client:<BUILD_NUMBER>-<GIT_COMMIT_SHORT>
```

Both tagged as `:latest` additionally for quick pull.

---

## 7. Jenkins CI/CD Pipeline

### 7.1 Pipeline Overview

The `Jenkinsfile` defines an 11-stage **Declarative Pipeline** triggered by:
- Manual "Build Now"
- GitHub webhook on push to `main`

### 7.2 Stage-by-Stage Explanation

| Stage | What it does | Fails pipeline if? |
|---|---|---|
| **1. Checkout** | `checkout scm` — pulls latest code from GitHub | Git unreachable |
| **2. Dependency Installation** | `npm install` in root, server, client | npm install fails |
| **3. Build** | Webpack build of React client (`npm run build`) | Build errors |
| **4. Test** | `npm test` — 9 automated tests across server + client | Any test fails |
| **5. Code Quality** | `npm run lint` — ESLint + syntax check | Lint errors (configurable) |
| **6. Docker Build** | `docker build` for server + client images, tagged with build number | Build error |
| **7. Docker Validate** | `docker inspect` — verifies image exists and has correct labels | Image missing |
| **8. Registry Login** | `docker login` using Jenkins credentials (never in plain text) | Bad credentials |
| **9. Docker Push** | Pushes `:<tag>` and `:latest` images to Docker Hub | Network error |
| **10. Deployment** | `docker compose up -d` — starts all 5 services | Compose error |
| **11. K8s Deploy** | `kubectl apply -f k8s/` — deploys to minikube | kubectl unreachable |

### 7.3 CI vs CD

| Term | Meaning | In this Project |
|---|---|---|
| **Continuous Integration (CI)** | Automatically build and test every commit | Stages 1–7 |
| **Continuous Delivery (CD)** | Automatically produce a deployable artefact | Stage 8–9 (push to registry) |
| **Continuous Deployment (CD+)** | Automatically deploy to environment | Stages 10–11 |

### 7.4 Credentials Management

- Docker Hub credentials stored in Jenkins Credential Store (type: *Username with Password*)
- Referenced in pipeline as `withCredentials([usernamePassword(credentialsId: ...)])`
- Never printed or logged — Jenkins masks them automatically

### 7.5 Pipeline Parameters

| Parameter | Default | Purpose |
|---|---|---|
| `DOCKERHUB_USERNAME` | `vaibhavsharma` | Registry namespace |
| `DOCKERHUB_CREDENTIALS_ID` | `dockerhub-credentials` | Jenkins cred ID |
| `RUN_TESTS` | `true` | Skip tests for hotfixes |
| `PUSH_TO_REGISTRY` | `true` | Skip push on dry runs |
| `DEPLOY_LOCAL` | `true` | Skip deploy on build-only runs |

---

## 8. Kubernetes Deployment

### 8.1 Why Kubernetes?

Docker Compose is suitable for single-host deployments. Kubernetes adds:
- **Self-healing:** crashed pods restart automatically
- **Horizontal scaling:** `kubectl scale deployment mern-server --replicas=3`
- **Rolling updates:** zero-downtime deployments
- **Service discovery:** built-in DNS between services
- **Resource limits:** CPU/memory quotas per container

### 8.2 Kubernetes Objects Used

| Object | Purpose |
|---|---|
| **Namespace** | Isolates all project resources under `mern-ecommerce` |
| **StatefulSet** | MongoDB — maintains stable storage and identity |
| **Deployment** | Server, Client, Prometheus, Grafana — stateless rolling updates |
| **Service (ClusterIP)** | Internal service discovery (mongo → server) |
| **Service (NodePort)** | External access via minikube IP on fixed ports |
| **ConfigMap** | Non-secret environment variables for server |
| **Secret** | JWT_SECRET — base64-encoded in cluster |
| **PersistentVolumeClaim** | MongoDB data and Grafana state persistence |
| **ServiceAccount + RBAC** | Prometheus permission to read cluster metadata |
| **Ingress** | Optional: domain-based routing (requires nginx ingress controller) |

### 8.3 Health Probes

Every Deployment includes:
- **livenessProbe** — kills and restarts pod if the check fails (HTTP GET `/health`)
- **readinessProbe** — removes pod from service until it passes (prevents traffic to starting pods)

### 8.4 Resource Requests and Limits

| Container | CPU Request | CPU Limit | Memory Request | Memory Limit |
|---|---|---|---|---|
| mern-server | 100m | 500m | 128Mi | 512Mi |
| mern-client | 50m | 200m | 64Mi | 256Mi |
| mern-prometheus | 100m | 500m | 256Mi | 512Mi |
| mern-grafana | 100m | 500m | 256Mi | 512Mi |

---

## 9. Monitoring: Prometheus & Grafana

### 9.1 Prometheus

Prometheus is a pull-based metrics system. It scrapes (polls) the `/metrics` HTTP endpoint every 15 seconds and stores time-series data.

**Custom metrics exposed by the MERN server (`server/utils/metrics.js`):**

| Metric Name | Type | Description |
|---|---|---|
| `http_request_duration_seconds` | Histogram | Duration of each HTTP request (p50, p95, p99) |
| `http_requests_total` | Counter | Total requests by method, route, status code |
| `active_connections` | Gauge | Current open TCP connections |
| `mongodb_connection_status` | Gauge | 1 = connected, 0 = disconnected |

**Default Node.js metrics (from prom-client):**

- `nodejs_heap_size_used_bytes` — JS heap memory
- `nodejs_heap_size_total_bytes` — total heap allocated
- `process_cpu_seconds_total` — CPU time consumed
- `nodejs_gc_duration_seconds` — garbage collection pauses

### 9.2 Grafana Dashboard

The dashboard (`monitoring/grafana/provisioning/dashboards/mern-dashboard.json`) is auto-provisioned with 8 panels:

| Panel | Query | What it shows |
|---|---|---|
| HTTP Request Rate | `rate(http_requests_total[5m])` | Requests per second |
| Response Latency | `histogram_quantile(0.95, ...)` | p95 latency in seconds |
| MongoDB Status | `mongodb_connection_status` | Green = UP, Red = DOWN |
| Active Connections | `active_connections` | Current connections count |
| Heap Used | `nodejs_heap_size_used_bytes` | JS memory pressure |
| CPU Usage | `rate(process_cpu_seconds_total[1m])` | CPU % per minute |
| Memory Over Time | Heap used + total over time graph | Memory trend |
| Requests/min | `increase(http_requests_total[1m])` | Request volume breakdown |

### 9.3 Access URLs

| Service | URL | Login |
|---|---|---|
| Prometheus | `http://localhost:9090` | None |
| Grafana | `http://localhost:3001` | admin / admin123 |
| Raw Metrics | `http://localhost:3000/metrics` | None |
| Health Check | `http://localhost:3000/health` | None |

---

## 10. Testing Strategy

### 10.1 Automated Tests

| Test File | Framework | Tests | What is tested |
|---|---|---|---|
| `server/test/server.test.js` | Node built-in `node:test` | 5 | Constants, DB config, queries, models, router |
| `client/test/client.test.js` | Node built-in `node:test` | 4 | package.json, webpack config, HTML template, .env |

**Run with:**
```bash
npm test          # runs all 9 tests
npm run test:server  # server tests only
npm run test:client  # client tests only
```

### 10.2 Test Results

```
▶ server
  ✓ Constants are correctly defined (1.2ms)
  ✓ DB configuration is correct (0.3ms)
  ✓ Queries module exports exist (0.4ms)
  ✓ User model is constructable (0.5ms)
  ✓ Express router is mountable (0.8ms)
▶ client
  ✓ package.json has required fields (0.2ms)
  ✓ Webpack config exists (0.1ms)
  ✓ HTML template exists (0.1ms)
  ✓ .env.example exists (0.1ms)

ℹ tests 9
ℹ pass 9
ℹ fail 0
```

---

## 11. Security Practices

| Practice | Implementation |
|---|---|
| Non-root container user | `USER node` in server Dockerfile |
| No secrets in Git | `.env` in `.gitignore`; use `.env.example` with placeholders |
| Jenkins credentials store | Docker Hub token stored as Jenkins credential, accessed via `withCredentials` |
| Kubernetes secrets | JWT_SECRET stored as `kind: Secret`, not in ConfigMap |
| Read-only config mounts | Prometheus and Grafana config volumes mounted `:ro` |
| Minimal base images | `node:18-bullseye-slim` (server), `nginx:1.25-alpine` (client) |
| `.dockerignore` | Excludes `node_modules`, `.env`, `*.log`, `dist`, `.git` from Docker context |

---

## 12. Challenges and Solutions

| Challenge | Root Cause | Solution Applied |
|---|---|---|
| `NODE_OPTIONS=--openssl-legacy-provider` required | Node 18's OpenSSL 3 is incompatible with Webpack 4's MD4 hash | Added to all client build scripts and Dockerfile ARG |
| `git` not in PATH | No system Git installed, no admin rights | Downloaded portable MinGit zip to `D:\tools\git` |
| `git push` upstream error | New branch with no tracking reference | Set `branch.main.remote` and `branch.main.merge` in `.git/config` |
| `MERCHANT_STATUS.Waiting_Approval` test failure | Constant value has a space: `'Waiting Approval'` not `'Waiting_Approval'` | Fixed test assertion to match actual value |
| MongoDB container health check syntax | `mongo` CLI differs between MongoDB 4.x and 5.x+ | Used `mongo --eval 'db.runCommand("ping")'` compatible with 4.4 |
| Prometheus port conflict | Grafana's internal port 3000 conflicts with Express | Mapped Grafana to host port 3001 (`3001:3000`) |
| Windows CMD drive switch | `cd D:\MERNSTACK` does not switch drive in CMD | Used `cd /d D:\MERNSTACK` |
| Background tasks stopped on system restart | Server restart killed daemon processes | Restarted MongoDB, nodemon, and webpack-dev-server daemons |

---

## 13. Results and Outcomes

| Deliverable | Status | Evidence |
|---|---|---|
| Git repository with 10+ commits | ✅ | github.com/vaibhavgauravsharma2-cpu/devOps |
| 9/9 automated tests passing | ✅ | `npm test` output |
| Server `/health` endpoint | ✅ | `curl http://localhost:3000/health` → `{"status":"ok"}` |
| Prometheus `/metrics` endpoint | ✅ | `curl http://localhost:3000/metrics` → prom-format |
| Dockerfile (client + server) | ✅ | Multi-stage, non-root, healthcheck |
| docker-compose.yml (5 services) | ✅ | mongo, server, client, prometheus, grafana |
| Jenkinsfile (11 stages) | ✅ | Declarative, parameterised, credentials-safe |
| Kubernetes manifests (6 files) | ✅ | namespace, mongo, server, client, prometheus, grafana |
| Grafana dashboard JSON | ✅ | Auto-provisioned, 8 panels |
| Project documentation | ✅ | This report + DEVOPS_PROJECT_GUIDE.md + KUBERNETES_SETUP.md |

---

## 14. Future Improvements

1. **Helm Charts** — Package all Kubernetes manifests as a Helm chart for repeatable, versioned deployments
2. **ArgoCD / GitOps** — Replace `kubectl apply` in Jenkinsfile with GitOps-style CD (ArgoCD watching the repo)
3. **Horizontal Pod Autoscaler (HPA)** — Auto-scale `mern-server` pods based on CPU/request rate
4. **Grafana Alerts** — Configure alert rules to notify on MongoDB downtime or p95 latency > 1s
5. **TLS/HTTPS** — cert-manager + Let's Encrypt for HTTPS on the Ingress
6. **Jest/Mocha Tests** — Expand test coverage with proper unit and integration tests
7. **SonarQube Integration** — Replace basic lint with full static analysis in the pipeline
8. **Multi-environment Pipelines** — Separate dev, staging, production branches with promotion gates

---

## 15. References

1. Jenkins Documentation — https://www.jenkins.io/doc/book/pipeline/
2. Docker Official Documentation — https://docs.docker.com/
3. Kubernetes Documentation — https://kubernetes.io/docs/
4. Prometheus Documentation — https://prometheus.io/docs/
5. Grafana Documentation — https://grafana.com/docs/
6. prom-client npm package — https://github.com/siimon/prom-client
7. MERN Stack Guide — https://www.mongodb.com/mern-stack
8. minikube Documentation — https://minikube.sigs.k8s.io/docs/
9. Node.js Test Runner — https://nodejs.org/api/test.html
10. Docker Compose Reference — https://docs.docker.com/compose/compose-file/

---

*This report was prepared as part of the DevOps subject evaluation. All pipeline code, configuration files, and documentation are committed to the GitHub repository listed above.*
