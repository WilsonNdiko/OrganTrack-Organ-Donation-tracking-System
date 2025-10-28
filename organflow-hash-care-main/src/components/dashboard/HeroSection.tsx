import { Heart } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-secondary to-emerald-600 p-12 mb-8 animate-slide-up">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      {/* Glowing Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-10 h-10 text-white fill-white heartbeat" />
            <h1 className="text-5xl font-display font-bold text-white">
              Every heartbeat verified
            </h1>
          </div>
          <p className="text-xl text-white/90 max-w-2xl">
            Track organ donations and transplants with transparent blockchain verification powered
            by Hedera Hashgraph. Saving lives through technology and trust.
          </p>
        </div>

        {/* Animated Heart Icon */}
        <div className="hidden lg:block relative">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl animate-pulse-glow" />
          <Heart className="w-32 h-32 text-white fill-white/20 heartbeat relative z-10" />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
