
import { useState, useRef, useCallback } from 'react';
import { AudioState } from '@/types/transcription';
import { startRecording, stopRecording, createAssemblyAISocket, processTranscription } from '@/utils/audioUtils';

export const useAudioRecording = (apiKey: string) => {
  const [audioState, setAudioState] = useState<AudioState>({
    isRecording: false,
    error: null,
    hasApiKey: false,
  });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const startTranscription = useCallback(async () => {
    try {
      const mediaRecorder = await startRecording();
      mediaRecorderRef.current = mediaRecorder;
      
      const socket = createAssemblyAISocket(apiKey);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connection established");
        socket.send(JSON.stringify({ 
          audio_data: "" 
        }));
        setAudioState(prev => ({ ...prev, isRecording: true, error: null }));
      };

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
          const arrayBuffer = await event.data.arrayBuffer();
          const base64Audio = btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
          socket.send(JSON.stringify({
            audio_data: base64Audio
          }));
        }
      };

      mediaRecorder.start(100);
    } catch (error) {
      console.error("Error starting recording:", error);
      setAudioState(prev => ({ ...prev, error: error.message }));
    }
  }, [apiKey]);

  const stopTranscription = useCallback(() => {
    if (mediaRecorderRef.current) {
      stopRecording(mediaRecorderRef.current);
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setAudioState(prev => ({ ...prev, isRecording: false }));
  }, []);

  return {
    audioState,
    setAudioState,
    socketRef,
    startTranscription,
    stopTranscription
  };
};
