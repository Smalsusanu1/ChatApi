import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export function ApiDocumentationTabs() {
  const [expandedEndpoints, setExpandedEndpoints] = useState<string[]>([]);

  const toggleEndpoint = (id: string) => {
    if (expandedEndpoints.includes(id)) {
      setExpandedEndpoints(expandedEndpoints.filter(endpointId => endpointId !== id));
    } else {
      setExpandedEndpoints([...expandedEndpoints, id]);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="border-b px-4 py-4">
        <CardTitle className="text-lg font-medium">API Documentation Preview</CardTitle>
      </CardHeader>
      <Tabs defaultValue="user-docs">
        <div className="border-b">
          <TabsList className="flex h-auto p-0 bg-transparent">
            <TabsTrigger 
              value="user-docs" 
              className="px-4 py-3 rounded-none data-[state=active]:text-primary-500 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:font-medium"
            >
              User API
            </TabsTrigger>
            <TabsTrigger 
              value="admin-docs" 
              className="px-4 py-3 rounded-none data-[state=active]:text-primary-500 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:font-medium"
            >
              Admin API
            </TabsTrigger>
            <TabsTrigger 
              value="websocket-docs" 
              className="px-4 py-3 rounded-none data-[state=active]:text-primary-500 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:font-medium"
            >
              WebSocket API
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="user-docs" className="p-4">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Authentication</h3>
              <span className="text-xs text-neutral-500">Base URL: /api/v1</span>
            </div>
            
            <div className="border rounded-lg mb-3">
              <div 
                className="flex items-center p-3 cursor-pointer hover:bg-neutral-50"
                onClick={() => toggleEndpoint('endpoint-1')}
              >
                <span className="px-2 py-1 text-xs font-medium rounded mr-3 bg-green-100 text-green-800">POST</span>
                <span className="bg-neutral-100 text-sm px-2 py-1 rounded-md font-mono">/auth/register</span>
                <span className="ml-3 text-sm text-neutral-600">User Registration</span>
                <span className="material-icons ml-auto text-neutral-400">
                  {expandedEndpoints.includes('endpoint-1') ? 'expand_less' : 'expand_more'}
                </span>
              </div>
              {expandedEndpoints.includes('endpoint-1') && (
                <div className="p-3 border-t bg-neutral-50">
                  <div className="mb-3">
                    <h4 className="text-sm font-medium mb-1">Request Body:</h4>
                    <pre className="bg-neutral-100 p-2 rounded text-xs overflow-x-auto font-mono">
{`{
  "name": "John Doe",
  "firstName": "John",
  "email": "john@example.com",
  "country": "USA",
  "password": "securePassword123"
}`}
                    </pre>
                  </div>
                  <div className="mb-3">
                    <h4 className="text-sm font-medium mb-1">Response (200):</h4>
                    <pre className="bg-neutral-100 p-2 rounded text-xs overflow-x-auto font-mono">
{`{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "userId": "60d21b4667d0d8992e610c85"
}`}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Error Responses:</h4>
                    <ul className="list-disc list-inside text-xs text-neutral-700">
                      <li>400 - Validation errors</li>
                      <li>409 - Email already exists</li>
                      <li>429 - Too many requests</li>
                      <li>500 - Server error</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="border rounded-lg mb-3">
              <div 
                className="flex items-center p-3 cursor-pointer hover:bg-neutral-50"
                onClick={() => toggleEndpoint('endpoint-2')}
              >
                <span className="px-2 py-1 text-xs font-medium rounded mr-3 bg-green-100 text-green-800">POST</span>
                <span className="bg-neutral-100 text-sm px-2 py-1 rounded-md font-mono">/auth/login</span>
                <span className="ml-3 text-sm text-neutral-600">User Login</span>
                <span className="material-icons ml-auto text-neutral-400">
                  {expandedEndpoints.includes('endpoint-2') ? 'expand_less' : 'expand_more'}
                </span>
              </div>
              {expandedEndpoints.includes('endpoint-2') && (
                <div className="p-3 border-t bg-neutral-50">
                  <div className="mb-3">
                    <h4 className="text-sm font-medium mb-1">Request Body:</h4>
                    <pre className="bg-neutral-100 p-2 rounded text-xs overflow-x-auto font-mono">
{`{
  "email": "john@example.com",
  "password": "securePassword123"
}`}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Response (200):</h4>
                    <pre className="bg-neutral-100 p-2 rounded text-xs overflow-x-auto font-mono">
{`{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}`}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <a href="/api/docs/user" className="text-primary-500 hover:underline text-sm flex items-center">
              <span>View full documentation</span>
              <span className="material-icons text-sm ml-1">arrow_forward</span>
            </a>
          </div>
        </TabsContent>
        
        <TabsContent value="admin-docs" className="p-4">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Admin Management</h3>
              <span className="text-xs text-neutral-500">Base URL: /api/v1/admin</span>
            </div>
            
            <div className="border rounded-lg mb-3">
              <div 
                className="flex items-center p-3 cursor-pointer hover:bg-neutral-50"
                onClick={() => toggleEndpoint('admin-endpoint-1')}
              >
                <span className="px-2 py-1 text-xs font-medium rounded mr-3 bg-green-100 text-green-800">POST</span>
                <span className="bg-neutral-100 text-sm px-2 py-1 rounded-md font-mono">/admins</span>
                <span className="ml-3 text-sm text-neutral-600">Create New Admin</span>
                <span className="material-icons ml-auto text-neutral-400">
                  {expandedEndpoints.includes('admin-endpoint-1') ? 'expand_less' : 'expand_more'}
                </span>
              </div>
              {expandedEndpoints.includes('admin-endpoint-1') && (
                <div className="p-3 border-t bg-neutral-50">
                  <div className="mb-3">
                    <h4 className="text-sm font-medium mb-1">Request Body:</h4>
                    <pre className="bg-neutral-100 p-2 rounded text-xs overflow-x-auto font-mono">
{`{
  "name": "Admin User",
  "firstName": "Admin",
  "email": "admin@example.com",
  "country": "USA",
  "password": "secureAdminPass123"
}`}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Notes:</h4>
                    <ul className="list-disc list-inside text-xs text-neutral-700">
                      <li>Requires admin authentication</li>
                      <li>Only existing admins can create new admins</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <a href="/api/docs/admin" className="text-primary-500 hover:underline text-sm flex items-center">
              <span>View full admin documentation</span>
              <span className="material-icons text-sm ml-1">arrow_forward</span>
            </a>
          </div>
        </TabsContent>
        
        <TabsContent value="websocket-docs" className="p-4">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">WebSocket API</h3>
              <span className="text-xs text-neutral-500">WebSocket URL: ws://example.com/ws</span>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-neutral-600 mb-2">
                The WebSocket API enables real-time messaging between users and within groups. Connection requires authentication using JWT.
              </p>
              
              <div className="mb-3">
                <h4 className="text-sm font-medium mb-1">Connection:</h4>
                <pre className="bg-neutral-100 p-2 rounded text-xs overflow-x-auto font-mono">
{`// Connect with authentication token
const socket = new WebSocket('ws://example.com/ws?token=YOUR_JWT_TOKEN');

socket.onopen = () => {
  console.log('Connected to WebSocket server');
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

socket.onclose = () => {
  console.log('Disconnected from WebSocket server');
};`}
                </pre>
              </div>
            </div>

            <div className="border rounded-lg mb-3">
              <div 
                className="flex items-center p-3 cursor-pointer hover:bg-neutral-50"
                onClick={() => toggleEndpoint('ws-endpoint-1')}
              >
                <span className="px-2 py-1 text-xs font-medium rounded mr-3 bg-indigo-100 text-indigo-800">SEND</span>
                <span className="bg-neutral-100 text-sm px-2 py-1 rounded-md font-mono">Direct Message</span>
                <span className="material-icons ml-auto text-neutral-400">
                  {expandedEndpoints.includes('ws-endpoint-1') ? 'expand_less' : 'expand_more'}
                </span>
              </div>
              {expandedEndpoints.includes('ws-endpoint-1') && (
                <div className="p-3 border-t bg-neutral-50">
                  <div className="mb-3">
                    <h4 className="text-sm font-medium mb-1">Message Format:</h4>
                    <pre className="bg-neutral-100 p-2 rounded text-xs overflow-x-auto font-mono">
{`{
  "type": "direct-message",
  "receiverId": "60d21b4667d0d8992e610c87",
  "content": "Hello, how are you?"
}`}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <a href="/api/docs/user" className="text-primary-500 hover:underline text-sm flex items-center">
              <span>View full WebSocket documentation</span>
              <span className="material-icons text-sm ml-1">arrow_forward</span>
            </a>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

export default ApiDocumentationTabs;
