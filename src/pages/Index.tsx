
import AudioTranscriber from "@/components/AudioTranscriber";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-semibold text-center mb-8">Audio Transcription</h1>
        <AudioTranscriber />
      </div>
    </div>
  );
};

export default Index;
