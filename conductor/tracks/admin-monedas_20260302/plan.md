# Implementation Plan: Formularios de Administración de Monedas

Este plan detalla las fases para implementar las funciones Create, Update, y Delete (CUD) tanto en el backend como en el frontend de Numisfera.

---

### Fase 1: Backend - Capa de Servicio y Controlador (CRUD)

- [x] **Task:** Implementar los métodos `createCoin`, `updateCoin` y `deleteCoin` en la interfaz `CoinService` y su implementación `CoinServiceImpl`.
- [x] **Task:** Desarrollar pruebas unitarias con `Mockito` en `CoinServiceTest` para los métodos de guardado, actualización y borrado de monedas.
- [ ] **Task:** Implementar los endpoints `@PostMapping`, `@PutMapping("/{id}")` y `@DeleteMapping("/{id}")` en el `CoinController`.
- [ ] **Task:** Desarrollar pruebas de integración con `MockMvc` en `CoinControllerTest` para validar los endpoints POST, PUT y DELETE.
- [ ] **Task:** Conductor - User Manual Verification 'Fase 1: Backend - Capa de Servicio y Controlador' (Protocol in workflow.md)

---

### Fase 2: Frontend - Servicios API y Componentes

- [ ] **Task:** Añadir los métodos `createCoin`, `updateCoin` y `deleteCoin` a `apiService.js` utilizando `fetch`.
- [ ] **Task:** Crear el componente `CoinForm` que permita capturar los campos de una moneda (Nombre, Material, País, Año, Grado, Descripción). El componente debe reutilizarse para Crear y Editar.
- [ ] **Task:** Crear la página `AdminPage` que conste de una tabla con todas las monedas, un botón para agregar una nueva, y botones en cada fila para "Editar" y "Eliminar".
- [ ] **Task:** Implementar un modal o sección para confirmar la eliminación de una moneda en la `AdminPage`.
- [ ] **Task:** Conductor - User Manual Verification 'Fase 2: Frontend - Servicios API y Componentes' (Protocol in workflow.md)

---

### Fase 3: Integración y Navegación Frontend

- [ ] **Task:** Añadir el enlace al panel de "Administración" en el `<Header>` del proyecto para fácil acceso.
- [ ] **Task:** Implementar las transiciones de React Router para acceder a `/admin` (que renderiza `AdminPage`).
- [ ] **Task:** Refinar el diseño del formulario y la tabla de administración aplicando el Dark Mode y el CSS Premium.
- [ ] **Task:** Conductor - User Manual Verification 'Fase 3: Integración y Navegación Frontend' (Protocol in workflow.md)
