
export interface TranscriptionWord {
  word: string;
  start: number;
  end: number;
  speaker: number;
  confidence: number;
  isFiller: boolean;
}

export interface TranscriptionResult {
  words: TranscriptionWord[];
  error?: string;
}

export interface AudioState {
  isRecording: boolean;
  error: string | null;
  hasApiKey: boolean;
}
