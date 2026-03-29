
# AgendaCitas Nacional CR - Guía de Gestión

Este proyecto es el portal oficial para la gestión de citas médicas en Costa Rica.

## 🚀 1. Cómo actualizar los cambios en Netlify (IMPORTANTE)

Si ya tienes el sitio conectado a GitHub, cada vez que hagas cambios en Firebase Studio y quieras verlos en vivo, ejecuta estos comandos en tu terminal:

1. **Guardar cambios**:
   ```bash
   git add .
   ```

2. **Crear etiqueta de avance**:
   ```bash
   git commit -m "✨ Actualización: Nuevas funciones de perfil y centros de salud"
   ```

3. **Subir y Desplegar**:
   ```bash
   git push origin main
   ```

*Nota: Netlify detectará el push automáticamente y comenzará la construcción (Build). Tardará unos 2-3 minutos en reflejarse.*

## 🛠️ 2. Configuración de Variables de Entorno

Asegúrate de tener estas variables en **Site settings > Environment variables** de Netlify para que Firebase funcione:

| Variable | Valor sugerido |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Tu API Key |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | agendacitas-nacional |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | agendacitas-nacional.firebaseapp.com |

## 📦 3. Solución a errores de subida
Si el `git push` falla o se queda pegado:
1. Revisa que no estés subiendo la carpeta `node_modules` (el archivo `.gitignore` ya se encarga de esto).
2. Si es necesario, fuerza la subida: `git push origin main --force`.

## 🌐 4. Configuración del Build
- **Build Command**: `npm run build`
- **Publish Directory**: `.next`
