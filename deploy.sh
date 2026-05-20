#!/bin/bash
set -e

# =============================================
# deploy.sh — Build, push, and deploy to GKE
# =============================================

# ---- Configuration (update these values) ----
PROJECT_ID="${GCP_PROJECT_ID:-your-gcp-project-id}"
ZONE="${GCP_ZONE:-us-central1}"
CLUSTER_NAME="${GKE_CLUSTER_NAME:-app-cluster}"
NAMESPACE="user-management"

BACKEND_IMAGE="gcr.io/${PROJECT_ID}/backend:latest"
FRONTEND_IMAGE="gcr.io/${PROJECT_ID}/frontend:latest"

echo "============================================="
echo "  Deploying to GKE"
echo "  Project: ${PROJECT_ID}"
echo "  Cluster: ${CLUSTER_NAME}"
echo "  Zone:    ${ZONE}"
echo "============================================="

# ---- Step 1: Build Docker images ----
echo ""
echo "[1/5] Building Docker images..."

docker build -t "${BACKEND_IMAGE}" ./backend
echo "  ✔ Backend image built"

docker build -t "${FRONTEND_IMAGE}" ./frontend
echo "  ✔ Frontend image built"

# ---- Step 2: Push images to GCR ----
echo ""
echo "[2/5] Pushing images to Google Container Registry..."

# Authenticate Docker with GCR using gcloud access token
gcloud auth print-access-token | docker login -u oauth2accesstoken --password-stdin gcr.io
echo "  ✔ Docker authenticated with GCR"

docker push "${BACKEND_IMAGE}"
echo "  ✔ Backend image pushed"

docker push "${FRONTEND_IMAGE}"
echo "  ✔ Frontend image pushed"

# ---- Step 3: Connect to GKE cluster ----
echo ""
echo "[3/5] Connecting to GKE cluster..."

gcloud container clusters get-credentials "${CLUSTER_NAME}" \
  --zone "${ZONE}" \
  --project "${PROJECT_ID}"
echo "  ✔ Connected to cluster"

# ---- Step 4: Update image references in manifests ----
echo ""
echo "[4/5] Applying Kubernetes manifests..."

# Replace image placeholders with actual image names
sed -i "s|BACKEND_IMAGE_PLACEHOLDER|${BACKEND_IMAGE}|g" k8s/backend/deployment.yaml
sed -i "s|FRONTEND_IMAGE_PLACEHOLDER|${FRONTEND_IMAGE}|g" k8s/frontend/deployment.yaml

# Apply manifests in order
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/

# Restore placeholders for future runs
sed -i "s|${BACKEND_IMAGE}|BACKEND_IMAGE_PLACEHOLDER|g" k8s/backend/deployment.yaml
sed -i "s|${FRONTEND_IMAGE}|FRONTEND_IMAGE_PLACEHOLDER|g" k8s/frontend/deployment.yaml

echo "  ✔ All manifests applied"

# Restart deployments to pull latest images
kubectl rollout restart deployment/backend -n "${NAMESPACE}"
kubectl rollout restart deployment/frontend -n "${NAMESPACE}"
echo "  ✔ Deployments restarted"

# ---- Step 5: Wait for external IP ----
echo ""
echo "[5/5] Waiting for frontend external IP..."
echo "  (Press Ctrl+C once you see the external IP)"
echo ""

kubectl get svc frontend-service -n "${NAMESPACE}" -w
