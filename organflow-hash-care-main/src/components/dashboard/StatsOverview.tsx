import { Card, CardContent } from "@/components/ui/card";
import { Heart, TrendingUp, Users, CheckCircle } from "lucide-react";

const StatsOverview = () => {
  const stats = [
    {
      icon: Heart,
      label: "Total Organs",
      value: "1,247",
      change: "+12.5%",
      changeType: "positive" as const,
    },
    {
      icon: CheckCircle,
      label: "Transplanted",
      value: "896",
      change: "+8.2%",
      changeType: "positive" as const,
    },
    {
      icon: TrendingUp,
      label: "In Transit",
      value: "24",
      change: "+3",
      changeType: "neutral" as const,
    },
    {
      icon: Users,
      label: "Lives Saved",
      value: "896",
      change: "+8.2%",
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className="glass-card glow-on-hover animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <h3 className="text-3xl font-display font-bold text-foreground mt-2">
                    {stat.value}
                  </h3>
                  <p
                    className={`text-sm mt-2 font-medium ${
                      stat.changeType === "positive"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {stat.change} from last month
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsOverview;
