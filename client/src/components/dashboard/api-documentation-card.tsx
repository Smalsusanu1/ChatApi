import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ApiDocumentationCard() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between border-b p-4">
        <CardTitle className="text-lg font-medium">API Documentation</CardTitle>
        <Button variant="link" className="text-primary-500 px-3 py-1 rounded hover:bg-primary-50">
          View All
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
          <div className="p-2 bg-primary-50 rounded-lg mb-2 sm:mb-0 sm:mr-4">
            <span className="material-icons text-primary-500">description</span>
          </div>
          <div>
            <h3 className="font-medium">User API Documentation</h3>
            <p className="text-sm text-neutral-500">Endpoints for user authentication and messaging</p>
            <div className="mt-1">
              <span className="text-xs bg-neutral-100 px-2 py-1 rounded-md font-mono">/api/docs/user</span>
            </div>
          </div>
          <a href="/api/docs/user" className="ml-auto mt-2 sm:mt-0 text-sm px-3 py-1 bg-primary-500 text-white rounded-full hover:bg-primary-700">
            Explore
          </a>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
          <div className="p-2 bg-secondary-50 rounded-lg mb-2 sm:mb-0 sm:mr-4">
            <span className="material-icons text-secondary-500">admin_panel_settings</span>
          </div>
          <div>
            <h3 className="font-medium">Admin API Documentation</h3>
            <p className="text-sm text-neutral-500">Endpoints for admin management and system controls</p>
            <div className="mt-1">
              <span className="text-xs bg-neutral-100 px-2 py-1 rounded-md font-mono">/api/docs/admin</span>
            </div>
          </div>
          <a href="/api/docs/admin" className="ml-auto mt-2 sm:mt-0 text-sm px-3 py-1 bg-secondary-500 text-white rounded-full hover:bg-secondary-700">
            Explore
          </a>
        </div>

        <div className="bg-neutral-50 rounded-lg p-4 mt-4">
          <h3 className="text-sm font-medium mb-2">Recent Updates</h3>
          <div className="text-sm space-y-2">
            <div className="flex items-start">
              <span className="material-icons text-success text-sm mr-2">fiber_manual_record</span>
              <div>
                <p>Added rate limiting to all API endpoints</p>
                <p className="text-neutral-500 text-xs">2 days ago</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="material-icons text-success text-sm mr-2">fiber_manual_record</span>
              <div>
                <p>Implemented WebSockets for group messaging</p>
                <p className="text-neutral-500 text-xs">5 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ApiDocumentationCard;
