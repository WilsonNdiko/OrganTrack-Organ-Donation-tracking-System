import { Heart } from "lucide-react";

const HeartbeatDivider = () => {
  return (
    <div className="flex items-center justify-center my-8 gap-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="relative">
        <Heart className="w-6 h-6 text-primary fill-primary heartbeat" />
        <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg" />
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
};

export default HeartbeatDivider;
