import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Proxy to LINE Notify (CORS Bypass & Key Protection)
  app.post("/api/line-notify", async (req, res) => {
    try {
      const { token, message, imageThumbnail, imageFullsize } = req.body;
      if (!token || !message) {
        return res.status(400).json({ success: false, error: "Missing token or message" });
      }

      const params = new URLSearchParams();
      params.append("message", message);
      if (imageThumbnail) params.append("imageThumbnail", imageThumbnail);
      if (imageFullsize) params.append("imageFullsize", imageFullsize);

      const response = await fetch("https://notify-api.line.me/api/notify", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { text: responseText };
      }

      return res.status(response.status).json(responseData);
    } catch (err: any) {
      console.error("LINE Notify proxy error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Proxy to LINE Messaging API (CORS Bypass & Key Protection)
  app.post("/api/line-flex", async (req, res) => {
    try {
      const { channelAccessToken, to, messages } = req.body;
      if (!channelAccessToken || !to || !messages) {
        return res.status(400).json({ success: false, error: "Missing parameters" });
      }

      const response = await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${channelAccessToken}`
        },
        body: JSON.stringify({ to, messages })
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { text: responseText };
      }

      return res.status(response.status).json(responseData);
    } catch (err: any) {
      console.error("LINE Flex proxy error:", err);
      return res.status(500).json({ success: false, error: err.message });
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
