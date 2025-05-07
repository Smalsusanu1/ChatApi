import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export function StatusCards() {
  // Fetching dashboard stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/v1/dashboard/stats'],
    staleTime: 60000, // 1 minute
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-neutral-500 text-sm font-medium">Total Users</h3>
            <span className="material-icons text-primary-500">people</span>
          </div>
          <p className="text-2xl font-medium mt-2">
            {isLoading ? "..." : stats?.totalUsers || "0"}
          </p>
          <div className="flex items-center mt-2 text-xs text-success">
            <span className="material-icons text-xs mr-1">arrow_upward</span>
            <span>12% this week</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-neutral-500 text-sm font-medium">Active Admins</h3>
            <span className="material-icons text-secondary-500">admin_panel_settings</span>
          </div>
          <p className="text-2xl font-medium mt-2">
            {isLoading ? "..." : stats?.activeAdmins || "0"}
          </p>
          <div className="flex items-center mt-2 text-xs text-neutral-500">
            <span className="material-icons text-xs mr-1">remove</span>
            <span>No change</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-neutral-500 text-sm font-medium">API Requests</h3>
            <span className="material-icons text-info">public</span>
          </div>
          <p className="text-2xl font-medium mt-2">
            {isLoading ? "..." : stats?.apiRequests || "0"}
          </p>
          <div className="flex items-center mt-2 text-xs text-success">
            <span className="material-icons text-xs mr-1">arrow_upward</span>
            <span>23% this week</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-neutral-500 text-sm font-medium">Active Groups</h3>
            <span className="material-icons text-warning">group_work</span>
          </div>
          <p className="text-2xl font-medium mt-2">
            {isLoading ? "..." : stats?.activeGroups || "0"}
          </p>
          <div className="flex items-center mt-2 text-xs text-success">
            <span className="material-icons text-xs mr-1">arrow_upward</span>
            <span>4% this week</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StatusCards;
