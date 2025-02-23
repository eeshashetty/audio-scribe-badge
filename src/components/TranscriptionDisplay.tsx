
import { TranscriptionWord } from "@/types/transcription";

interface TranscriptionDisplayProps {
  words: TranscriptionWord[];
  isRecording: boolean;
}

const TranscriptionDisplay = ({ words, isRecording }: TranscriptionDisplayProps) => {
  return (
    <div className="space-y-4">
      {words.map((word, index) => (
        <div key={index} className="inline-block mr-2">
          <span className="text-gray-800">{word.word}</span>
          <span className="ml-1 text-xs text-gray-500">
            (Speaker {word.speaker})
          </span>
        </div>
      ))}

      {isRecording && words.length === 0 && (
        <div className="text-gray-500 animate-pulse">Listening...</div>
      )}
      {!isRecording && words.length === 0 && (
        <div className="text-gray-500">Click the start button to begin transcription</div>
      )}
    </div>
  );
};

export default TranscriptionDisplay;
