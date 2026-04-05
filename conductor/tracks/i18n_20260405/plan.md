# Track: Internacionalización (i18n) del Sistema (Inglés US y Español LATAM)

## Descripción
Habilitar a `numisfera.mx` para escalar a un público global, implementando soporte multi-idioma. Se establecerá el Inglés Estadounidense (`en-US`) por defecto, junto con traducción completa al Español Latinoamericano (`es-419` o general `es`). 

## Objetivos
1. Cero recargas de página al cambiar de idioma.
2. Persistencia de la selección del usuario en el navegador local.
3. Extracción prolija de todos los textos duros en la aplicación React.

## Alcance / Fases

### Fase 1: Instalación y Configuración del Motor
- [x] **Task:** Instalar las librerías estándar en la industria para React: `i18next` y `react-i18next`.
- [x] **Task:** Crear el script central de configuración `i18n.js` para inicializar el motor de idiomas, establecer las reglas del fallback (por defecto `en`) y crear las carpetas de locaciones geográficas `locales/en/` y `locales/es/`.

### Fase 2: Componente Selector y Diseño
- [x] **Task:** Construir un componente elegante (Dropdown / Toggle) en el `Header.jsx` o NavBar para que el usuario pueda conmutar visualmente entre Inglés y Español.
- [x] **Task:** Guardar la preferencia de elección en el `localStorage` para que al cerrar el navegador e ingresar el próximo mes, Numisfera recuerde en qué idioma lee el usuario.

### Fase 3: Traducción Masiva (Refactoring)
- [x] **Task:** Envolver los textos principales del Catálogo (`CatalogPage.jsx`) en la función de traducción `t('...')`.
- [x] **Task:** Traducir los textos complejos de Seguridad y Web3 en la pantalla de criptomonedas (`DetailPage.jsx`) y el modal de Login (`AuthModal.jsx`).
- [x] **Task:** Refactorizar por completo tu panel de operaciones del Solopreneur (`AuctionsPage.jsx` y `ProfilePage.jsx`).

## Notas de Diseño
* El backend en Spring Boot actualmente responde con mensajes técnicos básicos o HTTP Status Codes. El enfoque primario de la Fase 3 será mapear cualquier alerta que vea el usuario directamente en el archivo JSON del Frente, manteniendo el backend magro y veloz.
