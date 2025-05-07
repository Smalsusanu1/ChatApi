import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldAlert, FileText, Search, CalendarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function Logs() {
  const { user } = useAuth();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Check if current user is admin
  const isAdmin = user?.role === "admin";
  
  // Fetch logs with filters
  const { data: logsData, isLoading } = useQuery({
    queryKey: ['/api/v1/admin/logs', page, level, startDate, endDate],
    enabled: isAdmin,
  });
  
  const totalPages = logsData?.pages || 1;
  
  const getLevelBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return <Badge variant="destructive">{level}</Badge>;
      case 'warn':
        return <Badge variant="warning" className="bg-yellow-500">{level}</Badge>;
      case 'info':
        return <Badge variant="default" className="bg-blue-500">{level}</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };
  
  // Format date for API request
  const formatDateForApi = (date: Date | undefined) => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };
  
  // Reset filters
  const resetFilters = () => {
    setLevel("all");
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(1);
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
                  You don't have permission to access this page. Only administrators can view system logs.
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
            <h1 className="text-2xl font-medium text-neutral-800">System Logs</h1>
            <p className="text-neutral-500 mt-1">View and filter system activity logs</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Logs</CardTitle>
              <CardDescription>System activity with rotation and filtering</CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex-1">
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Log Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Start Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "End Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button variant="ghost" onClick={resetFilters}>Reset</Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-[300px]" />
                      <Skeleton className="h-4 w-[100px] ml-auto" />
                    </div>
                  ))}
                </div>
              ) : !logsData?.logs || logsData.logs.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No logs found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Try changing your filters or date range
                  </p>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Level</TableHead>
                          <TableHead>Timestamp</TableHead>
                          <TableHead className="w-[50%]">Message</TableHead>
                          <TableHead>Metadata</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logsData.logs.map((log: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{getLevelBadge(log.level)}</TableCell>
                            <TableCell className="font-mono text-xs">
                              {new Date(log.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell>{log.message}</TableCell>
                            <TableCell>
                              {log.metadata && Object.keys(log.metadata).length > 0 ? (
                                <pre className="text-xs bg-neutral-100 p-2 rounded max-w-[200px] overflow-x-auto">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              ) : (
                                <span className="text-muted-foreground text-xs">No metadata</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <Pagination className="mt-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => page > 1 && setPage(page - 1)}
                          className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            isActive={pageNum === page}
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => page < totalPages && setPage(page + 1)}
                          className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
