# Implementation Plan: Usuarios, Roles y Autenticación Criptográfica (Metamask + JWT)

Este documento proyecta las tareas técnicas a realizar para añadir una capa de usuarios a Numisfera. El sistema contará con diferentes roles: Anónimo, Login Simple, Login Billetera (Metamask) y Administrador Total.

---

### Fase 1: Backend - Modelado de Seguridad y Propiedad de Monedas

- [x] **Task:** Añadir la dependencia de Spring Security y JWT (`io.jsonwebtoken`) en `pom.xml`.
- [x] **Task:** Crear el enumerador `Role` (`USER_SIMPLE`, `USER_WALLET`, `ADMIN`).
- [x] **Task:** Crear la entidad `User` (Con campos: `id`, `email`, `password`, `walletAddress`, `role`).
- [x] **Task:** Modificar la entidad `Coin` para incluir una relación `@ManyToOne` con `User` indicando el `owner`.
- [x] **Task:** Actualizar `DataSeeder` para inyectar automáticamente el usuario Administrador Dueño y asignarle el `owner` a las monedas pre-sembradas cuando inicie la aplicación en `H2`.
- [x] **Task:** Conductor - User Manual Verification 'Fase 1: Configuración de Base de Datos y Entidades para Usuarios' (Protocol in workflow.md)

---

### Fase 2: Backend - Capa de Autenticación, JWT y Servicios

- [x] **Task:** Crear configuración `SecurityConfig` de Spring Security para autorizar y deshabilitar endpoints públicos vs protegidos.
- [x] **Task:** Desarrollar los `JwtUtils` y un `JwtAuthenticationFilter` para interceptar validaciones de token en las peticiones.
- [x] **Task:** Implementar controlador `AuthController` con endpoints genéricos para `/api/auth/register` (Simple), `/api/auth/login` (Simple) y `/api/auth/web3/login` (Metamask).
- [x] **Task:** Implementar la lógica matemática Web3 para verificar las firmas ECRecovered enviadas de las wallets criptográficas desde el cliente, asegurando la propiedad de la llave pública.
- [x] **Task:** Adaptar `CoinController` y `CoinService` para que los datos devueltos (DTO opcional o entidad) incluyan la info de dueño y que las operaciones CUD queden aseguradas solo para el dueño o para el ADMIN.
- [~] **Task:** Conductor - User Manual Verification 'Fase 2: Backend API Auth y Protección de Rutas' (Protocol in workflow.md)

---

### Fase 3: Frontend - Integración Metamask, Ethers.js y AuthContext

- [ ] **Task:** Instalar las dependencias web3 para el frontend (ej. `ethers` v6).
- [ ] **Task:** Crear un React Context `AuthContext` + `AuthProvider` para englobar el estado global de la aplicación web (`user`, `token`, `role`, funciones `login`, `logout`).
- [ ] **Task:** Desarrollar la pantalla o modal unificado de Autenticación (Simple Email/Password o botón unificado *"Connect Metamask"*).
- [ ] **Task:** Modificar las cabeceras HTTP en `apiService.js` para incrustar el `Bearer Token` JWT automáticamente en cada llamado al backend si el usuario está autenticado.
- [ ] **Task:** Conductor - User Manual Verification 'Fase 3: Desarrollo de React Context y Modales de Autenticación Frontend' (Protocol in workflow.md)

---

### Fase 4: Frontend - Roles Responsivos y Rutas Protegidas

- [ ] **Task:** Adaptar `CoinCard` y `DetailPage`:
   - Usuarios *Anónimos* no verán al dueño. 
   - Usuarios *Autenticados* podrán ver quién es el `owner` de cada criptomoneda/pieza numismática de la exhibición.
- [ ] **Task:** Adaptar `/admin` (`AdminPage.jsx`) transformándola en una `ProtectedRoute` donde obligues un login.
- [ ] **Task:** Modificar vistas administrativas según el rol: 
   - El *ADMIN* ve todas las monedas como siempre. 
   - El *WALLET_USER* solo visualizará en la tabla, modificará o insertará monedas asociadas a él.
   - Si el rol es *SIMPLE_USER* denegar el acceso a la tabla administrativa mediante un cartel (ya que no puede adquirir dueño).
- [ ] **Task:** Modificar el `<Header>` para reflejar las iniciales, avatar, dirección trunca de wallet (0x12..AB) y un botón interactivo de Status/Logout.
- [ ] **Task:** Conductor - User Manual Verification 'Fase 4: Despliegue Completo de Seguridad y Roles' (Protocol in workflow.md)
