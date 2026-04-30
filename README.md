# Frontend — ChANtbot

Interfaz de usuario en React para el asistente virtual de Narcóticos Anónimos.

---

## Tecnologías

| Tecnología | Para qué |
|-----------|---------|
| **React** | Interfaz de usuario |
| **localStorage** | ID único por navegador (historial separado por usuario) |
| **SSE (Streaming)** | Respuestas en tiempo real letra a letra |
| **CSS personalizado** | Diseño oscuro con fuente Sora |

---

## Estructura de archivos

```
chatbot-frontend/
├── src/
│   ├── App.js        # Componente principal (lógica y UI)
│   └── App.css       # Estilos
├── public/
│   └── logo192.png   # Logo de la app
└── package.json      # Dependencias Node
```

---

## Funcionalidades

- **Historial por usuario** — cada navegador genera un ID único con `localStorage`, las conversaciones son privadas
- **Streaming** — las respuestas aparecen letra a letra en tiempo real
- **Sidebar** — lista de conversaciones anteriores con preview
- **Nueva conversación** — botón para iniciar un chat nuevo
- **Eliminar conversación** — botón ✕ en cada conversación del historial
- **Sugerencias** — chips con preguntas frecuentes en la pantalla inicial
- **Banner de aviso** — aparece si el servidor tarda en responder (cold start)
- **Compatible con Safari iOS** — fallback para `crypto.randomUUID()`

---

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `REACT_APP_API_URL` | URL del backend (ej: `https://chatbot-backend-ud93.onrender.com/api`) |

---

## Arrancar en local

```bash
npm install
REACT_APP_API_URL=http://127.0.0.1:5000/api npm start
```
