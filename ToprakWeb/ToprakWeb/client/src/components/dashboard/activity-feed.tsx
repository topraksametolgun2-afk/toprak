import { useQuery } from "@tanstack/react-query";
import type { Activity, User } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface ActivityWithUser extends Activity {
  userName: string;
}

export function ActivityFeed() {
  const { data: activities, isLoading } = useQuery<ActivityWithUser[]>({
    queryKey: ["/api/activities"],
  });

  const formatTime = (date: Date | string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Az önce";
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} saat önce`;
    return `${Math.floor(diffInMinutes / 1440)} gün önce`;
  };

  const getActivityColor = (action: string) => {
    if (action.includes("oluşturdu")) return "bg-primary";
    if (action.includes("çözdü")) return "bg-green-500";
    if (action.includes("güncelleme")) return "bg-orange-500";
    return "bg-blue-500";
  };

  if (isLoading) {
    return (
      <div className="bg-card p-6 rounded-lg border border-border" data-testid="activity-feed-loading">
        <h3 className="text-lg font-semibold text-foreground mb-6">Son Aktiviteler</h3>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-lg border border-border" data-testid="activity-feed">
      <h3 className="text-lg font-semibold text-foreground mb-6">Son Aktiviteler</h3>
      
      <div className="space-y-4">
        {activities?.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3" data-testid={`activity-item-${activity.id}`}>
            <div className={`w-2 h-2 ${getActivityColor(activity.action)} rounded-full mt-2`}></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-medium">Admin User</span>
                <span> {activity.action}</span>
              </p>
              <p className="text-xs text-muted-foreground" data-testid="activity-time">
                {formatTime(activity.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <Button 
        variant="ghost" 
        className="w-full mt-4 text-sm text-primary hover:text-primary/80 font-medium"
        data-testid="view-all-activities"
      >
        Tümünü Görüntüle
      </Button>
    </div>
  );
}
