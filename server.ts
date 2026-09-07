import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini Summary
  app.post("/api/gemini/neighborhood-summary", async (req, res) => {
    try {
      const { location, district, landmarks, walkScore } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Return a realistic simulation summary if key is missing, so it doesn't fail hard
        console.warn("GEMINI_API_KEY is not defined in environment variables.");
        return res.json({
          summary: `This beautiful home in the ${location}, ${district} area is exceptionally situated. Boasting a solid walkability score of ${walkScore}/100, the neighborhood is highly convenient. Residents can easily access local transit options (such as ${landmarks?.transit?.[0]?.name || 'the nearby transit line'} just minutes away), reputable academic institutions, daily convenience stores, and quality healthcare clinics without relying heavily on personal commute vehicles.`
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const landmarksText = JSON.stringify(landmarks || {});

      const prompt = `You are a real estate and neighborhood expert. Analyze the neighborhood metrics for ${location}, ${district} and write a short, highly professional, elegant 2-3 sentence description of its walkability, convenience features, and urban integration.

Neighborhood Details:
- Location name: ${location}
- District: ${district}
- Walkability Score: ${walkScore}/100
- Proximity Landmarks: ${landmarksText}

Ensure the tone is warm, objective, and highly professional. Do not use generic filler words, and keep it extremely concise (under 80 words total). Focus on how walkable it is to daily essentials. Do not include titles or headings.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
        },
      });

      const summaryText = response.text?.trim() || "";
      res.json({ summary: summaryText });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: error.message || "Failed to generate neighborhood summary" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
