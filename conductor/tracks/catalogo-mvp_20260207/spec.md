# Specification: Catálogo de Exhibición Principal (MVP)

## 1. Visión General

Este track cubre la implementación de la funcionalidad central y más crítica para el Producto Mínimo Viable (MVP) de Numisfera: un catálogo de exhibición de monedas de alta calidad. El objetivo es permitir a los usuarios explorar, buscar y ver detalles de las monedas de una manera atractiva y profesional.

## 2. Requisitos Funcionales

### RF-01: Modelo de Datos de la Moneda
- El sistema debe definir una entidad `Coin` en el backend.
- Atributos mínimos: `id`, `name`, `country`, `year`, `material`, `description`, `grade` (conservación), `imageUrl`.

### RF-02: API REST para Monedas
- El backend debe exponer una API REST para interactuar con los datos de las monedas.
- `GET /api/coins`: Devuelve una lista paginada de todas las monedas en el catálogo.
- `GET /api/coins?search={term}`: Permite filtrar la lista de monedas por un término de búsqueda.
- `GET /api/coins/{id}`: Devuelve los detalles completos de una única moneda por su ID.

### RF-03: Interfaz de Usuario - Vista de Catálogo
- El frontend debe mostrar una vista de cuadrícula (grid) o lista con las monedas del catálogo.
- Cada moneda en la vista debe mostrar una imagen en miniatura y su nombre.
- Debe existir un campo de búsqueda y controles de filtro para refinar la lista de monedas mostradas.

### RF-04: Interfaz de Usuario - Vista de Detalle
- Al hacer clic en una moneda del catálogo, el usuario debe ser llevado a una página de detalle.
- Esta página debe mostrar la imagen de la moneda en alta resolución y todos sus datos (descripción, historia, etc.).

## 3. Requisitos No Funcionales

- **RNF-01: Responsividad:** La interfaz debe ser completamente funcional y visualmente atractiva en dispositivos de escritorio y móviles.
- **RNF-02: Rendimiento:** Las imágenes deben ser optimizadas para la web para garantizar tiempos de carga rápidos sin sacrificar la calidad del detalle.

## 4. Criterios de Aceptación

- Un usuario puede visitar la página principal y ver una galería de monedas.
- Un usuario puede usar un campo de búsqueda para filtrar las monedas por nombre o país.
- Un usuario puede hacer clic en una moneda para ver su página de detalles con toda la información.
- Toda la experiencia funciona correctamente en Chrome (escritorio) y Safari (móvil).
