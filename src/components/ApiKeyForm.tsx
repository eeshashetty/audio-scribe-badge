
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ApiKeyFormProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
}

const ApiKeyForm = ({ apiKey, setApiKey, onSubmit, error }: ApiKeyFormProps) => {
  return (
    <Card className="p-6 max-w-md mx-auto mt-10 backdrop-blur-sm bg-white/90">
      <form onSubmit={onSubmit} className="space-y-4">
        <h2 className="text-xl font-semibold text-center mb-4">Enter Your AssemblyAI API Key</h2>
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your API key"
          className="w-full"
        />
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        <Button type="submit" className="w-full">
          Save API Key
        </Button>
      </form>
    </Card>
  );
};

export default ApiKeyForm;
