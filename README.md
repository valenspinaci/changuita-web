# Changuita – Web App

Aplicación web del sistema Changuita, una plataforma de gestión para emprendedores. Desarrollada en React con TypeScript y Tailwind CSS, consume la API REST del backend y utiliza Auth0 para la autenticación.

---

## Descripción del proyecto

Changuita Web es la interfaz de escritorio/tablet del sistema. Permite al emprendedor gestionar su negocio completo: registrar ventas, controlar stock, administrar clientes y pedidos, registrar gastos, visualizar reportes con gráficos, y configurar módulos del sistema.

---

## Instalación de dependencias

```bash
npm install
```

---

## Cómo correr el proyecto en local

```bash
npm start
```

La aplicación corre por defecto en `http://localhost:3002`.

Para generar el build de producción:

```bash
npm run build
```

---

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Auth0
REACT_APP_AUTH0_DOMAIN=dev-yhoe6u1lccz83eud.us.auth0.com
REACT_APP_AUTH0_CLIENT_ID=<client_id_de_auth0>
REACT_APP_AUTH0_AUDIENCE=https://api.changuita.app

# Backend
REACT_APP_API_URL=http://localhost:3001

# URL de la app (para callbacks de Auth0)
REACT_APP_URL=http://localhost:3002
```

> ⚠️ Nunca subir el archivo `.env` al repositorio.

---

## Arquitectura técnica

```
changuita-web/
├── public/
├── src/
│   ├── context/
│   │   └── AuthContext.tsx       # Contexto de autenticación (login, logout, token)
│   ├── components/               # Componentes reutilizables (Layout, Sidebar, etc.)
│   ├── pages/                    # Pantallas principales de la aplicación
│   │   ├── Login.tsx
│   │   ├── Registro.tsx
│   │   ├── SeleccionEmprendimiento.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Ventas.tsx
│   │   ├── Gastos.tsx
│   │   ├── Stock.tsx
│   │   ├── Clientes.tsx
│   │   ├── Pedidos.tsx
│   │   └── Reportes.tsx
│   ├── services/                 # Funciones para llamadas a la API REST
│   ├── helpers/                  # Funciones utilitarias
│   ├── App.tsx                   # Definición de rutas (React Router)
│   └── index.tsx                 # Entry point
├── .env                          # Variables de entorno (no incluido en el repo)
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## Flujo de autenticación

El login utiliza **Resource Owner Password Grant** directamente contra Auth0, sin redirigir a la pantalla de Auth0 Universal Login. El flujo es:

1. El usuario ingresa email y contraseña en `Login.tsx`
2. Se llama al endpoint de Auth0 para obtener el token JWT
3. Se llama a `POST /auth/sync` en el backend para registrar/actualizar el usuario en la base de datos
4. Se redirige a la pantalla de selección de emprendimiento

---

## Librerías principales

| Librería | Uso |
|---|---|
| `react` + `react-dom` | Framework de UI |
| `typescript` | Tipado estático |
| `react-router-dom` | Navegación entre páginas |
| `tailwindcss` | Estilos utilitarios |
| `recharts` | Gráficos para el módulo de Reportes |
| `axios` / `fetch` | Llamadas a la API REST |

---

## Deploy

La aplicación está deployada en **Vercel**:

```
https://changuita-web.vercel.app
```

Cada push a `main` dispara un deploy automático en Vercel.
