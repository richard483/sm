const express = require('express');
// Make sure to use the latest SDK: npm install @google/genai
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;
const APP_PASSWORD = process.env.APP_PASSWORD;

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Increase JSON limit in case of large base64 image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Simple Password Middleware
const auth = (req, res, next) => {
  const userPass = req.headers['x-app-password'];
  if (userPass !== APP_PASSWORD) return res.status(401).send('Unauthorized');
  next();
};

app.post('/generate', auth, async (req, res) => {
  try {
    const { prompt, model, imageBase64, mimeType } = req.body;

    // Fallback to the strongest model if none is provided
    const selectedModel = model || "gemini-3-pro-image-preview";

    // Construct contents array. If an image is provided, append it.
    let contents = [prompt];
    if (imageBase64 && mimeType) {
      contents.push({
        inlineData: { data: imageBase64, mimeType: mimeType }
      });
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: contents,
    });

    // Return the first generated image (base64)
    const imageData = response.candidates[0].content.parts[0].inlineData.data;
    res.json({ image: imageData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));