# User Management Application

A RESTful web application with Angular frontend, Node.js/Express backend, and PostgreSQL database. Containerized with Docker and deployable to a GCP Kubernetes cluster.

## Project Structure

```
├── frontend/          # Angular 21 application
├── backend/           # Node.js + Express + TypeScript REST API
├── k8s/               # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── postgres/      # PostgreSQL deployment & service
│   ├── backend/       # Backend deployment & service
│   └── frontend/      # Frontend deployment & service
├── deploy.sh          # GKE deployment script
├── docker-compose.yaml # Local development setup
└── README.md
```

## Tech Stack

- **Frontend**: Angular 21, TypeScript
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL 16
- **Containerization**: Docker (multi-stage builds)
- **Orchestration**: Kubernetes (GKE)

## Prerequisites

- Node.js 22+
- Docker & Docker Compose
- Google Cloud SDK (for GKE deployment)
- kubectl

## Local Development

### Option 1: Docker Compose (recommended)

Start all services with a single command:

```bash
docker compose up --build
```

Access the app at **http://localhost**.

### Option 2: Run services individually

**1. Start PostgreSQL:**

```bash
docker run -d --name postgres \
  -e POSTGRES_DB=appdb \
  -e POSTGRES_USER=appuser \
  -e POSTGRES_PASSWORD=apppassword \
  -p 5432:5432 \
  postgres:16-alpine
```

**2. Start Backend:**

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

**3. Start Frontend:**

```bash
cd frontend
npm install
npm start
```

Access the frontend at **http://localhost:4200**. The dev server proxies `/api` to `http://localhost:3000`.

## Default Login Credentials

- **Email**: `admin@app.com`
- **Password**: `admin123`

## API Endpoints

| Method | Path              | Auth | Description         |
|--------|-------------------|------|---------------------|
| POST   | /api/auth/login   | No   | Login, returns JWT  |
| GET    | /api/users        | Yes  | List all users      |
| POST   | /api/users        | Yes  | Create a new user   |
| PUT    | /api/users/:id    | Yes  | Update a user       |
| DELETE | /api/users/:id    | Yes  | Delete a user       |
| GET    | /api/health       | No   | Health check        |

## Configuration

### ConfigMap Variables (non-sensitive)

| Variable | Description     | Default          |
|----------|-----------------|------------------|
| DB_HOST  | Database host   | postgres-service |
| DB_PORT  | Database port   | 5432             |
| DB_NAME  | Database name   | appdb            |
| PORT     | Backend port    | 3000             |

### Secret Variables (sensitive)

| Variable    | Description      |
|-------------|------------------|
| DB_USER     | Database user    |
| DB_PASSWORD | Database password|
| JWT_SECRET  | JWT signing key  |

## GKE Deployment

### Prerequisites

1. A GKE cluster is already running
2. `gcloud` CLI is authenticated
3. Docker is configured to push to GCR: `gcloud auth configure-docker`

### Deploy

```bash
# Set your GCP project ID
export GCP_PROJECT_ID=your-project-id
export GKE_CLUSTER_NAME=your-cluster-name
export GCP_ZONE=us-central1

# Run the deployment script
chmod +x deploy.sh
./deploy.sh
```

The script will:
1. Build Docker images for frontend and backend
2. Push images to Google Container Registry (GCR)
3. Connect to the GKE cluster
4. Apply all Kubernetes manifests (namespace, configmap, secret, deployments, services)
5. Display the external IP of the frontend LoadBalancer

### Verify Deployment

```bash
kubectl get all -n user-management
```

public ip http://34.55.22.220/