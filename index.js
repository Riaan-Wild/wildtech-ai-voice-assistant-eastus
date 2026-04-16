const fetch = require("node-fetch");

// Returns WebRTC ICE config for Azure Speech Avatar (relay token)
// Expected response body for the browser:
// { urls: ["turn:..."], username: "...", credential: "..." }

module.exports = async function (context, req) {
  try {
    const region = process.env.SPEECH_REGION;
    const key = process.env.SPEECH_KEY;
    const privateEndpoint = process.env.SPEECH_PRIVATE_ENDPOINT; // optional, e.g. https://my-speech.cognitiveservices.azure.com

    if (!region || !key) {
      context.res = {
        status: 500,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        body: JSON.stringify({
          error: "Missing SPEECH_REGION or SPEECH_KEY in app settings.",
          expectedEnv: ["SPEECH_REGION", "SPEECH_KEY"],
          optionalEnv: ["SPEECH_PRIVATE_ENDPOINT"]
        })
      };
      return;
    }

    // Azure Speech Avatar relay token endpoint.
    // Public endpoint: https://{region}.tts.speech.microsoft.com/cognitiveservices/avatar/relay/token/v1
    // Private endpoint variant: {privateEndpoint}/tts/cognitiveservices/avatar/relay/token/v1
    const url = privateEndpoint
      ? `${privateEndpoint.replace(/\/$/, "")}/tts/cognitiveservices/avatar/relay/token/v1`
      : `https://${region}.tts.speech.microsoft.com/cognitiveservices/avatar/relay/token/v1`;

    const r = await fetch(url, {
      method: "GET",
      headers: { "Ocp-Apim-Subscription-Key": key }
    });

    const text = await r.text();

    if (!r.ok) {
      context.res = {
        status: r.status,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        body: JSON.stringify({ error: "Failed to fetch avatar relay token", details: text })
      };
      return;
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      context.res = {
        status: 502,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        body: JSON.stringify({
          error: "Avatar relay token response was not valid JSON",
          details: text
        })
      };
      return;
    }

    // Common shape observed in samples:
    // { Urls: ["turn:..."], Username: "...", Password: "..." }
    const urls = data.Urls || data.urls || data.URLs || (data.iceServers && data.iceServers[0] && data.iceServers[0].urls);
    const username = data.Username || data.username || data.userName || data.iceUsername;
    const credential = data.Password || data.password || data.credential || data.iceCredential;

    if (!urls || !username || !credential) {
      context.res = {
        status: 502,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        body: JSON.stringify({
          error: "Avatar relay token response missing expected fields",
          gotKeys: Object.keys(data || {}),
          sample: data
        })
      };
      return;
    }

    const urlsArray = Array.isArray(urls) ? urls : [urls];

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({ urls: urlsArray, username, credential })
    };
  } catch (err) {
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({ error: "Server error", details: err.message })
    };
  }
};
