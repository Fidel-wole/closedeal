import bcrypt from "bcryptjs";
import appConfig from "../configs/app";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { JWT_ACCESS_SECRET } from "../configs/env";
import { ZodError } from "zod";
import { OpenAI } from "openai";
import { PassThrough, Readable } from 'stream';
import ffmpeg from 'fluent-ffmpeg';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, appConfig.constants.SALT_ROUNDS);
}

export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export function jsonwebtoken(userId: string, email: string): string {
  const secret = JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT access secret is not defined in the environment.");
  }

  return jwt.sign(
    {
      userId: userId,
      email: email,
    },
    secret,
    {
      expiresIn: "24h",
    }
  );
}

export const errorParser = (error: any) => {
  const DEFAULT_ERROR = "An error occurred";
  if (error instanceof ZodError) {
    return error.errors.map((err) => err.message);
  }
  if (error instanceof Error) {
    return [error.message];
  }
  if (typeof error === "string") {
    return [error];
  }
  return [DEFAULT_ERROR];
};

interface ProcessConversationResult {
  prompt: string;
  analysis: string;
}

export const processConversation = async (
  text: string,
  retries: number = 3
): Promise<ProcessConversationResult> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [
        { role: "system", content: "You are an AI assistant helping a salesperson during a call. Given the following text, suggest a helpful response or next question." },
        { role: "user", content: text },
      ],
    });

    const prompt = response.choices[0]?.message?.content || ""; 
    console.log(prompt);
    return {
      prompt,
      analysis:
        "This prompt was generated based on the context of the conversation.",
    };
  } catch (error: any) {
    if (retries > 0 && error.code === "insufficient_quota") {
      console.log("Rate limit exceeded. Retrying...");
      await new Promise((res) => setTimeout(res, 1000)); 
      return processConversation(text, retries - 1);
    } else {
      console.error("Error generating prompt:", error);
      return {
        prompt: "",
        analysis: "Failed to generate prompt due to an error.",
      };
    }
  }
};


// Configure your virtual audio device here
const VIRTUAL_AUDIO_DEVICE = 'default'; // Change as needed

export function getAudioStream(): Readable {
  const audioStream = new PassThrough();

  // Capture audio from the virtual audio device
  const ffmpegProcess = ffmpeg()
    .input(VIRTUAL_AUDIO_DEVICE)
    .inputFormat('wav') // Adjust based on your virtual audio device's format
    .audioCodec('pcm_s16le') // Set the audio codec to PCM
    .audioFilters('volume=1') // Optional: Adjust volume if needed
    .format('wav') // Output format
    .pipe(audioStream, { end: true });

  // Handle errors
  ffmpegProcess.on('error', (err: Error) => {
    console.error('Error capturing audio:', err);
    audioStream.end();
  });

  return audioStream;
}


