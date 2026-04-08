terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# 1. Cloud Storage - Bucket para almacenar las imagenes de las monedas
resource "google_storage_bucket" "numisfera_images" {
  name          = "${var.project_id}-images"
  location      = "US"
  force_destroy = true # Solo para desarrollo. En prod estricto va false para no perder imagenes accidentalmente.

  uniform_bucket_level_access = true
}

resource "google_storage_bucket_iam_binding" "public_images" {
  bucket = google_storage_bucket.numisfera_images.name
  role   = "roles/storage.objectViewer"
  members = [
    "allUsers",
  ]
}

# 2. Cloud SQL - Base de Datos MySQL
resource "google_sql_database_instance" "numisfera_db_instance" {
  name             = "numisfera-sql-instance"
  database_version = "MYSQL_8_0"
  region           = var.region

  settings {
    tier = "db-f1-micro" # Para costos bajos iniciales
  }
  
  deletion_protection = false # Precaución: En producción real, esto es true (evita borrados accidentales de toda tu BD)
}

resource "google_sql_database" "database" {
  name     = "numisfera_db"
  instance = google_sql_database_instance.numisfera_db_instance.name
}

resource "google_sql_user" "users" {
  name     = "root"
  instance = google_sql_database_instance.numisfera_db_instance.name
  password = var.db_password
}

# 3. Cloud Run - Backend Server (Java Spring Boot)
resource "google_cloud_run_v2_service" "backend" {
  name     = "numisfera-backend-api"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "us-central1-docker.pkg.dev/${var.project_id}/numisfera-repo/backend:latest" # Construido vía CI/CD luego
      
      env {
        name  = "SPRING_PROFILES_ACTIVE"
        value = "prod"
      }
      env {
        name  = "GCP_BUCKET_ID"
        value = google_storage_bucket.numisfera_images.name
      }
      env {
        name  = "CLOUDSQL_DATABASE"
        value = google_sql_database.database.name
      }
      env {
        name  = "CLOUDSQL_INSTANCE"
        value = google_sql_database_instance.numisfera_db_instance.connection_name
      }
      env {
        name  = "DB_PASSWORD"
        value = var.db_password
      }
      env {
        name  = "JWT_SECRET_KEY"
        value = var.jwt_secret
      }
    }
  }
}

# 4. Cloud Run - Frontend Server (React Vite + Nginx)
resource "google_cloud_run_v2_service" "frontend" {
  name     = "numisfera-app"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "us-central1-docker.pkg.dev/${var.project_id}/numisfera-repo/frontend:latest"
    }
  }
}

# 5. Permisos: Permitir acceso público de internet al Cloud Run Backend y Frontend
resource "google_cloud_run_service_iam_binding" "backend_public" {
  location = google_cloud_run_v2_service.backend.location
  service  = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  members  = ["allUsers"]
}

resource "google_cloud_run_service_iam_binding" "frontend_public" {
  location = google_cloud_run_v2_service.frontend.location
  service  = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  members  = ["allUsers"]
}
