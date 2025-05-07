import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserPlusIcon, UsersIcon } from "lucide-react";

type Group = {
  id: string;
  name: string;
  description?: string;
};

type GroupListProps = {
  selectedGroupId?: string;
  onSelectGroup: (groupId: string) => void;
};

export function GroupList({ selectedGroupId, onSelectGroup }: GroupListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { sendMessage } = useWebSocket();
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const [leavingGroupId, setLeavingGroupId] = useState<string | null>(null);
  
  // Fetch all groups
  const { data: groups, isLoading } = useQuery({
    queryKey: ['/api/v1/groups'],
  });
  
  // Fetch user groups
  const { data: userGroups } = useQuery({
    queryKey: ['/api/v1/users/profile/me/groups'],
  });

  // Check if user is member of a group
  const isUserInGroup = (groupId: string) => {
    if (!userGroups?.groups) return false;
    return userGroups.groups.some((group: any) => group.id === groupId);
  };
  
  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      await apiRequest("POST", `/api/v1/groups/${groupId}/join`);
      
      // Also send WebSocket message
      sendMessage({
        type: "join-group",
        groupId
      });
    },
    onSuccess: (_, groupId) => {
      toast({
        title: "Group joined",
        description: "You have joined the group successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/users/profile/me/groups'] });
    }
  });
  
  // Leave group mutation
  const leaveGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      await apiRequest("POST", `/api/v1/groups/${groupId}/leave`);
      
      // Also send WebSocket message
      sendMessage({
        type: "leave-group",
        groupId
      });
      
      // If currently selected group is being left, deselect it
      if (selectedGroupId === groupId) {
        onSelectGroup('');
      }
    },
    onSuccess: (_, groupId) => {
      toast({
        title: "Group left",
        description: "You have left the group",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/users/profile/me/groups'] });
    }
  });
  
  const handleJoinGroup = (groupId: string) => {
    setJoiningGroupId(groupId);
    joinGroupMutation.mutate(groupId, {
      onSettled: () => setJoiningGroupId(null)
    });
  };
  
  const handleLeaveGroup = (groupId: string) => {
    setLeavingGroupId(groupId);
    leaveGroupMutation.mutate(groupId, {
      onSettled: () => setLeavingGroupId(null)
    });
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Groups</CardTitle>
        </CardHeader>
        <CardContent>
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-4">
                  <Skeleton className="h-4 w-[150px] mb-2" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  
  if (!groups?.groups || groups.groups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Groups</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <UsersIcon className="mx-auto h-12 w-12 text-neutral-300 mb-2" />
          <p className="text-neutral-500">No groups available</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Groups</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {groups.groups.map((group: Group) => {
            const isMember = isUserInGroup(group.id);
            const isSelected = selectedGroupId === group.id;
            const isJoining = joiningGroupId === group.id;
            const isLeaving = leavingGroupId === group.id;
            
            return (
              <div 
                key={group.id} 
                className={`flex items-center justify-between p-4 hover:bg-neutral-50 cursor-pointer ${
                  isSelected ? 'bg-primary-50' : ''
                }`}
                onClick={() => isMember && onSelectGroup(group.id)}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium">{group.name}</h3>
                    {group.description && (
                      <p className="text-sm text-neutral-500 line-clamp-1">{group.description}</p>
                    )}
                  </div>
                </div>
                {isMember ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLeaveGroup(group.id);
                    }}
                    disabled={isLeaving}
                  >
                    {isLeaving ? 'Leaving...' : 'Leave'}
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinGroup(group.id);
                    }}
                    disabled={isJoining}
                  >
                    {isJoining ? (
                      'Joining...'
                    ) : (
                      <>
                        <UserPlusIcon className="h-4 w-4 mr-1" />
                        Join
                      </>
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default GroupList;
