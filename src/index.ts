import express, { Application } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDB from './db/mongoose';
import v1Router from './routes';
import appConfig from './configs/app';
import { processConversation } from './utils/functions';

const app: Application = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(appConfig.apiV1URL, v1Router);

processConversation("Hello")
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('conversation', async (data: { text: string }) => {
    const { text } = data;
    const { prompt, analysis } = await processConversation(text);
    socket.emit('prompt', { prompt, analysis });
  });

  socket.on('disconnect', () => {
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
