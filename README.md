# Bytecode Web — Auditoría y Documentación Técnica

Este documento proporciona una descripción técnica detallada del proyecto web de Bytecode, su arquitectura, las tecnologías utilizadas y las convenciones adoptadas. El proyecto está construido como una Single Page Application (SPA) moderna y de alto rendimiento.

## 1. Stack Tecnológico Principal

-   **Framework Principal**: **React 19**
-   **Bundler y Entorno de Desarrollo**: **Vite 8**
-   **Lenguaje**: **TypeScript 5.9**
-   **Estilos**: **Tailwind CSS 4.2** con un archivo de estilos globales (`index.css`) para variables y fuentes.
-   **Routing**: **React Router DOM 7.13** para la navegación del lado del cliente.
-   **Animaciones e Interacciones**: **Framer Motion 12.3** para transiciones fluidas y animaciones complejas.
-   **Gráficos y 3D**: **React Three Fiber** y **Drei** para la integración de escenas 3D con WebGL.
-   **Iconografía**: **Lucide React** para iconos SVG ligeros y personalizables.
-   **Linting**: **ESLint 9** para el análisis estático de código, asegurando calidad y consistencia.

---

## 2. Arquitectura y Estructura del Proyecto

El proyecto sigue una estructura modular y organizada, diseñada para facilitar la escalabilidad y el mantenimiento.

```
/
├── public/              # Activos estáticos (imágenes, SVGs) que no se procesan.
├── src/
│   ├── assets/          # Activos que se procesan (fuentes, etc.).
│   ├── components/      # Componentes de UI reutilizables (Header, Footer, botones, etc.).
│   ├── layouts/         # Componentes que definen la estructura de las páginas (MainLayout, AltLayout).
│   ├── pages/           # Componentes que representan las rutas principales de la aplicación (Home, Nosotros, etc.).
│   ├── App.tsx          # Componente raíz con la configuración de rutas y layouts.
│   ├── main.tsx         # Punto de entrada de la aplicación.
│   └── index.css        # Estilos y variables CSS globales.
├── .eslintrc.js         # Configuración de ESLint.
├── package.json         # Dependencias y scripts del proyecto.
├── tailwind.config.js   # Configuración de Tailwind CSS.
└── vite.config.ts       # Configuración de Vite.
```

### Puntos Clave de la Arquitectura:

#### a. Ruteo Basado en Layouts

El enrutador principal (`src/App.tsx`) agrupa las rutas bajo componentes de `Layout`. Esto permite que diferentes secciones de la web compartan una estructura común (por ejemplo, un tipo de `Header` y `Footer` específico) de manera eficiente.

**Ejemplo de `App.tsx`:**

```tsx
<Routes>
  {/* Rutas con Header y Footer principal */}
  <Route element={<MainLayout />}>
    <Route path="/" element={<Home />} />
  </Route>

  {/* Rutas con un Header y Footer alternativo */}
  <Route element={<AltLayout />}>
    <Route path="/nosotros" element={<Nosotros />} />
    <Route path="/servicios" element={<Servicios />} />
  </Route>
</Routes>
```

#### b. Code Splitting a Nivel de Ruta

Todas las páginas (`src/pages/*.tsx`) se cargan de forma dinámica (`React.lazy`). Esto significa que el código de una página solo se descarga cuando el usuario navega a ella, reduciendo drásticamente el tamaño del paquete inicial y mejorando el tiempo de carga percibido (Time to Interactive).

Se utiliza un componente `Suspense` con un `fallback` de carga para gestionar el estado de espera.

#### c. Optimización del Build con Vite

El archivo `vite.config.ts` está configurado para optimizar el build de producción mediante la técnica de **Chunk Splitting**. Las dependencias de `node_modules` se agrupan en archivos separados (`chunks`) para mejorar la estrategia de caché del navegador:

-   `vendor-react`: Módulos de React.
-   `vendor-motion`: Módulo de Framer Motion.
-   `vendor-others`: El resto de las dependencias.

---

## 3. Guía de Desarrollo

### Requisitos Previos

-   Node.js (versión 20.x o superior)
-   npm (versión 10.x o superior)

### Instalación

1.  Clona el repositorio.
2.  Instala las dependencias del proyecto:
    ```bash
    npm install
    ```

### Scripts Disponibles

Puedes ejecutar los siguientes scripts desde la raíz del proyecto:

| Script        | Descripción                                                              |
| :------------ | :----------------------------------------------------------------------- |
| `npm run dev` | Inicia el servidor de desarrollo de Vite con Hot Module Replacement (HMR). |
| `npm run build` | Compila y optimiza la aplicación para producción en la carpeta `/dist`.    |
| `npm run lint`  | Ejecuta ESLint en todo el proyecto para detectar errores de código.        |
| `npm run preview` | Inicia un servidor local para previsualizar el build de producción.      |

---

## 4. Buenas Prácticas y Convenciones

-   **Accesibilidad (A11y)**: Se han implementado mejoras como el "Focus Trap" en el menú modal (`MobileMenuView.tsx`) y el uso de etiquetas semánticas con atributos `aria-*` para garantizar la navegabilidad con teclado y lectores de pantalla.
-   **Rendimiento de Carga**: Se utiliza `React.lazy` para el Code Splitting y se precargan (`preload`) las fuentes principales en `index.html` para una renderización más rápida del texto.
-   **Componentes Funcionales**: Todo el código está escrito con componentes funcionales de React y Hooks.
-   **Tipado Estricto**: El proyecto utiliza TypeScript para asegurar un código robusto y mantenible.
-   **Estilos Atómicos**: Se prioriza el uso de clases de Tailwind CSS para la mayoría de los estilos, recurriendo a `index.css` solo para definiciones globales como fuentes (`@font-face`) y variables CSS.
