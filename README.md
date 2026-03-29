
# AgendaCitas Nacional CR - Guía de Gestión y Despliegue

Este es el portal oficial para la gestión de citas médicas en Costa Rica.

## 🚀 1. Cómo actualizar los cambios en Netlify (DESDE ESTA CONSOLA)

Cada vez que termines de hacer cambios aquí en Firebase Studio, sigue estos pasos en la **Terminal**:

1. **Preparar cambios**:
   ```bash
   git add .
   ```

2. **Crear etiqueta de avance**:
   ```bash
   git commit -m "✨ Mejora: Sistema de citas y perfiles médicos"
   ```

3. **Subir y Desplegar**:
   ```bash
   git push origin main
   ```

*Nota: Una vez que ejecutes el push, Netlify detectará el cambio automáticamente y actualizará tu sitio web en unos 2-3 minutos.*

## 🛠️ 2. Variables de Entorno en Netlify

Si ves que Firebase no carga en el sitio en vivo, asegúrate de configurar estas variables en **Site settings > Environment variables** de tu panel de Netlify:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Tu API Key oficial |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | agendacitas-nacional |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | agendacitas-nacional.firebaseapp.com |

## 📦 3. Solución a errores de Build
Si el despliegue en Netlify falla (aparece en rojo):
1. Revisa los logs de Netlify.
2. Asegúrate de que el comando de build sea: `npm run build`.
3. Asegúrate de que la carpeta de publicación sea: `.next`.

## 🌐 4. Contacto de Soporte
Para ajustes técnicos adicionales, contactar al administrador del sistema nacional.
