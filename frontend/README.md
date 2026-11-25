# ARGUS-X frontend

A responsive, dark-mode monitoring dashboard prototype for the ARGUS-X hackathon project. Every metric, camera signal, target, identity match, and location shown in the UI is **mock data**; this frontend deliberately makes no API calls and implements no tracking or AI functionality.

## Run locally

1. From `frontend/`, install dependencies with `npm install`.
2. Start the development server with `npm run dev`.
3. Open the local URL printed by Vite.

## Checks

- `npm run lint` checks the TypeScript and React source.
- `npm run build` runs TypeScript validation and produces the production bundle in `dist/`.

## UI interactions

- Use the sidebar to navigate workspace sections.
- Search and filter the mock target queue.
- Pause/resume the simulated camera stream and refresh the simulated event feed.

Tailwind CSS v4 is enabled with the `@tailwindcss/vite` plugin in `vite.config.ts` and `@import 'tailwindcss'` in `src/index.css`.
