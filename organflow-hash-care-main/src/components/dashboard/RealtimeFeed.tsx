import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import StatusBadge from "../StatusBadge";

interface FeedItem {
  id: string;
  message: string;
  timestamp: string;
  status: "available" | "in-transit" | "transplanted";
}

const RealtimeFeed = () => {
  const feedItems: FeedItem[] = [
    {
      id: "1",
      message: "A new heart is en route to Nairobi General Hospital",
      timestamp: "2 min ago",
      status: "in-transit",
    },
    {
      id: "2",
      message: "Kidney successfully transplanted at Kenyatta Hospital",
      timestamp: "15 min ago",
      status: "transplanted",
    },
    {
      id: "3",
      message: "Liver donation registered - testing in progress",
      timestamp: "1 hour ago",
      status: "available",
    },
    {
      id: "4",
      message: "Heart transplant completed at Aga Khan Hospital",
      timestamp: "2 hours ago",
      status: "transplanted",
    },
    {
      id: "5",
      message: "Cornea shipment en route to Coast General Hospital",
      timestamp: "3 hours ago",
      status: "in-transit",
    },
  ];

  return (
    <Card className="glass-card glow-on-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Activity className="w-5 h-5 text-primary animate-pulse" />
          Real-Time Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {feedItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-all animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.timestamp}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RealtimeFeed;
