# Wild Tech Web Chat + Azure Speech (Token API) + GitHub Pages

This repo contains:
- `site/fullscreen-with-sidebar.html` – Copilot Studio Web Chat page with Speech + Avatar UI.
- `api/` – Azure Functions (Node.js) endpoints:
  - `/api/speechToken`
  - `/api/avatarRelay`

## Important
GitHub Pages hosts **only** the static `site/` content.
Deploy `api/` to Azure Functions and update the endpoints inside the HTML:

```js
const SPEECH_TOKEN_ENDPOINT = "https://<YOUR-FUNCTION-APP>.azurewebsites.net/api/speechToken";
const AVATAR_RELAY_TOKEN_ENDPOINT = "https://<YOUR-FUNCTION-APP>.azurewebsites.net/api/avatarRelay";
```

## Azure Function App settings
Set these in Azure Functions → Configuration:
- `SPEECH_REGION` (e.g., `australiaeast`)
- `SPEECH_KEY` (your Azure Speech key)
- `SPEECH_PRIVATE_ENDPOINT` (optional, for Private Link) e.g. `https://my-speech.cognitiveservices.azure.com`

## Local run
From `api/` folder:
- `npm install`
- `func start`

