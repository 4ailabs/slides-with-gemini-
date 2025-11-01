# 🚀 Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar tu aplicación AI Slide Generator en Vercel de forma rápida y sencilla.

## ⚡ Opción 1: Despliegue Rápido via GitHub (Recomendado)

### Paso 1: Verificar que tu código está en GitHub

Tu código ya está en GitHub en la rama `2025-10-31-y0z8-fc812`. Los archivos necesarios ya están listos:
- ✅ `vercel.json` - Configuración de Vercel
- ✅ `package.json` - Scripts de build
- ✅ `vite.config.ts` - Configuración de Vite

### Paso 2: Crear proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com) y haz clic en "Sign Up"
2. Inicia sesión con tu cuenta de GitHub
3. Haz clic en **"Add New Project"** o **"Import Project"**
4. Selecciona el repositorio: `slides-with-gemini-`

### Paso 3: Configurar el proyecto

Vercel detectará automáticamente que es un proyecto Vite:

- **Framework Preset**: Vite (detectado automáticamente)
- **Root Directory**: `./`
- **Build Command**: `npm run build` (automático)
- **Output Directory**: `dist` (automático)
- **Install Command**: `npm install` (automático)

**¡No necesitas cambiar nada!** Solo haz clic en "Deploy"

### Paso 4: Configurar Variable de Entorno

**⚠️ IMPORTANTE**: Antes de hacer deploy, debes agregar tu API key:

1. En la pantalla de configuración, expande **"Environment Variables"**
2. Agrega una nueva variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Tu API key de Gemini (obtén una en https://makersuite.google.com/app/apikey)
3. Haz clic en **"Deploy"**

Vercel comenzará a construir y desplegar tu aplicación. Esto tomará aproximadamente 2-3 minutos.

### Paso 5: Verificar el despliegue

Una vez completado:
1. Verás la URL de tu aplicación desplegada (ejemplo: `https://slides-with-gemini-xxx.vercel.app`)
2. Haz clic en la URL para abrir tu aplicación
3. Prueba crear una slide para verificar que funciona

## 🔧 Opción 2: Despliegue via Vercel CLI

Si prefieres usar la línea de comandos:

### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Paso 2: Iniciar sesión

```bash
vercel login
```

Esto abrirá tu navegador para autenticarte.

### Paso 3: Desplegar

En el directorio de tu proyecto:

```bash
vercel
```

Vercel te hará algunas preguntas:
- Set up and deploy? **Y**
- Which scope? **Tu usuario/organización**
- Link to existing project? **N** (para la primera vez)
- Project name? **slides-with-gemini** (o el que prefieras)
- Directory? **./**
- Override settings? **N**

### Paso 4: Agregar variable de entorno

```bash
vercel env add GEMINI_API_KEY
```

Cuando te pregunte:
- What's the value of GEMINI_API_KEY? **Pega tu API key**
- Add to which environments? **production, preview, development** (o solo production)

### Paso 5: Redeploy

```bash
vercel --prod
```

## 🔄 Actualizaciones Futuras

Cada vez que hagas push a GitHub, Vercel automáticamente:
1. Detectará los cambios
2. Ejecutará `npm install`
3. Ejecutará `npm run build`
4. Desplegará la nueva versión

**Para ramas de desarrollo**: Vercel creará un preview URL automáticamente para cada pull request.

## 🛠️ Solución de Problemas

### Error: "Unable to find module"

Si ves este error, verifica que:
- ✅ `package.json` esté presente y tenga todos los scripts necesarios
- ✅ `vite.config.ts` esté configurado correctamente
- ✅ `vercel.json` exista en la raíz del proyecto

### Error: "Environment variable not set"

Asegúrate de que agregaste `GEMINI_API_KEY` en las variables de entorno de Vercel:
1. Ve a tu proyecto en Vercel dashboard
2. Settings → Environment Variables
3. Verifica que `GEMINI_API_KEY` esté listada
4. Si no está, agrega la y redeploy con `vercel --prod`

### El build es muy lento

El chunk principal es grande (~11MB) por las dependencias. Esto es normal para la primera carga. Vercel comprimirá automáticamente con gzip (resulta en ~2.3MB).

Para optimizar más:
- Considera usar dynamic imports para componentes pesados
- Implementa lazy loading para rutas
- Usa CDN para assets estáticos

### La aplicación funciona en local pero no en Vercel

Verifica:
1. La variable `GEMINI_API_KEY` está configurada correctamente
2. El build en local funciona: `npm run build`
3. El preview en local funciona: `npm run preview`
4. Los logs de Vercel no muestran errores

## 📊 Monitoreo

Vercel proporciona:
- **Logs en tiempo real**: Ve a Deployments → Selecciona un deployment → View Function Logs
- **Analytics**: (requiere plan de pago)
- **Speed Insights**: (requiere plan de pago)

## 🔒 Seguridad

Variables de entorno en Vercel están encriptadas y:
- No se exponen en el código fuente
- Solo se inyectan durante el build en el servidor
- Se compilan en el bundle de producción
- ⚠️ **IMPORTANTE**: Las APIs key públicas en el bundle pueden ser visibles en el cliente

**Recomendación de producción**: Para apps reales, considera usar un backend proxy para proteger tu API key.

## 📝 Configuración Actual

Tu `vercel.json` incluye:

- **Rewrites**: SPA routing para que todas las rutas funcionen
- **Security Headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- **Cache Headers**: Assets cacheados por 1 año
- **Framework**: Vite (detectado automáticamente)

## 🎉 ¡Listo!

Tu aplicación ahora está desplegada y accesible públicamente. Vercel te asignará:
- Una URL de producción (ej: `https://your-app.vercel.app`)
- HTTPS automático
- CDN global
- Deploys automáticos en cada push

**Próximos pasos sugeridos**:
1. Configura un dominio personalizado (opcional)
2. Activa preview deployments para PRs
3. Configura notificaciones de deploy (email/Slack)

## 📚 Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Guía de Vite en Vercel](https://vercel.com/guides/deploying-vite-to-vercel)
- [Variables de entorno](https://vercel.com/docs/concepts/projects/environment-variables)
- [Dominios personalizados](https://vercel.com/docs/concepts/projects/domains)

