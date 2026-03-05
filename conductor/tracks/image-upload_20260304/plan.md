# Implementation Plan: Carga de Imágenes Múltiples con Soporte Local/Nube

Este documento proyecta las tareas técnicas a realizar para añadir la funcionalidad de carga y visualización de imágenes fotografiadas a las monedas (1 a 3 fotos, parametrizadas), con un servicio de almacenamiento dinámico según el entorno.

## Fase 1: Backend - Estructura y Servicios de Almacenamiento Dinámico (Storage)
- [x] **Task:** Añadir la propiedad límite de imágenes a la configuración `application.properties` (ej. `app.images.max-uploads=3`) y definir estrategia de entorno (`storage.provider=local`).
- [x] **Task:** Crear la interfaz base `StorageService` con métodos clave (`store`, `load`).
- [x] **Task:** Crear `LocalStorageServiceImpl` anotado con condicionales o `@Profile("dev")`/`@Profile("default")` para que guarde las fotos dentro de una carpeta `/uploads` del sistema.
- [x] **Task:** Crear `CloudStorageServiceImpl` que sirva como *"Mock"* funcional o esqueleto (listo para Google Cloud Storage o S3) que se active al usar un entorno distinto (`prod`).
- [x] **Task:** Exponer mediante Configuración un mapeo de recursos para poder servir `http://localhost:8080/api/uploads/imagen.jpg` desde la carpeta estática.

## Fase 2: Backend - Modelado de Múltiples Imágenes y Controlador
- [x] **Task:** Modificar la entidad `Coin` y sus DTO: de usar `String imageUrl` a una colección `List<String> imageUrls` en BD conservando persistencia en cascada o vía ElementCollection.
- [x] **Task:** Refactorizar `CoinController` (`POST` y `PUT`) para que, en lugar de recibir un JSON puro genérico, maneje `multipart/form-data` (JSON o Text param + `MultipartFile[] images`).
- [x] **Task:** Ajustar la capa de `CoinService` para delegar con limitantes (ej. validación MaxImages) las fotos al Storage, y retornar listado de strings con las rutas definitivas para guardar en base de datos.
- [x] **Task:** Refactorizar DataSeeder y Tests para ajustarse al uso de Arrays de imágenes.

## Fase 3: Frontend - Formularios Web Multipart
- [ ] **Task:** Configurar `VITE_MAX_IMAGES=3` en `.env` raíz de Frontend.
- [ ] **Task:** Modificar `apiService.js` para el registro/edición, enviando ahora formularios `FormData` (Blob para archivo + Texto JSON para Data) y forzando que Axios/Fetch cambien los `Headers`. 
- [ ] **Task:** Actualizar el componente `CoinForm.jsx` para agregar un pre-visualizador de imágenes subidas o de entrada `<input type="file" multiple max={3} />`.

## Fase 4: Frontend - Galería Visual y Lightbox
- [ ] **Task:** Refactorizar `CoinCard.jsx` para que tome y renderice `imageUrls[0]` como portada en el Catálogo en vez de la sola URL antigua.
- [ ] **Task:** Adaptar `DetailPage.jsx` renderizando todos los thumbnails.
- [ ] **Task:** Implementar Modal "Lightbox" Nativo en React dentro de `DetailPage` para abrir y escalar con un click la foto para alta definición. 
