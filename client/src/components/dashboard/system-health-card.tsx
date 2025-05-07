import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export function SystemHealthCard() {
  // Fetching system health data
  const { data: health, isLoading } = useQuery({
    queryKey: ['/api/v1/dashboard/health'],
    staleTime: 30000, // 30 seconds
  });

  const getStatusClass = (value: number) => {
    if (value < 50) return "bg-success";
    if (value < 80) return "bg-warning";
    return "bg-error";
  };

  const getStatusText = (value: number) => {
    if (value < 50) return "text-success";
    if (value < 80) return "text-warning";
    return "text-error";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b p-4">
        <CardTitle className="text-lg font-medium">System Health</CardTitle>
        <span className="px-2 py-1 text-xs font-medium rounded bg-success text-white">
          All Systems Operational
        </span>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">API Response Time</span>
              <span className={`text-sm ${getStatusText(15)}`}>
                {isLoading ? "..." : health?.apiResponseTime || "145ms"}
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className={`${getStatusClass(15)} rounded-full h-2`} 
                style={{ width: "15%" }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Database Load</span>
              <span className={`text-sm ${getStatusText(32)}`}>
                {isLoading ? "..." : health?.databaseLoad || "32%"}
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className={`${getStatusClass(32)} rounded-full h-2`} 
                style={{ width: "32%" }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Memory Usage</span>
              <span className={`text-sm ${getStatusText(68)}`}>
                {isLoading ? "..." : health?.memoryUsage || "68%"}
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className={`${getStatusClass(68)} rounded-full h-2`}
                style={{ width: "68%" }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">WebSocket Connections</span>
              <span className={`text-sm ${getStatusText(40)}`}>
                {isLoading ? "..." : health?.wsConnections || "127"}
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-info rounded-full h-2" 
                style={{ width: "40%" }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 bg-neutral-50 rounded-lg p-3">
          <h3 className="text-sm font-medium mb-2">Server Logs</h3>
          <div className="text-xs space-y-2 font-mono">
            <div className="flex">
              <span className="text-info mr-2">[INFO]</span>
              <span>Rate limit config updated - 20 mins ago</span>
            </div>
            <div className="flex">
              <span className="text-success mr-2">[OK]</span>
              <span>DB backup completed - 3 hrs ago</span>
            </div>
            <div className="flex">
              <span className="text-warning mr-2">[WARN]</span>
              <span>High CPU usage detected - 5 hrs ago</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full mt-3 text-xs" 
            onClick={() => window.location.href = "/logs"}
          >
            View All Logs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default SystemHealthCard;
