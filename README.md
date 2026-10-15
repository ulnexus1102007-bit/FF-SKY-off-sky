# OFF-SKY storefront

Tienda en Next.js preparada para desplegar en Vercel y usar Supabase como catálogo y panel de administración. Si Supabase aún no está configurado, muestra el catálogo de ejemplo que vive en `app/page.tsx`.

## Desarrollo local

1. Instala Node.js 20 o superior.
2. Ejecuta `npm install` y `npm run dev`.
3. Abre `http://localhost:3000`.

## Admin y Supabase

1. Crea un proyecto Supabase y ejecuta `supabase/schema.sql` desde el SQL Editor.
2. Copia `.env.example` a `.env.local` y pega la URL y la clave anon/public del proyecto.
3. En Supabase Authentication, crea un usuario de acceso para quien administrará la tienda. En su `app_metadata`, agrega `{ "role": "admin" }`. El panel no permite registro público.
4. Inicia la tienda y entra a `/admin`. Usa ese correo y contraseña para iniciar sesión.
5. Desde el panel puedes subir y editar productos, cargar varias imágenes y un video por prenda, definir descripción, tallas, colores y precios, crear categorías que aparecen como filtros y actualizar WhatsApp, las cuentas de Nequi y Banco Nu, y las URLs de Instagram, TikTok y Facebook.

Las fotos y videos se almacenan en el bucket público `product-media` (MP4, WebM o QuickTime, hasta 100 MB). La tienda muestra los productos activos, sus filtros, redes sociales y datos de pago. Las políticas RLS permiten cambios solo a sesiones autenticadas cuyo rol de `app_metadata` sea `admin`. No publiques la clave `service_role` en el navegador.

## Despliegue

El repositorio configurado es `https://github.com/ulnexus1102007-bit/FF-SKY-off-sky`. Conéctalo en Vercel y configura `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `NEXT_PUBLIC_SITE_URL` en sus variables de entorno. Ejecuta el SQL antes de usar `/admin`. El QR se genera con la URL del sitio abierto; en desarrollo apunta al host local.

El número inicial de WhatsApp es +57 315 050 3171. Los pagos por Nequi y Banco Nu se coordinan por WhatsApp; completa los datos de cuenta desde el panel antes de recibir pagos.
