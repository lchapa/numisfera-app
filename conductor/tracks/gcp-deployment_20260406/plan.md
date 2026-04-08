# Track: Readiness y Despliegue a Producción en GCP (Cloud Run, Cloud SQL, Terraform, CI/CD)

## Descripción
Transformar el código local monolítico a una Arquitectura de Microservicios orientada a Producción, utilizando Infraestructura como Código (Terraform) y Despliegue en GCP mediante Contenedores (Cloud Run) e integración Web3 Testnet.

## Objetivos (Con miras a Certificación y Negocio)
1. **Containerización (Docker):** Independizar Java y React del hardware donde corran para evitar el síndrome "En mi máquina sí funcionaba".
2. **Cloud Components:** Migrar la persistencia de H2 a Google Cloud SQL (MySQL) y el guardado de imágenes a Google Cloud Storage.
3. **Web3 Testnet (Sepolia):** Configurar y Desplegar el Smart Contract a la red de pruebas pública para habilitar su uso por redes globales de validadores.
4. **Infraestructura como Código (IaC - Terraform):** Estandarizar la creación de servidores. Escribiremos el código imperativo terraform en `.tf` scripts para que la consola de Google auto-genere las bases de datos y la red.
5. **CI/CD Pipeline (GitHub Actions):** Cuando integres nuevas mejoras a la rama `main` de GitHub, GCP escuchará la señal, construirá nuevas imágenes transparentes sin tirar abajo el tráfico de los usuarios (Zero-Downtime Deployment).

## Fases de Acción

### Fase 0: Setup y Resguardo
- [x] **Task:** Inicializar o asociar el proyecto local al repositorio Remoto del Usuario (`https://github.com/lchapa/...`).
- [x] **Task:** Asegurar ignores y validación `git push` limpia.

### Fase 1: Dockerización (Containerización Básica)
- [x] **Task:** Crear `backend/Dockerfile` exponiendo perfiles dinámicos y compresión de librerías fat-jar de Maven.
- [x] **Task:** Crear `frontend/Dockerfile` usando tecnología Multi-Stage (Stage 1: Vite Build, Stage 2: Montaje Servidor Nginx ultra-ligero y reescrituras).
- [x] **Task:** Crear `docker-compose.yml` maestro para orquestar base de datos simulada y ambas terminales de manera sincrónica y probarlo en local ("Validar Ready").

### Fase 2: Configuración de Entornos Específicos para Cloud
- [x] **Task:** Agregar dependencia Google Cloud Storage (`google-cloud-storage`) y MySQL en el `pom.xml`.
- [x] **Task:** Construir Archivo de Propiedades `application-prod.properties` para enlazar variables dinámicas hacia Cloud SQL.
- [x] **Task:** Adaptar la clase lógica de subida de imágenes (File Services) introduciendo condicionales "Si el profile es Prod = GCS; Si es Dev = FS local".

### Fase 3: Hardhat Web3 - Despliegue en Sepolia
- [x] **Task:** Obtener y parametrizar credenciales Alchemy/Infura para testnet y variables secretas en `hardhat.config.js`.
- [x] **Task:** Desplegar el contrato (Dry-Run local en modo Sepolia). Capturar Addresses e inyectarlo en `.env.production` (Variables Prod) de React.

### Fase 4: Cloud Infrastructure (Terraform scripts)
- [x] **Task:** Creación del bosquejo inicial IaC (Infrastructure as Code) definiendo el Bucket Público, la base de datos Cloud SQL y los servicios de Cloud Run. (Módulo Analítico, enseñando la estructura a desplegar).

### Fase 5: GitHub Actions CI/CD y Traspaso
- [ ] **Task:** Programar y comitear el Pipeline (`.github/workflows/deploy.yml`) y enseñar al usuario cómo vincular sus Secretos de Google Service Accounts a Github.
- [ ] **Task:** Disparo del sistema automatizado, Go Live Público.
