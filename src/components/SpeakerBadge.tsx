
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SpeakerBadgeProps {
  speakerId: number;
  className?: string;
}

const SpeakerBadge = ({ speakerId, className }: SpeakerBadgeProps) => {
  const speakerColor = `speaker-${(speakerId % 4) + 1}`;
  
  return (
    <Badge
      className={cn(
        "text-xs px-2 py-1 transition-all duration-200",
        `bg-speaker-${(speakerId % 4) + 1}`,
        className
      )}
    >
      Speaker {speakerId}
    </Badge>
  );
};

export default SpeakerBadge;
