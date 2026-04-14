# React + Vite

## Development (API + CORS)

- This frontend makes API calls under the same-origin prefix `/api`.
- In development, Vite proxies `/api/*` to `http://localhost:9999` (see `vite.config.js`). This avoids browser CORS issues (including Google login), because requests stay same-origin from the browser’s perspective.

### Environment variables

- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client id.
- `VITE_API_BASE_URL` (optional): Overrides the API base URL. Leave unset for local development (recommended). If you set this to a different domain (e.g. `https://api.example.com`), the backend must allow CORS (and credentials, if using cookies) for your frontend origin.
- `VITE_ENABLE_PREMIUM` (optional): Set to `true` to expose premium UI/routes. Default is `false`, which keeps premium code ready but hidden from users.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
