require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3000;

const AZURE_TRANSLATOR_KEY = process.env.AZURE_TRANSLATOR_KEY;
const AZURE_TRANSLATOR_REGION = process.env.AZURE_TRANSLATOR_REGION;

const endpoint = "https://api.cognitive.microsofttranslator.com/translate";
const apiVersion = "3.0";

app.get("/translate", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "Missing query string '?q='" });
  }

  try {
    const response = await axios.post(
      `${endpoint}?api-version=${apiVersion}&to=en`,
      [{ Text: query }],
      {
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_TRANSLATOR_KEY,
          "Ocp-Apim-Subscription-Region": AZURE_TRANSLATOR_REGION,
          "Content-Type": "application/json",
        },
      }
    );

    const result = response.data[0];
    const detected = result.detectedLanguage.language;
    const translated = result.translations[0].text;

    res.json({
      original: query,
      detected_language: detected,
      translated,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Translation failed" });
  }
});

app.listen(port, () => {
  console.log(`Translation API running on http://localhost:${port}`);
});
