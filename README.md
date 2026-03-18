
# AgendaCitas Nacional CR - Guía de Despliegue

Este proyecto es un portal oficial para la gestión de citas médicas en Costa Rica.

## 🛠️ 1. Configuración de Variables de Entorno (IMPORTANTE)

Para que el proyecto funcione en Netlify, debes configurar estas variables en **Site settings > Environment variables**:

| Nombre de la Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Tu Firebase API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Tu Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | El ID de tu proyecto |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | El ID de la aplicación |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |

## 🚀 2. Instrucciones para subir a GitHub (SOLUCIÓN AL BLOQUEO)

Si el `git push` se quedaba pegado, era porque intentabas subir la carpeta `node_modules`. Con el nuevo `.gitignore` que he creado, ahora funcionará rápido:

1. **Limpiar cache de Git**:
   ```bash
   git rm -r --cached .
   ```

2. **Añadir archivos (ahora respetará el .gitignore)**:
   ```bash
   git add .
   ```

3. **Hacer commit**:
   ```bash
   git commit -m "🚀 Fix: Add .gitignore and secure Firebase config"
   ```

4. **Subir a GitHub**:
   ```bash
   git push origin main --force
   ```

## 🌐 3. Configuración en Netlify
- **Build Command**: `npm run build`
- **Publish Directory**: `.next`
