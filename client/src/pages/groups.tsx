import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { GroupList } from "@/components/groups/group-list";
import { GroupForm } from "@/components/groups/group-form";
import { MessageList } from "@/components/messaging/message-list";
import { MessageForm } from "@/components/messaging/message-form";
import { useWebSocket } from "@/hooks/use-websocket";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UsersIcon } from "lucide-react";

export default function Groups() {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const { status: wsStatus } = useWebSocket();
  
  // Get messages for selected group
  const { data: groupMessages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['/api/v1/messages/groups', selectedGroupId],
    enabled: !!selectedGroupId,
  });
  
  // Get group details
  const { data: groupDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['/api/v1/groups', selectedGroupId],
    enabled: !!selectedGroupId,
  });
  
  // Get group members
  const { data: groupMembers, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['/api/v1/groups', selectedGroupId, 'members'],
    enabled: !!selectedGroupId,
  });
  
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
            <h1 className="text-2xl font-medium text-neutral-800">Groups</h1>
            <p className="text-neutral-500 mt-1">Create and manage chat groups</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <GroupForm />
              <GroupList 
                selectedGroupId={selectedGroupId}
                onSelectGroup={setSelectedGroupId}
              />
            </div>
            
            <div className="lg:col-span-3">
              {selectedGroupId ? (
                <Tabs defaultValue="messages">
                  <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>
                          {isLoadingDetails ? "Loading..." : groupDetails?.group?.name}
                        </CardTitle>
                        {groupDetails?.group?.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {groupDetails.group.description}
                          </p>
                        )}
                      </div>
                      <TabsList>
                        <TabsTrigger value="messages">Messages</TabsTrigger>
                        <TabsTrigger value="members">Members</TabsTrigger>
                      </TabsList>
                    </CardHeader>
                    
                    <TabsContent value="messages" className="m-0">
                      <Card className="h-[calc(100vh-290px)] flex flex-col border-0 shadow-none">
                        <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
                          <div className="flex-1 overflow-y-auto">
                            <MessageList
                              selectedGroupId={selectedGroupId}
                              messages={groupMessages?.messages || []}
                              isLoading={isLoadingMessages}
                            />
                          </div>
                          <MessageForm
                            selectedGroupId={selectedGroupId}
                            disabled={wsStatus !== "OPEN"}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="members" className="m-0">
                      <CardContent>
                        <div className="mb-4">
                          <h3 className="text-sm font-medium mb-2">Group Members</h3>
                          {isLoadingMembers ? (
                            <p>Loading members...</p>
                          ) : !groupMembers?.members || groupMembers.members.length === 0 ? (
                            <div className="text-center py-4">
                              <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                              <p className="mt-2 text-muted-foreground">No members in this group</p>
                            </div>
                          ) : (
                            <div className="divide-y">
                              {groupMembers.members.map((member: any) => (
                                <div key={member.id} className="py-3 flex items-center justify-between">
                                  <div className="flex items-center">
                                    <Avatar>
                                      <AvatarFallback className="bg-primary-100 text-primary-800">
                                        {member.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="ml-3">
                                      <p className="font-medium">{member.name}</p>
                                      <p className="text-xs text-muted-foreground">{member.email}</p>
                                    </div>
                                  </div>
                                  {member.role === 'admin' && (
                                    <Badge variant="outline">Admin</Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </TabsContent>
                  </Card>
                </Tabs>
              ) : (
                <Card className="h-[calc(100vh-220px)] flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="material-icons text-neutral-400">group_work</span>
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Group Selected</h3>
                    <p className="text-neutral-500 mb-4">Select a group from the list or create a new one</p>
                    <GroupForm />
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
