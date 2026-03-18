# AgendaCitas Nacional CR - Guía de Despliegue

Este proyecto es un portal oficial para la gestión de citas médicas en Costa Rica, construido con **Next.js 15**, **Firebase** y **Tailwind CSS**.

## 🛠️ 1. Configuración de Variables de Entorno (IMPORTANTE)

Para que el proyecto funcione en Netlify, debes configurar las siguientes variables en **Netlify (Site settings > Environment variables)**. Si no lo haces, verás errores de `invalid-api-key`.

Copia estos valores desde la consola de Firebase (**Project Settings > General > Your Apps > Web App**):

| Nombre de la Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Tu Firebase API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Tu Auth Domain (ej: proyecto.firebaseapp.com) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | El ID de tu proyecto |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | El ID de la aplicación (1:xxxx:web:xxxx) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID de mensajería |

## 🚀 2. Instrucciones de Subida a GitHub (Terminal)

Ejecuta estos comandos en orden para subir tu código corregido:

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
   git commit -m "🚀 Fix: Robust Firebase initialization for Netlify"
   ```

5. **Conectar a tu repositorio**:
   ```bash
   git remote add origin https://github.com/josecastillomolina/agendadecitas.git
   ```

6. **Subir cambios**:
   ```bash
   git branch -M main
   git push -u origin main --force
   ```

## 🌐 3. Configuración en Netlify

1. Ve a **Deploys > Trigger deploy** una vez que hayas configurado las variables en el paso 1.
2. El **Build Command** debe ser `npm run build`.
3. El **Publish Directory** debe ser `.next`.
