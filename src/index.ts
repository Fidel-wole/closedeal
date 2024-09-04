import express, { Application } from "express";
import http from "http";
import WebSocket from "ws";
import bodyParser from "body-parser";
import cors from "cors";
import connectDB from "./db/mongoose";
import v1Router from "./routes";
import appConfig from "./configs/app";
import { processConversation } from "./utils/functions";
import axios from "axios";

// Initialize Express and WebSocket server
const app: Application = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(appConfig.apiV1URL, v1Router);

// AssemblyAI WebSocket URL
const ASSEMBLYAI_URL =
  "wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000";
const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;

if (!ASSEMBLYAI_API_KEY) {
  console.error("ASSEMBLYAI_API_KEY environment variable is not set");
  process.exit(1);
}

wss.on("connection", (ws) => {
  console.log("New client connected");
  let aaiSocket: WebSocket | null = null;

  ws.on("message", async (message: string) => {
    try {
      const msg = JSON.parse(message);

      if (msg.event === "start") {
        // Establish WebSocket connection with AssemblyAI
        if (aaiSocket) {
          console.log("Already connected to AssemblyAI WebSocket");
          aaiSocket.close(); // Close existing connection if any
        }
        aaiSocket = new WebSocket(ASSEMBLYAI_URL, {
          headers: {
            Authorization: `Bearer ${ASSEMBLYAI_API_KEY}`,
          },
        });

        aaiSocket.on("open", () => {
          console.log("Connected to AssemblyAI WebSocket");
          ws.send(
            JSON.stringify({
              event: "ready",
              message: "Ready to receive audio",
            })
          );
        });

        aaiSocket.on("message", (data) => {
          const response = JSON.parse(data.toString());
          console.log("Received from AssemblyAI:", response);
          const transcription = response.error || "Hi";
          ws.send(JSON.stringify({ event: "transcription", transcription }));

          processConversation(transcription)
            .then(({ prompt, analysis }) => {
              ws.send(JSON.stringify({ prompt, analysis }));
            })
            .catch((error) => {
              console.error("Error processing conversation:", error);
              ws.send(
                JSON.stringify({ error: "Failed to process conversation" })
              );
            });
        });

        aaiSocket.on("error", (error) => {
          console.error("Error in AssemblyAI WebSocket:", error);
        });
      } else if (msg.event === "audio") {
        if (aaiSocket && aaiSocket.readyState === WebSocket.OPEN) {
          const audioBuffer = Buffer.from(msg.audio, "base64");
          console.log("Received audio buffer:", audioBuffer);
          aaiSocket.send(audioBuffer);
        } else {
          console.error("AssemblyAI WebSocket is not open");
        }
      } else if (msg.event === "stop") {
        if (aaiSocket) {
          aaiSocket.close();
        }
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  });

  ws.on("close", () => {
    if (aaiSocket) {
      aaiSocket.close();
    }
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server listening at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Error starting server:", err);
  }
}

startServer();
