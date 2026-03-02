import { Bell } from "lucide-react";

const AlertsPage = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-5 pb-3">
        <h1 className="font-display text-xl font-extrabold text-foreground">Alerts</h1>
      </div>
      <div className="flex flex-col items-center justify-center py-20 px-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-action/10 mb-4">
          <Bell className="h-8 w-8 text-action" />
        </div>
        <p className="text-lg font-bold text-foreground">No alerts yet</p>
        <p className="mt-1 text-sm text-muted-foreground text-center">
          You'll receive notifications about your orders, promotions, and important updates here.
        </p>
      </div>
    </div>
  );
};

export default AlertsPage;
