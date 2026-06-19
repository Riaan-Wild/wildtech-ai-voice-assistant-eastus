const fetch = require("node-fetch");

module.exports = async function (context, req) {
  try {
    const region = process.env.SPEECH_REGION;
    const key = process.env.SPEECH_KEY;

    if (!region || !key) {
      context.res = {
        status: 500,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        body: JSON.stringify({
          error: "Missing SPEECH_REGION or SPEECH_KEY in app settings.",
          expectedEnv: ["SPEECH_REGION", "SPEECH_KEY"]
        })
      };
      return;
    }

    const tokenUrl = `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;

    const r = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Ocp-Apim-Subscription-Key": key }
    });

    if (!r.ok) {
      const text = await r.text();
      context.res = {
        status: r.status,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        body: JSON.stringify({ error: "Failed to fetch speech token", details: text })
      };
      return;
    }

    const token = await r.text();

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({ token, region })
    };
  } catch (err) {
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({ error: "Server error", details: err.message })
    };
  }
};
