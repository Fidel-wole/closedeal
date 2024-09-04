import express, { Application } from 'express';
import http from 'http';
import WebSocket from 'ws';
import bodyParser from 'body-parser';
import cors from 'cors';
import speech from '@google-cloud/speech';
import connectDB from './db/mongoose';
import v1Router from './routes';
import appConfig from './configs/app';
import { processConversation } from './utils/functions';
import fs from 'fs';
import path from 'path';

// Decode and set up Google Cloud credentials
const base64Key = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

if (base64Key) {
  const keyFilePath = path.join(__dirname, 'service-account-file.json');
  fs.writeFileSync(keyFilePath, Buffer.from(base64Key, 'base64'));
  
  // Set the environment variable for Google Cloud SDK
  process.env.GOOGLE_APPLICATION_CREDENTIALS = keyFilePath;
} else {
  console.error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set');
  process.exit(1);
}

// Initialize Express and WebSocket server
const app: Application = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(appConfig.apiV1URL, v1Router);

// Initialize Google Speech-to-Text client
const client = new speech.SpeechClient();

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New client connected');
  let recognizeStream: any = null;

  ws.on('message', async (message: string) => {
    try {
      const msg = JSON.parse(message);

      if (msg.event === 'start') {
        recognizeStream = client
          .streamingRecognize({
            config: {
              encoding: 'LINEAR16', // or 'FLAC', depending on your audio format
              sampleRateHertz: 16000, // Adjust to your actual sample rate
              languageCode: 'en-US',
            },  
            interimResults: true,
          })
          .on('error', (error) => {
            console.error('Error in recognizeStream:', error);
          })
          .on('data', (transcriptionData) => {
            const transcript = transcriptionData.results[0]?.alternatives[0]?.transcript || '';
            ws.send(JSON.stringify({ event: 'transcription', transcription: transcript }));

            processConversation(transcript).then(({ prompt, analysis }) => {
              ws.send(JSON.stringify({ prompt, analysis }));
            }).catch((error) => {
              console.error('Error processing conversation:', error);
              ws.send(JSON.stringify({ error: 'Failed to process conversation' }));
            });
          });
      } else if (msg.event === 'audio') {
        if (recognizeStream) {
          const audioBuffer = Buffer.from(msg.audio, 'base64');
          console.log('Received audio buffer:', audioBuffer);
          recognizeStream.write(audioBuffer);
        }
      } else if (msg.event === 'stop') {
        if (recognizeStream) {
          recognizeStream.end();
        }
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    if (recognizeStream) {
      recognizeStream.end();
    }
    console.log('Client disconnected');
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
    console.error('Error starting server:', err);
  }
}

startServer();
