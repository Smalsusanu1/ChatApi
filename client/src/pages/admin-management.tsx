import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, User, Loader2, Plus } from "lucide-react";

const createAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function AdminManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      name: "",
      firstName: "",
      email: "",
      country: "",
      password: "",
    },
  });
  
  // Check if current user is admin
  const isAdmin = user?.role === "admin";
  
  // Fetch admins list
  const { data: adminsData, isLoading } = useQuery({
    queryKey: ['/api/v1/admin/admins'],
    enabled: isAdmin,
  });
  
  // Create admin mutation
  const createAdminMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/v1/admin/admins", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Admin created",
        description: "New admin has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/admin/admins'] });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create admin",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: any) => {
    createAdminMutation.mutate(data);
  };
  
  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen">
        <Sidebar 
          mobile={!showMobileSidebar} 
          onClose={() => setShowMobileSidebar(false)} 
        />
        
        <main className="flex-1 overflow-x-hidden bg-neutral-50">
          <Header openSidebar={() => setShowMobileSidebar(true)} />
          
          <div className="p-4 lg:p-6 flex items-center justify-center h-[calc(100vh-120px)]">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-xl mb-2">Access Denied</CardTitle>
                <CardDescription>
                  You don't have permission to access this page. Only administrators can manage admin accounts.
                </CardDescription>
                <Button 
                  className="mt-4" 
                  variant="default" 
                  onClick={() => window.location.href = "/"}
                >
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }
  
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
            <h1 className="text-2xl font-medium text-neutral-800">Admin Management</h1>
            <p className="text-neutral-500 mt-1">Manage system administrators</p>
          </div>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Administrators</CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Admin
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Admin</DialogTitle>
                    <DialogDescription>
                      Add a new administrator to the system
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Admin User" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Admin" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="admin@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input placeholder="USA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter secure password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createAdminMutation.isPending}
                        >
                          {createAdminMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            "Create Admin"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  <p className="mt-2">Loading administrators...</p>
                </div>
              ) : !adminsData?.admins || adminsData.admins.length === 0 ? (
                <div className="text-center py-12">
                  <User className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No administrators</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Add your first administrator using the button above
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminsData.admins.map((admin: any) => (
                        <TableRow key={admin.id}>
                          <TableCell className="font-medium">{admin.name}</TableCell>
                          <TableCell>{admin.email}</TableCell>
                          <TableCell>
                            {new Date(admin.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">Active</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
