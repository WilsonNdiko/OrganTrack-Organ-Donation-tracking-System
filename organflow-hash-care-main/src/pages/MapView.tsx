import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";
import HeartbeatDivider from "@/components/HeartbeatDivider";

const MapView = () => {
  const routes = [
    {
      from: "Nairobi Blood Bank",
      to: "Nairobi General Hospital",
      organ: "Heart",
      eta: "15 min",
      color: "text-red-500",
    },
    {
      from: "Mombasa Medical Center",
      to: "Coast General Hospital",
      organ: "Cornea",
      eta: "45 min",
      color: "text-blue-500",
    },
    {
      from: "Kisumu Regional Hospital",
      to: "Nakuru Level 5 Hospital",
      organ: "Kidney",
      eta: "1.5 hours",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">Live Tracking Map</h1>
          <p className="text-muted-foreground">
            Real-time visualization of organ transport across the network
          </p>
        </div>

        <HeartbeatDivider />

        {/* Map Container */}
        <Card className="glass-card glow-on-hover mb-8">
          <CardContent className="p-0">
            <div className="relative w-full h-[500px] bg-gradient-to-br from-primary/5 via-secondary/5 to-accent rounded-lg overflow-hidden">
              {/* Placeholder Map - In production, integrate with actual map library */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <MapPin className="w-16 h-16 text-primary mx-auto animate-pulse" />
                  <div>
                    <h3 className="text-2xl font-display font-semibold text-foreground">
                      Interactive Map
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      Real-time organ transport tracking visualization
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      (Map integration via Mapbox/Leaflet coming soon)
                    </p>
                  </div>
                </div>
              </div>

              {/* Animated Route Indicators */}
              <div className="absolute top-20 left-20 w-4 h-4 bg-red-500 rounded-full animate-pulse-glow" />
              <div className="absolute bottom-32 right-32 w-4 h-4 bg-blue-500 rounded-full animate-pulse-glow" />
              <div className="absolute top-40 right-40 w-4 h-4 bg-purple-500 rounded-full animate-pulse-glow" />
            </div>
          </CardContent>
        </Card>

        {/* Active Routes */}
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-6">Active Routes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route, index) => (
              <Card
                key={index}
                className="glass-card glow-on-hover animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-display">
                    <Navigation className={`w-5 h-5 ${route.color}`} />
                    {route.organ} Transport
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">From</p>
                      <p className="text-sm font-medium text-foreground">{route.from}</p>
                    </div>
                    <div className="border-l-2 border-dashed border-border pl-3 ml-2">
                      <p className="text-xs text-muted-foreground">ETA: {route.eta}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">To</p>
                      <p className="text-sm font-medium text-foreground">{route.to}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
