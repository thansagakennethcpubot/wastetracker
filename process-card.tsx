import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Eye, Cog, Play, Wrench, RotateCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Process } from "@shared/schema";

interface ProcessCardProps {
  process: Process;
  onAction: (id: string, action: string) => void;
  loading?: boolean;
}

export function ProcessCard({ process, onAction, loading }: ProcessCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "running":
        return { 
          color: "bg-success text-success", 
          bgOpacity: "bg-success bg-opacity-20",
          progressColor: "bg-success" 
        };
      case "paused":
        return { 
          color: "bg-warning text-warning", 
          bgOpacity: "bg-warning bg-opacity-20",
          progressColor: "bg-warning" 
        };
      case "error":
        return { 
          color: "bg-error text-error", 
          bgOpacity: "bg-error bg-opacity-20",
          progressColor: "bg-error" 
        };
      case "stopped":
      case "completed":
        return { 
          color: "bg-inactive text-inactive", 
          bgOpacity: "bg-inactive bg-opacity-20",
          progressColor: "bg-inactive" 
        };
      default:
        return { 
          color: "bg-gray-500 text-gray-500", 
          bgOpacity: "bg-gray-500 bg-opacity-20",
          progressColor: "bg-gray-500" 
        };
    }
  };

  const statusConfig = getStatusConfig(process.status);
  
  const getActionButton = () => {
    switch (process.status) {
      case "running":
        return (
          <Button
            size="sm"
            onClick={() => onAction(process.id, "pause")}
            disabled={loading}
            data-testid={`button-pause-${process.id}`}
          >
            <Cog className="mr-2 h-4 w-4" />
            Manage
          </Button>
        );
      case "paused":
        return (
          <Button
            size="sm"
            className="bg-success hover:bg-green-700 text-white"
            onClick={() => onAction(process.id, "start")}
            disabled={loading}
            data-testid={`button-resume-${process.id}`}
          >
            <Play className="mr-2 h-4 w-4" />
            Resume
          </Button>
        );
      case "error":
        return (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onAction(process.id, "start")}
            disabled={loading}
            data-testid={`button-fix-${process.id}`}
          >
            <Wrench className="mr-2 h-4 w-4" />
            Fix Error
          </Button>
        );
      case "stopped":
      case "completed":
        return (
          <Button
            size="sm"
            className="bg-success hover:bg-green-700 text-white"
            onClick={() => onAction(process.id, "start")}
            disabled={loading}
            data-testid={`button-restart-${process.id}`}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restart
          </Button>
        );
      default:
        return (
          <Button
            size="sm"
            onClick={() => onAction(process.id, "start")}
            disabled={loading}
            data-testid={`button-start-${process.id}`}
          >
            <Play className="mr-2 h-4 w-4" />
            Start
          </Button>
        );
    }
  };

  const getTimeInfo = () => {
    if (process.status === "completed" && process.completedAt) {
      return {
        label: "Completed",
        value: formatDistanceToNow(new Date(process.completedAt), { addSuffix: true }),
      };
    } else if (process.status === "stopped" && process.completedAt) {
      return {
        label: "Stopped",
        value: formatDistanceToNow(new Date(process.completedAt), { addSuffix: true }),
      };
    } else if (process.startedAt) {
      return {
        label: "Started",
        value: formatDistanceToNow(new Date(process.startedAt), { addSuffix: true }),
      };
    }
    return null;
  };

  const timeInfo = getTimeInfo();

  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={`card-process-${process.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2" data-testid={`text-process-name-${process.id}`}>
              {process.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4" data-testid={`text-process-description-${process.id}`}>
              {process.description}
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge
                  className={`${statusConfig.bgOpacity} ${statusConfig.color} font-medium`}
                  data-testid={`badge-status-${process.id}`}
                >
                  <div className="w-2 h-2 rounded-full bg-current mr-1" />
                  {process.status.charAt(0).toUpperCase() + process.status.slice(1)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Progress:</span>
                <div className="flex-1 ml-4">
                  <Progress 
                    value={process.progress} 
                    className="w-full"
                    data-testid={`progress-${process.id}`}
                  />
                </div>
                <span className="text-sm text-gray-900 ml-2" data-testid={`text-progress-${process.id}`}>
                  {process.status === "completed" ? "Complete" : `${Math.round(process.progress)}%`}
                </span>
              </div>
              
              {timeInfo && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{timeInfo.label}:</span>
                  <span className="text-sm text-gray-900" data-testid={`text-time-${process.id}`}>
                    {timeInfo.value}
                  </span>
                </div>
              )}
              
              {process.status === "error" && process.errorMessage && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Error:</span>
                  <span className="text-sm text-error" data-testid={`text-error-${process.id}`}>
                    {process.errorMessage}
                  </span>
                </div>
              )}
              
              {process.estimatedDuration && process.status === "running" && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">ETA:</span>
                  <span className="text-sm text-gray-900" data-testid={`text-eta-${process.id}`}>
                    {process.estimatedDuration} minutes
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            data-testid={`button-details-${process.id}`}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
          {getActionButton()}
        </div>
      </CardContent>
    </Card>
  );
}
