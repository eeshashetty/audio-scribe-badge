
import { TranscriptionWord } from "@/types/transcription";

const FILLER_WORDS = new Set([
  "um", "uh", "er", "ah", "like", "you know", "basically",
  "actually", "literally", "kind of", "sort of"
]);

export const checkIsFiller = (word: string): boolean => {
  return FILLER_WORDS.has(word.toLowerCase());
};

export const startRecording = async (): Promise<MediaRecorder> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const options = { mimeType: 'audio/webm' };
    const mediaRecorder = new MediaRecorder(stream, options);
    console.log("Recording started successfully");
    return mediaRecorder;
  } catch (error) {
    console.error("Error accessing microphone:", error);
    throw error;
  }
};

export const stopRecording = (mediaRecorder: MediaRecorder) => {
  mediaRecorder.stop();
  mediaRecorder.stream.getTracks().forEach(track => track.stop());
  console.log("Recording stopped");
};

export const createDeepgramSocket = (apiKey: string): WebSocket => {
  const socket = new WebSocket(`wss://api.deepgram.com/v1/listen?model=nova-2&diarize=true&filler_words=true`, [
    'token',
    apiKey,
  ]);
  
  return socket;
};

export const processTranscription = (result: any): TranscriptionWord[] => {
  try {
    if (!result?.channel?.alternatives?.[0]?.words) {
      console.error("Invalid transcription result format:", result);
      return [];
    }

    return result.channel.alternatives[0].words.map((word: any) => ({
      word: word.word || word.punctuated_word,
      start: word.start,
      end: word.end,
      speaker: word.speaker || 0,
      confidence: word.confidence || 1,
      isFiller: checkIsFiller(word.word || word.punctuated_word)
    }));
  } catch (error) {
    console.error("Error processing transcription:", error);
    return [];
  }
};
