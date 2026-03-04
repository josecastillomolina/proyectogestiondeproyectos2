# AgendaCitas Nacional CR - Portal Oficial

Portal oficial para la gestión de citas médicas en la Red Nacional de Salud de Costa Rica.

## 🚀 PASOS PARA SUBIR A GITHUB (EJECUTA ESTO AHORA)

Copia y pega estos comandos **uno por uno** en tu **TERMINAL** y presiona **Enter** después de cada uno:

1. **Limpiar historial anterior**:
   ```bash
   rm -rf .git
   ```

2. **Iniciar repositorio nuevo**:
   ```bash
   git init
   ```

3. **Añadir archivos corregidos**:
   ```bash
   git add .
   ```

4. **Guardar cambios con mensaje de corrección**:
   ```bash
   git commit -m "Fix total: Firebase security and Netlify build config"
   ```

5. **Conectar con tu repositorio de GitHub**:
   ```bash
   git remote add origin https://github.com/josecastillomolina/proyectogestiondeproyectos2.git
   ```

6. **Crear rama principal**:
   ```bash
   git branch -M main
   ```

7. **Subir todo a la fuerza (limpiar errores previos)**:
   ```bash
   git push -u origin main --force
   ```

## 🛠️ Despliegue en Netlify
Una vez completado el paso 7, ve a tu panel de Netlify y selecciona **"Retry deploy"**. El sistema ahora está configurado para evitar el error de acceso a propiedades nulas (`.get`) durante la construcción.
