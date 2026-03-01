# Implementation Plan: Catálogo de Exhibición Principal (MVP)

Este plan detalla las fases y tareas para construir la funcionalidad del catálogo principal.

---

### Fase 1: Configuración del Backend y Modelo de Datos

- [x] **Task:** Inicializar el proyecto Spring Boot con las dependencias necesarias (Spring Web, Spring Data JPA, MySQL Driver). eec4bf3
- [x] **Task:** Definir la entidad JPA `@Entity` para el modelo `Coin` en Java. cad3be4
- [x] **Task:** Crear la interfaz `CoinRepository` que extiende de `JpaRepository`. 330de5c
- [x] **Task:** Implementar un servicio de carga de datos inicial (Data Seeder) para poblar la base de datos con algunas monedas de ejemplo. 6c4441d
- [x] **Task:** Conductor - User Manual Verification 'Fase 1: Configuración del Backend y Modelo de Datos' (Protocol in workflow.md)

---

### Fase 2: Desarrollo de la API REST

- [x] **Task:** Escribir pruebas unitarias para el `CoinService` que verifiquen la lógica de negocio. cf36f99
- [x] **Task:** Implementar el `CoinService` para obtener todas las monedas y una moneda por ID. cf36f99
- [x] **Task:** Escribir pruebas de integración para el `CoinController`. e29d34c
- [x] **Task:** Implementar el `CoinController` para exponer los endpoints `GET /api/coins` y `GET /api/coins/{id}`. e29d34c
- [x] **Task:** Conductor - User Manual Verification 'Fase 2: Desarrollo de la API REST' (Protocol in workflow.md)

---

### Fase 3: Configuración del Frontend

- [~] **Task:** Inicializar el proyecto de React usando `create-react-app` o una herramienta similar.
- [ ] **Task:** Estructurar las carpetas del proyecto (components, pages, services, styles).
- [ ] **Task:** Implementar el layout principal de la aplicación (Header, Footer, área de contenido) y el enrutamiento básico (React Router).
- [ ] **Task:** Conductor - User Manual Verification 'Fase 3: Configuración del Frontend' (Protocol in workflow.md)

---

### Fase 4: Implementación de la Interfaz de Usuario

- [ ] **Task:** Crear un `apiService` en el frontend para comunicarse con la API del backend.
- [ ] **Task:** Crear un componente `CoinCard` para mostrar la vista previa de una moneda.
- [ ] **Task:** Crear la página `CatalogPage` que consume el `apiService`, muestra una cuadrícula de `CoinCard`s y contiene los controles de filtro.
- [ ] **Task:** Crear la página `DetailPage` que muestra la información completa de una moneda.
- [ ] **Task:** Implementar la navegación entre la página de catálogo y la de detalle.
- [ ] **Task:** Conductor - User Manual Verification 'Fase 4: Implementación de la Interfaz de Usuario' (Protocol in workflow.md)
