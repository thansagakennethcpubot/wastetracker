import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Sidebar } from "@/components/sidebar";
import { StatsOverview } from "@/components/stats-overview";
import { ProcessCard } from "@/components/process-card";
import { AddProcessForm } from "@/components/add-process-form";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Bell, Filter, RotateCcw } from "lucide-react";
import type { Process } from "@shared/schema";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: processes = [], isLoading: processesLoading } = useQuery<Process[]>({
    queryKey: ["/api/processes"],
    enabled: isAuthenticated,
  });

  const updateProcessMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: string }) => {
      return await apiRequest("POST", `/api/processes/${id}/${action}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/processes"] });
      toast({
        title: "Success",
        description: "Process updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update process",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Filter processes
  const filteredProcesses = processes.filter((process) => {
    const matchesSearch = process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         process.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || process.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    running: processes.filter((p) => p.status === "running").length,
    paused: processes.filter((p) => p.status === "paused").length,
    errors: processes.filter((p) => p.status === "error").length,
    stopped: processes.filter((p) => p.status === "stopped" || p.status === "completed").length,
  };

  const handleProcessAction = (id: string, action: string) => {
    updateProcessMutation.mutate({ id, action });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      <div className="lg:pl-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            data-testid="button-menu-toggle"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="text-gray-400" size={20} />
              </div>
              <Input
                className="block h-full w-full border-0 py-0 pl-10 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                placeholder="Search processes..."
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search"
              />
            </div>
            
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Button variant="ghost" size="sm" data-testid="button-notifications">
                <Bell className="h-5 w-5 text-gray-400" />
              </Button>
              
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />
              
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white font-medium text-sm" data-testid="text-user-initials">
                    {(user as User)?.firstName?.[0] || (user as User)?.email?.[0] || "U"}
                  </span>
                </div>
                <span className="hidden lg:block text-gray-700 font-medium" data-testid="text-user-name">
                  {(user as User)?.firstName ? `${(user as User).firstName} ${(user as User).lastName || ""}`.trim() : (user as User)?.email || "User"}
                </span>
                <a
                  href="/api/logout"
                  className="text-sm text-gray-500 hover:text-gray-700"
                  data-testid="link-logout"
                >
                  Logout
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
                  Waste Process Dashboard
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Monitor and manage your waste processing operations
                </p>
              </div>
              <AddProcessForm />
            </div>

            {/* Stats Overview */}
            <StatsOverview stats={stats} />

            {/* Filter Controls */}
            <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                    data-testid="button-filter-all"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    All Processes
                  </Button>
                  <Button
                    variant={statusFilter === "running" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("running")}
                    className="text-success bg-success bg-opacity-10 hover:bg-opacity-20 border-success"
                    data-testid="button-filter-running"
                  >
                    Running
                  </Button>
                  <Button
                    variant={statusFilter === "error" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("error")}
                    className="text-error bg-error bg-opacity-10 hover:bg-opacity-20 border-error"
                    data-testid="button-filter-errors"
                  >
                    Errors Only
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Auto-refresh:</span>
                  <Button variant="outline" size="sm" data-testid="button-auto-refresh">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    30s
                  </Button>
                </div>
              </div>
            </div>

            {/* Process Grid */}
            {processesLoading ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white shadow-sm rounded-lg p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProcesses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">No processes found</div>
                <p className="text-gray-400 mb-4">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filters"
                    : "Get started by adding your first waste processing operation"
                  }
                </p>
                {!searchTerm && statusFilter === "all" && <AddProcessForm />}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {filteredProcesses.map((process) => (
                  <ProcessCard
                    key={process.id}
                    process={process}
                    onAction={handleProcessAction}
                    loading={updateProcessMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
    </PageTransition>
  );
}
