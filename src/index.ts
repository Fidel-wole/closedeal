import express, { Application } from 'express';
import http from 'http';
import WebSocket from 'ws';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDB from './db/mongoose';
import v1Router from './routes';
import appConfig from './configs/app';
import { processConversation } from './utils/functions';

const app: Application = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(appConfig.apiV1URL, v1Router);

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', async (message: string) => {
    try {
      const data = JSON.parse(message);
      const { text } = data;
      const { prompt, analysis } = await processConversation(text);
      ws.send(JSON.stringify({ prompt, analysis }));
    } catch (error) {
      console.error('Error processing conversation:', error);
      ws.send(JSON.stringify({ error: 'Failed to process conversation' }));
    }
  });

  ws.on('close', () => {
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
  } catch (err: any) {
    console.error('Error starting server', err);
  }
}

startServer();
