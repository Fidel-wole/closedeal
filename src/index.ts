import express, { Application } from "express";
import http from "http";
import WebSocket from "ws";
import bodyParser from "body-parser";
import cors from "cors";
import { AssemblyAI, RealtimeTranscript } from "assemblyai";
import connectDB from "./db/mongoose";
import v1Router from "./routes";
import appConfig from "./configs/app";
import { processConversation } from "./utils/functions";
//import { authenticateAndJoinMeet } from "./utils/bot";


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

  let isTranscriberReady = false;

  transcriber.on("open", ({ sessionId }) => {
    console.log(`Session opened with ID: ${sessionId}`);
    isTranscriberReady = true;
    ws.send(JSON.stringify({ event: "ready", sessionId }));
  });

  transcriber.on("error", (error: Error) => {
    console.error("Transcriber error:", error);
    ws.send(JSON.stringify({ event: "error", message: error.message }));
  });

  transcriber.on("close", (code: number, reason: string) => {
    console.log("Session closed:", code, reason);
    isTranscriberReady = false;
    ws.send(JSON.stringify({ event: "closed", code, reason }));
  });

  transcriber.on("transcript", (transcript: RealtimeTranscript) => {
    console.log("Received transcript:", transcript);

    // Check if the transcript has text
    if (transcript.text) {
      if (transcript.message_type === "FinalTranscript") {
        console.log("Final transcript:", transcript.text);
        ws.send(
          JSON.stringify({ event: "finalTranscript", text: transcript.text })
        );

        // Process the conversation with the final transcript
        processConversation(transcript.text)
          .then(({ prompt, analysis }) => {
            ws.send(JSON.stringify({ event: "analysis", prompt, analysis }));
          })
          .catch((error) => {
            console.error("Error processing conversation:", error);
            ws.send(
              JSON.stringify({
                event: "error",
                message: "Failed to process conversation",
              })
            );
          });
      } else {
        console.log("Partial transcript:", transcript.text);
        ws.send(
          JSON.stringify({ event: "partialTranscript", text: transcript.text })
        );
      }
    } else {
      console.warn("Received transcript with empty text.");
    }
  });

  ws.on("message", async (message: string) => {
    try {
      const msg = JSON.parse(message);

      if (msg.event === "start") {
        console.log("Starting real-time transcript service");
        await transcriber.connect();
      } else if (msg.event === "audio") {
        if (isTranscriberReady) {
          const audioBuffer = Buffer.from(msg.audio, "base64");
          console.log("Received audio buffer of size:", audioBuffer.length);

          // Split the buffer into smaller chunks
          const CHUNK_SIZE = 50000; // Adjust as needed
          for (let i = 0; i < audioBuffer.length; i += CHUNK_SIZE) {
            const chunk = audioBuffer.slice(i, i + CHUNK_SIZE);
            console.log(`Sending audio chunk of size: ${chunk.length}`);
            transcriber.sendAudio(chunk);
          }
        } else {
          console.error("Transcriber not ready.");
          ws.send(
            JSON.stringify({
              event: "error",
              message: "Transcriber is not ready",
            })
          );
        }
      } else if (msg.event === "stop") {
        console.log("Stopping real-time transcript service");
        await transcriber.close();
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
      ws.send(
        JSON.stringify({ event: "error", message: "Internal server error" })
      );
    }
  });

  ws.on("close", async () => {
    console.log("Client disconnected");
    await transcriber.close();
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB(); // Connect to the database

    server.listen(PORT, () => {
      console.log(`Server listening at http://localhost:${PORT}`);
    });

   // await authenticateAndJoinMeet('https://meet.google.com/psr-opjq-jic');
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
}

// Start the server
startServer();