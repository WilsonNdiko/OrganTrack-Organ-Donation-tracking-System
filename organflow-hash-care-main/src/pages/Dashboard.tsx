import HeroSection from "@/components/dashboard/HeroSection";
import StatsOverview from "@/components/dashboard/StatsOverview";
import RealtimeFeed from "@/components/dashboard/RealtimeFeed";
import LifecycleTimeline from "@/components/dashboard/LifecycleTimeline";
import HeartbeatDivider from "@/components/HeartbeatDivider";

const Dashboard = () => {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <HeroSection />
        <StatsOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RealtimeFeed />
          <LifecycleTimeline />
        </div>

        <HeartbeatDivider />
      </div>
    </div>
  );
};

export default Dashboard;
