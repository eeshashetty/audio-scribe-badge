
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { TranscriptionWord } from "@/types/transcription";
import { processTranscription } from "@/utils/audioUtils";
import { useAudioRecording } from "@/hooks/useAudioRecording";
import ApiKeyForm from "./ApiKeyForm";
import TranscriptionDisplay from "./TranscriptionDisplay";

const AudioTranscriber = () => {
  const [apiKey, setApiKey] = useState("");
  const [words, setWords] = useState<TranscriptionWord[]>([]);
  const { toast } = useToast();
  
  const {
    audioState,
    setAudioState,
    socketRef,
    startTranscription,
    stopTranscription
  } = useAudioRecording(apiKey);

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

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.onmessage = (message) => {
        try {
          const data = JSON.parse(message.data);
          console.log("Received transcription:", data);
          if (data.message_type === "FinalTranscript") {
            const newWords = processTranscription(data);
            setWords(prev => [...prev, ...newWords]);
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setAudioState(prev => ({ ...prev, error: "WebSocket connection error" }));
      };

      socketRef.current.onclose = () => {
        console.log("WebSocket connection closed");
      };
    }
  }, [socketRef.current]);

  useEffect(() => {
    return () => {
      stopTranscription();
    };
  }, [stopTranscription]);

  if (!audioState.hasApiKey) {
    return (
      <ApiKeyForm
        apiKey={apiKey}
        setApiKey={setApiKey}
        onSubmit={handleApiKeySubmit}
        error={audioState.error}
      />
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

        <TranscriptionDisplay 
          words={words}
          isRecording={audioState.isRecording}
        />
      </Card>
    </div>
  );
};

export default AudioTranscriber;
