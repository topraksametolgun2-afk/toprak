import { NotificationBell } from "@/components/notifications/notification-bell";

export function Navbar() {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Toprak B2B Platform</h2>
          <p className="text-sm text-muted-foreground">Profesyonel B2B çözümler</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <NotificationBell />
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
              <span data-testid="text-user-initials">TY</span>
            </div>
            <div className="text-sm">
              <p className="font-medium" data-testid="text-user-name">Toprak Sametolu</p>
              <p className="text-muted-foreground" data-testid="text-user-role">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
