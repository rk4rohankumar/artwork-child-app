# Artwork · Micro Frontend remote

A React micro-frontend that lets you browse and search artworks from
[The Metropolitan Museum of Art Open Access API](https://metmuseum.github.io/)
(no API key). Search uses the paginated
`https://collectionapi.metmuseum.org/public/collection/v1.1/search`
(`offset`/`limit`; `/v1/search` was retired on 2026-10-01) and details come
from `/public/collection/v1/objects/{id}`. Built with CRA 5 + CRACO 7, webpack
Module Federation, React 19 and Tailwind 3.

## Run

```bash
npm install
npm start          # http://localhost:3000, standalone
npm run build      # production build in build/, publicPath 'auto'
```

Deployed at <https://artwork-child-app.vercel.app/>.

## How the host consumes it

The [micro-frontend-host](https://github.com/rk4rohankumar/micro-frontend-host)
loads this remote at runtime: it injects
`https://artwork-child-app.vercel.app/remoteEntry.js`, calls
`container.init(__webpack_share_scopes__.default)` and then
`container.get('./ArtworkApp')`.

- Scope name: `ArtworkApp`
- Exposed module: `./ArtworkApp` → `src/App` (default export, a self-contained
  component that ships its own Tailwind CSS)
- Entry: `src/index.js` only does `import('./bootstrap')` so shared modules are
  negotiated before React renders, both standalone and inside the host.

### Shared singletons

`react`, `react-dom`, `framer-motion` and `axios` are declared
`singleton: true` with `requiredVersion` taken from `package.json`. The host
provides one copy of each; this remote reuses it instead of bundling its own,
which keeps hooks and context working across the host/remote boundary.
