import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, TestTube, Truck, Activity } from "lucide-react";

const LifecycleTimeline = () => {
  const stages = [
    {
      icon: Heart,
      label: "Donation",
      description: "Organ donated and registered",
      active: true,
      completed: true,
    },
    {
      icon: TestTube,
      label: "Testing",
      description: "Quality and compatibility checks",
      active: true,
      completed: true,
    },
    {
      icon: Truck,
      label: "Transit",
      description: "Secure transport to hospital",
      active: true,
      completed: false,
    },
    {
      icon: Activity,
      label: "Transplant",
      description: "Surgical procedure",
      active: false,
      completed: false,
    },
  ];

  return (
    <Card className="glass-card glow-on-hover">
      <CardHeader>
        <CardTitle className="font-display">Organ Lifecycle</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-muted" />

          <div className="space-y-8">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <div key={stage.label} className="relative flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 transition-all ${
                      stage.completed
                        ? "bg-primary border-primary shadow-lg shadow-primary/30"
                        : stage.active
                        ? "bg-secondary border-secondary pulse-glow"
                        : "bg-muted border-border"
                    }`}
                  >
                    <Icon
                      className={`w-7 h-7 ${
                        stage.completed || stage.active ? "text-white" : "text-muted-foreground"
                      } ${stage.active && !stage.completed ? "heartbeat" : ""}`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <h3
                      className={`text-lg font-display font-semibold ${
                        stage.active ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {stage.label}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LifecycleTimeline;
