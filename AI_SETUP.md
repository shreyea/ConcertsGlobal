Running the local AI proxy (optional)

This project includes an optional small AI proxy that forwards requests to OpenAI. It's not required — the planner has a local fallback — but if you'd like richer AI suggestions, follow these steps:

1. Install dependencies (project root):

```bash
npm install
```

2. Set your OpenAI API key in the environment. On Windows (Git Bash / WSL):

```bash
export OPENAI_API_KEY="sk-..."
```

On PowerShell:

```powershell
$env:OPENAI_API_KEY = "sk-..."
```

3. Start the AI proxy (runs on port 4001 by default):

```bash
npm run start:ai
```

4. In development, you can run the frontend with:

```bash
npm run dev
```
Shareable plans
- The proxy now supports saving plans to `POST /plans` and retrieving them at `/plans/:id`.
- From the Plan page you can "Share" which will save the plan server-side and copy a shareable URL (e.g. `https://yoursite/plans/<id>`) to your clipboard.

Authentication & proxy URL
- By default the proxy accepts requests from localhost. You can configure a simple header-based token by setting `PROXY_AUTH_TOKEN` in the environment on the proxy server.
- If you set `PROXY_AUTH_TOKEN`, the frontend must send that token in the `x-proxy-auth` header. To simplify local dev, set `VITE_PROXY_AUTH_TOKEN` in your front-end env file (Vite will expose it as `import.meta.env.VITE_PROXY_AUTH_TOKEN`).
- If your proxy runs on a different host/port, set `VITE_AI_PROXY_URL` to the full base URL (for example `http://localhost:4001`).

Map & geolocation
- The Plan page can show transit estimates when your browser provides a location. Allow geolocation for better distance and time estimates.

Notes
