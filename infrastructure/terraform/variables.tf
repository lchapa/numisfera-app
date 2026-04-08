variable "project_id" {
  description = "El ID del Proyecto en Google Cloud Platform"
  type        = string
  default     = "numisfera-mx-prod-1234" # Cambia esto por tu Project ID real
}

variable "region" {
  description = "Region donde se desplegará la infraestructura"
  type        = string
  default     = "us-central1"
}

variable "db_password" {
  description = "Contraseña maestra para Cloud SQL MySQL"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "La firma de seguridad para tus Web Tokens de Spring Boot"
  type        = string
  sensitive   = true
}
