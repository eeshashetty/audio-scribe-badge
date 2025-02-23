
import { useState, useRef, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import SpeakerBadge from "./SpeakerBadge";
import { TranscriptionWord, AudioState } from "@/types/transcription";
import { startRecording, stopRecording, processTranscription, createDeepgramSocket } from "@/utils/audioUtils";
import { cn } from "@/lib/utils";

const AudioTranscriber = () => {
  const [apiKey, setApiKey] = useState("");
  const [audioState, setAudioState] = useState<AudioState>({
    isRecording: false,
    error: null,
    hasApiKey: false,
  });
  const [words, setWords] = useState<TranscriptionWord[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.length < 10) {
      setAudioState(prev => ({ ...prev, error: "Invalid API key length" }));
      return;
    }
    setAudioState(prev => ({ ...prev, hasApiKey: true, error: null }));
    toast({
      title: "API Key Saved",
      description: "You can now start transcribing audio",
    });
  };

  const startTranscription = useCallback(async () => {
    try {
      const mediaRecorder = await startRecording();
      mediaRecorderRef.current = mediaRecorder;
      
      // Create WebSocket connection
      const socket = createDeepgramSocket(apiKey);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connection established");
        setAudioState(prev => ({ ...prev, isRecording: true, error: null }));
      };

      socket.onmessage = (message) => {
        try {
          const data = JSON.parse(message.data);
          console.log("Received transcription:", data);
          if (data.is_final) {
            const newWords = processTranscription(data);
            setWords(prev => [...prev, ...newWords]);
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setAudioState(prev => ({ ...prev, error: "WebSocket connection error" }));
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
      };

      // Send audio data to WebSocket
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
          socket.send(event.data);
        }
      };

      mediaRecorder.start(250); // Send chunks every 250ms
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

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        stopRecording(mediaRecorderRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  if (!audioState.hasApiKey) {
    return (
      <Card className="p-6 max-w-md mx-auto mt-10 backdrop-blur-sm bg-white/90">
        <form onSubmit={handleApiKeySubmit} className="space-y-4">
          <h2 className="text-xl font-semibold text-center mb-4">Enter Your Deepgram API Key</h2>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            className="w-full"
          />
          {audioState.error && (
            <p className="text-red-500 text-sm">{audioState.error}</p>
          )}
          <Button type="submit" className="w-full">
            Save API Key
          </Button>
        </form>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="p-6 backdrop-blur-sm bg-white/90">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Real-time Transcription</h2>
          <Button
            onClick={audioState.isRecording ? stopTranscription : startTranscription}
            variant={audioState.isRecording ? "destructive" : "default"}
            className="transition-all duration-200"
          >
            {audioState.isRecording ? (
              <><MicOff className="mr-2 h-4 w-4" /> Stop Recording</>
            ) : (
              <><Mic className="mr-2 h-4 w-4" /> Start Recording</>
            )}
          </Button>
        </div>

        {audioState.error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
            {audioState.error}
          </div>
        )}

        <div className="min-h-[200px] max-h-[400px] overflow-y-auto p-4 bg-transcript-bg rounded-lg border border-transcript-border">
          {words.map((word, index) => (
            <span
              key={`${word.word}-${index}`}
              className={cn(
                "inline-block mr-1",
                word.isFiller && "text-purple-600 font-medium",
                "transition-all duration-200"
              )}
            >
              {index > 0 && words[index - 1].speaker !== word.speaker && (
                <SpeakerBadge
                  speakerId={word.speaker}
                  className="mr-2"
                />
              )}
              {word.word}
            </span>
          ))}
          {audioState.isRecording && words.length === 0 && (
            <div className="text-gray-500 animate-pulse">Listening...</div>
          )}
          {!audioState.isRecording && words.length === 0 && (
            <div className="text-gray-500">Click the start button to begin transcription</div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AudioTranscriber;
