# Stack Tecnológico: Numisfera

## 1. Resumen

Este documento describe el stack tecnológico seleccionado para el desarrollo, despliegue y mantenimiento de la aplicación web Numisfera. La arquitectura se basa en un backend robusto de Java desacoplado de un frontend moderno de JavaScript.

## 2. Backend

La lógica de negocio, el servicio de API y la gestión de datos residirán en el servidor.

*   **Lenguaje de Programación: Java**
    *   Se utilizará una versión LTS (Long-Term Support) reciente. Java ofrece un ecosistema maduro, un rendimiento sólido y una gran fiabilidad para aplicaciones transaccionales.

*   **Framework: Spring Boot**
    *   Se usará para acelerar el desarrollo del backend, la creación de la API REST y la integración con la base de datos. Su amplia adopción garantiza una gran cantidad de recursos y soporte de la comunidad.

## 3. Frontend

La interfaz de usuario con la que interactúan los usuarios finales.

*   **Librería: React**
    *   Se utilizará para construir una interfaz de usuario moderna, interactiva y de página única (SPA). Su enfoque basado en componentes facilitará la creación de una experiencia de usuario dinámica y reutilizable.

## 4. Base de Datos

El sistema de persistencia para toda la información de la aplicación.

*   **Sistema Gestor: MySQL**
    *   Se empleará como la base de datos relacional principal. Es una opción fiable y ampliamente utilizada para almacenar los datos estructurados de las monedas, usuarios, ventas y futuras subastas.

## 5. Despliegue e Infraestructura (DevOps)

La estrategia para alojar y entregar la aplicación a los usuarios.

*   **Plataforma de Alojamiento: Proveedor de Cloud**
    *   La aplicación se alojará en una de las principales plataformas en la nube (como **AWS, Google Cloud Platform o Azure**), lo que permitirá escalabilidad, seguridad y acceso a servicios gestionados.

*   **Contenerización: Docker**
    *   Tanto el backend de Spring Boot como el frontend de React se empaquetarán en contenedores de Docker. Esto garantizará la consistencia entre los entornos de desarrollo y producción, y simplificará el despliegue en la plataforma de cloud elegida.
