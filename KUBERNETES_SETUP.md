# Kubernetes Setup Guide — MERN Ecommerce DevOps Project

## Prerequisites

| Requirement | Version | Install Command |
|---|---|---|
| Docker Desktop | 4.x+ | Download from docker.com |
| kubectl | 1.28+ | `winget install Kubernetes.kubectl` |
| minikube | 1.31+ | `winget install Kubernetes.minikube` |

---

## Step 1 — Install kubectl

```powershell
winget install Kubernetes.kubectl
# Verify
kubectl version --client
```

---

## Step 2 — Install minikube

```powershell
winget install Kubernetes.minikube
# Verify
minikube version
```

---

## Step 3 — Start minikube (requires Docker Desktop running)

```powershell
# Start with Docker driver (recommended on Windows)
minikube start --driver=docker --memory=4096 --cpus=2

# Verify cluster is running
minikube status
kubectl get nodes
```

Expected output:
```
NAME       STATUS   ROLES           AGE   VERSION
minikube   Ready    control-plane   1m    v1.28.x
```

---

## Step 4 — Enable Ingress addon (optional, for domain routing)

```powershell
minikube addons enable ingress
kubectl get pods -n ingress-nginx
```

---

## Step 5 — Set your Docker Hub username in the manifests

Before applying, replace `DOCKERHUB_USERNAME` with your actual Docker Hub username:

```powershell
# Windows PowerShell — replace in all k8s files
(Get-Content k8s\server-deployment.yaml) -replace 'DOCKERHUB_USERNAME', 'your-dockerhub-username' | Set-Content k8s\server-deployment.yaml
(Get-Content k8s\client-deployment.yaml) -replace 'DOCKERHUB_USERNAME', 'your-dockerhub-username' | Set-Content k8s\client-deployment.yaml
```

---

## Step 6 — Apply all Kubernetes manifests

```powershell
cd D:\MERNSTACK

# Create namespace first
kubectl apply -f k8s\namespace.yaml

# Deploy all services
kubectl apply -f k8s\mongo-deployment.yaml   -n mern-ecommerce
kubectl apply -f k8s\server-deployment.yaml  -n mern-ecommerce
kubectl apply -f k8s\client-deployment.yaml  -n mern-ecommerce
kubectl apply -f k8s\prometheus-deployment.yaml -n mern-ecommerce
kubectl apply -f k8s\grafana-deployment.yaml    -n mern-ecommerce

# Optional: Apply ingress
kubectl apply -f k8s\ingress.yaml -n mern-ecommerce
```

---

## Step 7 — Verify deployment

```powershell
# Check all pods are Running
kubectl get pods -n mern-ecommerce

# Check services and NodePort assignments
kubectl get svc -n mern-ecommerce

# Watch rollout status
kubectl rollout status deployment/mern-server -n mern-ecommerce
kubectl rollout status deployment/mern-client -n mern-ecommerce
```

Expected:
```
NAME                    READY   STATUS    RESTARTS   AGE
mern-mongodb-0          1/1     Running   0          2m
mern-server-xxx-yyy     1/1     Running   0          1m
mern-client-xxx-yyy     1/1     Running   0          1m
mern-prometheus-xxx     1/1     Running   0          1m
mern-grafana-xxx        1/1     Running   0          1m
```

---

## Step 8 — Access services via minikube

```powershell
# Get the minikube IP
minikube ip

# Open services in browser via minikube
minikube service mern-client-service     -n mern-ecommerce --url
minikube service mern-server-service     -n mern-ecommerce --url
minikube service mern-prometheus-service -n mern-ecommerce --url
minikube service mern-grafana-service    -n mern-ecommerce --url
```

| Service | NodePort | URL (minikube) |
|---|---|---|
| MERN Client (React) | 30080 | `http://<minikube-ip>:30080` |
| Prometheus | 30090 | `http://<minikube-ip>:30090` |
| Grafana | 30030 | `http://<minikube-ip>:30030` |

---

## Step 9 — Access Grafana Dashboard

1. Open `http://<minikube-ip>:30030` in your browser
2. Login: **admin** / **admin123**
3. Go to **Dashboards → MERN → MERN Ecommerce - DevOps Dashboard**
4. Prometheus data source is auto-configured and pointing to `mern-prometheus-service:9090`

---

## Step 10 — Optional: Use minikube tunnel for LoadBalancer types

```powershell
# Run in a separate PowerShell window (requires admin)
minikube tunnel
```

---

## Kubernetes Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                  mern-ecommerce Namespace                 │
│                                                          │
│  ┌──────────┐    ┌──────────┐    ┌─────────────────┐   │
│  │  Client  │───▶│  Server  │───▶│    MongoDB      │   │
│  │  2 pods  │    │  2 pods  │    │  StatefulSet    │   │
│  │ :30080   │    │  :3000   │    │   :27017        │   │
│  └──────────┘    └────┬─────┘    └─────────────────┘   │
│                       │ /metrics                         │
│                  ┌────▼─────┐    ┌─────────────────┐   │
│                  │Prometheus│───▶│    Grafana      │   │
│                  │  :30090  │    │    :30030       │   │
│                  └──────────┘    └─────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

## Common Kubernetes Commands for Demo

```powershell
# Show all resources in namespace
kubectl get all -n mern-ecommerce

# Describe a pod (check events)
kubectl describe pod <pod-name> -n mern-ecommerce

# View pod logs
kubectl logs <pod-name> -n mern-ecommerce

# Scale deployment
kubectl scale deployment mern-server --replicas=3 -n mern-ecommerce

# Check resource usage (requires metrics-server)
minikube addons enable metrics-server
kubectl top pods -n mern-ecommerce

# Delete all resources
kubectl delete namespace mern-ecommerce

# Stop minikube
minikube stop
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `minikube start` fails | Ensure Docker Desktop is running first |
| Pods in `ImagePullBackOff` | Replace `DOCKERHUB_USERNAME` in YAML files with your actual username; push images to Docker Hub first |
| Pods in `CrashLoopBackOff` | Run `kubectl logs <pod> -n mern-ecommerce` to see the error |
| MongoDB pod not ready | Give it 2-3 minutes; the readiness probe waits for mongod to start |
| Grafana shows "No data" | Check that Prometheus is running and scraping `/metrics`; verify the Prometheus datasource URL |
| `kubectl` not found | Run `winget install Kubernetes.kubectl` and restart terminal |
| NodePort not accessible | Use `minikube service <service-name> -n mern-ecommerce --url` instead of direct IP |
