import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { MessageList } from "@/components/messaging/message-list";
import { MessageForm } from "@/components/messaging/message-form";
import { useWebSocket } from "@/hooks/use-websocket";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

export default function Messaging() {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [tab, setTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const { messages: wsMessages } = useWebSocket();
  const queryClient = useQueryClient();
  
  // Get users list
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/v1/users'],
  });
  
  // Get user groups
  const { data: groupsData, isLoading: isLoadingGroups } = useQuery({
    queryKey: ['/api/v1/users/profile/me/groups'],
  });
  
  // Get direct messages with selected user
  const { data: directMessages, isLoading: isLoadingDirectMessages } = useQuery({
    queryKey: ['/api/v1/messages', selectedUserId],
    enabled: !!selectedUserId,
  });
  
  // Get group messages
  const { data: groupMessages, isLoading: isLoadingGroupMessages } = useQuery({
    queryKey: ['/api/v1/messages/groups', selectedGroupId],
    enabled: !!selectedGroupId,
  });
  
  // Listen for WebSocket messages and update queries
  useEffect(() => {
    if (wsMessages && wsMessages.length > 0) {
      const latestMessage = wsMessages[wsMessages.length - 1];
      
      // Handle direct messages
      if (latestMessage.type === 'direct-message') {
        if (
          selectedUserId && 
          (latestMessage.senderId === selectedUserId || latestMessage.receiverId === selectedUserId)
        ) {
          queryClient.invalidateQueries({ queryKey: ['/api/v1/messages', selectedUserId] });
        }
      }
      
      // Handle group messages
      if (latestMessage.type === 'group-message' && latestMessage.groupId === selectedGroupId) {
        queryClient.invalidateQueries({ queryKey: ['/api/v1/messages/groups', selectedGroupId] });
      }
      
      // Handle group join/leave events
      if (['group-join', 'group-leave'].includes(latestMessage.type)) {
        queryClient.invalidateQueries({ queryKey: ['/api/v1/users/profile/me/groups'] });
      }
    }
  }, [wsMessages, selectedUserId, selectedGroupId, queryClient]);
  
  // Handle selecting a user or group
  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setSelectedGroupId("");
    setTab("users");
  };
  
  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setSelectedUserId("");
    setTab("groups");
  };
  
  // Filter users based on search query
  const filteredUsers = usersData?.users 
    ? usersData.users.filter((user: any) => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
    
  // Filter groups based on search query
  const filteredGroups = groupsData?.groups
    ? groupsData.groups.filter((group: any) =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  
  return (
    <div className="flex min-h-screen">
      <Sidebar 
        mobile={!showMobileSidebar} 
        onClose={() => setShowMobileSidebar(false)} 
      />
      
      <main className="flex-1 overflow-x-hidden bg-neutral-50">
        <Header openSidebar={() => setShowMobileSidebar(true)} />
        
        <div className="p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-medium text-neutral-800">Messaging</h1>
            <p className="text-neutral-500 mt-1">Send direct and group messages in real-time</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Tabs defaultValue="users" value={tab} onValueChange={setTab}>
                    <TabsList className="w-full">
                      <TabsTrigger value="users" className="flex-1">Users</TabsTrigger>
                      <TabsTrigger value="groups" className="flex-1">Groups</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="users" className="m-0">
                      <div className="max-h-[400px] overflow-y-auto">
                        {isLoadingUsers ? (
                          Array(5).fill(0).map((_, index) => (
                            <div key={index} className="flex items-center p-3 border-b">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <div className="ml-3">
                                <Skeleton className="h-4 w-[150px] mb-1" />
                                <Skeleton className="h-3 w-[100px]" />
                              </div>
                            </div>
                          ))
                        ) : filteredUsers.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground">
                            No users found
                          </div>
                        ) : (
                          filteredUsers.map((user: any) => (
                            <div
                              key={user.id}
                              className={`flex items-center p-3 border-b cursor-pointer hover:bg-neutral-50 ${
                                selectedUserId === user.id ? "bg-primary-50" : ""
                              }`}
                              onClick={() => handleSelectUser(user.id)}
                            >
                              <Avatar>
                                <AvatarFallback className="bg-primary-100 text-primary-800">
                                  {user.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="ml-3">
                                <p className="font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="groups" className="m-0">
                      <div className="max-h-[400px] overflow-y-auto">
                        {isLoadingGroups ? (
                          Array(3).fill(0).map((_, index) => (
                            <div key={index} className="flex items-center p-3 border-b">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <div className="ml-3">
                                <Skeleton className="h-4 w-[150px] mb-1" />
                                <Skeleton className="h-3 w-[100px]" />
                              </div>
                            </div>
                          ))
                        ) : filteredGroups.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground">
                            No groups found
                          </div>
                        ) : (
                          filteredGroups.map((group: any) => (
                            <div
                              key={group.id}
                              className={`flex items-center p-3 border-b cursor-pointer hover:bg-neutral-50 ${
                                selectedGroupId === group.id ? "bg-primary-50" : ""
                              }`}
                              onClick={() => handleSelectGroup(group.id)}
                            >
                              <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-800">
                                <span className="material-icons text-sm">groups</span>
                              </div>
                              <div className="ml-3">
                                <p className="font-medium">{group.name}</p>
                                {group.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {group.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-3">
              <Card className="h-[calc(100vh-220px)] flex flex-col">
                <CardHeader className="py-3 px-4 border-b">
                  <CardTitle className="text-lg font-medium">
                    {selectedUserId && usersData?.users ? (
                      usersData.users.find((user: any) => user.id === selectedUserId)?.name || "Loading..."
                    ) : selectedGroupId && groupsData?.groups ? (
                      groupsData.groups.find((group: any) => group.id === selectedGroupId)?.name || "Loading..."
                    ) : (
                      "Select a conversation"
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-y-auto">
                    <MessageList
                      selectedUserId={selectedUserId}
                      selectedGroupId={selectedGroupId}
                      messages={
                        selectedUserId && directMessages?.messages 
                          ? directMessages.messages 
                          : selectedGroupId && groupMessages?.messages
                            ? groupMessages.messages
                            : []
                      }
                      isLoading={isLoadingDirectMessages || isLoadingGroupMessages}
                    />
                  </div>
                  <MessageForm
                    selectedUserId={selectedUserId}
                    selectedGroupId={selectedGroupId}
                    disabled={!selectedUserId && !selectedGroupId}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
