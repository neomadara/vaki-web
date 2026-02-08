# Vaki 🚀

Vaki es una aplicación web simple y colaborativa para crear listas de compras o de pendientes que se sincronizan en tiempo real. Está diseñada para ser rápida, minimalista y eficiente.

> [!TIP]
> **Comparte y colabora:** Solo copia el link de tu lista y pásalo a tus amigos. Todos verán los cambios al instante.

## ✨ Características

- **Sincronización en Tiempo Real:** Gracias a Firebase Firestore, los cambios aparecen instantáneamente para todos los usuarios.
- **Nicknames:** Identifica quién agregó o compró cada producto.
- **Auto-Expiración:** Los productos tienen un tiempo de vida de 24 horas para mantener las listas limpias y actualizadas.
- **Diseño Moderno:** Interfaz minimalista con soporte para modo oscuro (vía Tailwind CSS).
- **TTL (Time To Live):** Integración con las reglas de Firebase para limpieza automática de datos antiguos.

## 🛠️ Tech Stack

- **Framework:** [Astro](https://astro.build/) (Hybrid Rendering)
- **UI library:** [React](https://reactjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Backend/Database:** [Firebase Firestore](https://firebase.google.com/products/firestore)

## 📁 Estructura del Proyecto

```text
/
├── public/          # Assets estáticos
├── src/
│   ├── components/  # Componentes React (VakiList.tsx es el núcleo)
│   ├── layouts/     # Layout principal del sitio
│   ├── lib/         # Configuración de Firebase
│   ├── pages/       # Rutas de Astro (/[id] para listas dinámicas)
│   ├── types/       # Definiciones de TypeScript
│   └── styles/      # Estilos globales y Tailwind
├── firestore.rules  # Reglas de seguridad de la base de datos
└── package.json
```

## 🚀 Configuración Local

1. **Clonar el repositorio:**
   ```bash
   git clone <repo-url>
   cd vaki-web
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Variables de Entorno:**
   Crea un archivo `.env` en la raíz con tus credenciales de Firebase:
   ```env
   PUBLIC_FIREBASE_API_KEY=...
   PUBLIC_FIREBASE_AUTH_DOMAIN=...
   PUBLIC_FIREBASE_PROJECT_ID=...
   PUBLIC_FIREBASE_STORAGE_BUCKET=...
   PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   PUBLIC_FIREBASE_APP_ID=...
   ```

4. **Iniciar Servidor de Desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:4321`.

## 🛡️ Reglas de Firebase

Es importante desplegar las reglas en `firestore.rules` para asegurar el correcto funcionamiento del filtro de expiración y la seguridad de los datos:

```bash
firebase deploy --only firestore:rules
```

##  Genie Commands

| Comando | Acción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera la versión de producción en `./dist/` |
| `npm run preview` | Previsualiza la versión de producción localmente |
