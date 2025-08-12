import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Process } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AdminControlsProps {
  process: Process;
}

export function AdminControls({ process }: AdminControlsProps) {
  const [open, setOpen] = useState(false);
  const [speedFactor, setSpeedFactor] = useState(1);
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();

  const updateProcessMutation = useMutation({
    mutationFn: async (updates: Partial<Process>) => {
      return apiRequest(`/api/processes/${process.id}`, {
        method: "PATCH",
        body: updates,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/processes"] });
    },
  });

  const handleSpeedBoost = () => {
    const newProgress = Math.min(100, process.progress + speedFactor * 10);
    const newDuration = Math.max(1, (process.estimatedDuration || 60) - speedFactor * 5);
    
    updateProcessMutation.mutate({
      progress: newProgress,
      estimatedDuration: newDuration,
      status: newProgress >= 100 ? "completed" : process.status
    });
    setOpen(false);
  };

  const handleForceStop = () => {
    updateProcessMutation.mutate({
      status: "stopped",
      errorMessage: note || "Process stopped by administrator"
    });
    setOpen(false);
  };

  const handleMarkCompleted = () => {
    updateProcessMutation.mutate({
      status: "completed",
      progress: 100
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            variant="outline" 
            size="sm"
            className="border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300 dark:hover:bg-orange-900"
            data-testid="admin-controls"
          >
            <Shield className="mr-2 h-4 w-4" />
            Admin Controls
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-600" />
            Admin Controls - {process.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Speed Boost */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-600" />
                Speed Boost Process
              </CardTitle>
              <CardDescription>
                Accelerate process completion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="speed-factor">Speed Factor</Label>
                <Input
                  id="speed-factor"
                  type="number"
                  min="1"
                  max="5"
                  value={speedFactor}
                  onChange={(e) => setSpeedFactor(Number(e.target.value))}
                  className="w-20"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Will advance progress by {speedFactor * 10}% and reduce duration by {speedFactor * 5} minutes
                </p>
              </div>
              <Button 
                onClick={handleSpeedBoost}
                className="w-full"
                variant="default"
                disabled={process.status === "completed"}
                data-testid="speed-boost-button"
              >
                <Zap className="mr-2 h-4 w-4" />
                Apply Speed Boost
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={handleMarkCompleted}
                className="w-full"
                variant="default"
                disabled={process.status === "completed"}
                data-testid="mark-completed-button"
              >
                Mark as Completed
              </Button>
            </CardContent>
          </Card>

          {/* Force Stop */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                Force Stop Process
              </CardTitle>
              <CardDescription>
                Immediately stop the process with a custom message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="stop-note">Reason (optional)</Label>
                <Textarea
                  id="stop-note"
                  placeholder="Enter reason for stopping process..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="resize-none"
                  rows={2}
                />
              </div>
              <Button
                onClick={handleForceStop}
                variant="destructive"
                className="w-full"
                disabled={process.status === "stopped" || process.status === "completed"}
                data-testid="force-stop-button"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Force Stop
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}