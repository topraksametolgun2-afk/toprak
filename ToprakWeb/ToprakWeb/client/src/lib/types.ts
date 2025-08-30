export interface DashboardStats {
  totalTickets: number;
  activeUsers: number;
  stockItems: number;
  resolvedTickets: number;
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  time: string;
}

export interface TicketTableItem {
  id: string;
  subject: string;
  user: string;
  status: 'bekliyor' | 'cozuluyor' | 'cozuldu' | 'acil';
  date: string;
}

export interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: string;
  active?: boolean;
}
