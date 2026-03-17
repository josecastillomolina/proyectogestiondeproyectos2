# AgendaCitas Nacional CR - Guía de Despliegue

Este proyecto es un portal oficial para la gestión de citas médicas en Costa Rica, construido con **Next.js 15**, **Firebase** y **Tailwind CSS**.

## 🛠️ Variables de Entorno Necesarias

Debes configurar las siguientes variables en **Netlify (Site settings > Environment variables)**:

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | API Key de tu proyecto Firebase |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Dominio de Auth de Firebase |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ID del proyecto Firebase |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ID de la aplicación en Firebase |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID de mensajería |

## 🚀 Instrucciones de Despliegue (Terminal)

Ejecuta estos comandos uno por uno para subir tu proyecto a GitHub:

1. **Limpiar Git anterior**:
   ```bash
   rm -rf .git
   ```

2. **Iniciar repositorio**:
   ```bash
   git init
   ```

3. **Añadir archivos**:
   ```bash
   git add .
   ```

4. **Primer commit**:
   ```bash
   git commit -m "🚀 Prep: Ready for Netlify deployment with Env Vars"
   ```

5. **Conectar a GitHub**:
   ```bash
   git remote add origin https://github.com/josecastillomolina/agendadecitas.git
   ```

6. **Subir cambios**:
   ```bash
   git branch -M main
   git push -u origin main --force
   ```

## 🌐 Configuración en Netlify

1. Ve a **Deploys > Trigger deploy**.
2. Asegúrate de que el **Build Command** sea `npm run build`.
3. El **Publish Directory** debe ser `.next`.
