import { Play, Pause, AlertTriangle, Square } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsOverviewProps {
  stats: {
    running: number;
    paused: number;
    errors: number;
    stopped: number;
  };
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const statItems = [
    {
      label: "Running",
      value: stats.running,
      icon: Play,
      color: "success",
      bgColor: "bg-success bg-opacity-20",
      textColor: "text-success",
    },
    {
      label: "Paused",
      value: stats.paused,
      icon: Pause,
      color: "warning",
      bgColor: "bg-warning bg-opacity-20",
      textColor: "text-warning",
    },
    {
      label: "Errors",
      value: stats.errors,
      icon: AlertTriangle,
      color: "error",
      bgColor: "bg-error bg-opacity-20",
      textColor: "text-error",
    },
    {
      label: "Stopped",
      value: stats.stopped,
      icon: Square,
      color: "inactive",
      bgColor: "bg-inactive bg-opacity-20",
      textColor: "text-inactive",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="overflow-hidden shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={item.textColor} size={20} />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600" data-testid={`text-${item.label.toLowerCase()}-label`}>
                    {item.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900" data-testid={`text-${item.label.toLowerCase()}-value`}>
                    {item.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
