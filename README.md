This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Variables

Set the following variables to enable data fetching from the Villanueva García API and configure maps:

- `INMUEBLES_API_KEY`: API token provided for authenticating requests.
- `INMUEBLES_API_BASE_URL` (opcional): sobrescribe la URL base si necesitas apuntar a otro entorno. Por defecto se usa `https://vg.g210512.com/api/v1`.
- `NEXT_PUBLIC_API_MAPBOX` (opcional): token público de Mapbox para habilitar el mapa con estilo institucional.
- `NEXT_PUBLIC_MAPBOX_STYLE_ID` (opcional): estilo público principal de Mapbox.
- `NEXT_PUBLIC_MAPBOX_ADMIN_STYLE_ID` (opcional): estilo de Mapbox para vistas administrativas.

El listado de propiedades usa una imagen de respaldo interna (`/1.png`) cuando el recurso remoto no incluye fotografías públicas.

You can use [.env.example](/home/alfgow/Documentos/inmobiliaria-frontend/.env.example:1) as a starting point for local setup.

## Docker

La aplicación se puede construir en un contenedor con salida standalone y se expone en el puerto `3004`.

Ejemplo de build:

```bash
docker build \
  --build-arg DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public" \
  --build-arg NEXT_PUBLIC_MAPBOX_TOKEN="..." \
  --build-arg NEXT_PUBLIC_MAPBOX_STYLE_ID="..." \
  --build-arg NEXT_PUBLIC_MAPBOX_ADMIN_STYLE_ID="..." \
  -t inmobiliaria-frontend .
```

Ejemplo de ejecución:

```bash
docker run --rm -p 3004:3004 inmobiliaria-frontend
```

Con Docker Compose y tu `.env.local`:

```bash
docker compose --env-file .env.local up --build
```

En Linux, el compose usa `network_mode: host` para que el frontend vea el mismo PostgreSQL del host en `127.0.0.1:5432`.

## CI/CD

Los pull requests y cada push a `main` ejecutan Prisma, una instancia PostgreSQL
efímera, lint, TypeScript y el build de producción dentro de un único workflow
`CI/CD`. En los pushes a `main`, el job `deploy` espera a que `validate` termine
correctamente y despliega ese mismo SHA por Tailscale y SSH mediante
`scripts/deploy.sh`. Así no se depende de encadenar dos workflows con
`workflow_run`. Para un despliegue manual, ejecuta `CI/CD` desde GitHub Actions y
marca la opción `deploy`.

El environment `production` de GitHub necesita estos secrets:

- `TS_OAUTH_CLIENT_ID` y `TS_OAUTH_SECRET`: credenciales OAuth de Tailscale con permiso para `tag:ci`.
- `VPS_TAILSCALE_HOST`: nombre o IP privada del servidor en la tailnet.
- `VPS_SSH_USER` y `VPS_SSH_PRIVATE_KEY`: usuario y llave privada de despliegue.

En el VPS, clona el repositorio en `/opt/inmobiliaria-frontend`, instala el script
en esa misma ruta y crea `/opt/inmobiliaria-frontend/.env.local`. El despliegue
construye la imagen, aplica `prisma migrate deploy`, inicia Docker Compose y
comprueba PostgreSQL y `GET /api/health` antes de finalizar.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
