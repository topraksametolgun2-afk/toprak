import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TicketTable } from "@/components/dashboard/ticket-table";

export default function TicketSistemi() {
  return (
    <DashboardLayout 
      title="Ticket Sistemi" 
      subtitle="Destek taleplerini yönetin"
    >
      <div className="space-y-6">
        <TicketTable />
      </div>
    </DashboardLayout>
  );
}
