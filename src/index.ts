import express, { Application } from "express";
import http from "http";
import WebSocket from "ws";
import bodyParser from "body-parser";
import cors from "cors";
import { AssemblyAI, RealtimeTranscript } from 'assemblyai';
import connectDB from "./db/mongoose";
import v1Router from "./routes";
import appConfig from "./configs/app";
import { processConversation } from "./utils/functions";

const app: Application = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(appConfig.apiV1URL, v1Router);

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY as string;

const client = new AssemblyAI({
  apiKey: ASSEMBLYAI_API_KEY,
});

wss.on("connection", (ws) => {
  console.log("New client connected");
  let transcriber = client.realtime.transcriber({
    sampleRate: 16000,
  });

  transcriber.on('open', ({ sessionId }) => {
    console.log(`Session opened with ID: ${sessionId}`);
    ws.send(JSON.stringify({ event: 'ready', sessionId }));
  });

  transcriber.on('error', (error: Error) => {
    console.error('Error:', error);
    ws.send(JSON.stringify({ event: 'error', message: error.message }));
  });

  transcriber.on('close', (code: number, reason: string) => {
    console.log('Session closed:', code, reason);
    ws.send(JSON.stringify({ event: 'closed', code, reason }));
  });

  transcriber.on('transcript', (transcript: RealtimeTranscript) => {
    console.log('Received:', transcript);
    if (!transcript.text) return;
    
    if (transcript.message_type == 'FinalTranscript') {
      console.log('Final:', transcript.text);
      ws.send(JSON.stringify({ event: 'finalTranscript', text: transcript.text }));
      
      // Process the conversation with the final transcript
      processConversation(transcript.text)
        .then(({ prompt, analysis }) => {
          ws.send(JSON.stringify({ event: 'analysis', prompt, analysis }));
        })
        .catch((error) => {
          console.error("Error processing conversation:", error);
          ws.send(JSON.stringify({ event: 'error', message: "Failed to process conversation" }));
        });
    } else {
      console.log('Partial:', transcript.text);
      ws.send(JSON.stringify({ event: 'partialTranscript', text: transcript.text }));
    }
  });

  ws.on("message", async (message: string) => {
    try {
      const msg = JSON.parse(message);

      if (msg.event === "start") {
        console.log('Connecting to real-time transcript service');
        await transcriber.connect();
      } else if (msg.event === "audio") {
        const audioBuffer = Buffer.from(msg.audio, "base64");
        console.log("Audio buffer: ", audioBuffer)
        console.log('Received audio chunk of size:', audioBuffer.length);

        // Add check for size and format (length should be reasonable)
        if (audioBuffer.length < 1000) {
          console.log('Audio too short or invalid.');
          ws.send(JSON.stringify({ event: 'error', message: 'Invalid audio length or format' }));
          return;
        }

        transcriber.sendAudio(audioBuffer);
      } else if (msg.event === "stop") {
        console.log('Closing real-time transcript connection');
        await transcriber.close();
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
      ws.send(JSON.stringify({ event: 'error', message: "Internal server error" }));
    }
  });

  ws.on("close", async () => {
    console.log("Client disconnected");
    await transcriber.close();
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
    process.exit(1);
  }
}

startServer();
