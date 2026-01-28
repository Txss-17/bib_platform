import { useState } from "react";
import { Bell, X, AlertTriangle, CheckCircle, Info, Package, TrendingUp, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  type: "alert" | "success" | "info" | "warning";
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: React.ReactNode;
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "alert",
    title: "Low Stock Alert",
    message: "Smart Watch Pro is running low (3 units left). Consider reordering soon.",
    time: "5 min ago",
    read: false,
    icon: <Package className="w-4 h-4" />,
  },
  {
    id: "2",
    type: "success",
    title: "Order Delivered",
    message: "Order #ORD-001 has been successfully delivered to Marie L.",
    time: "2 hours ago",
    read: false,
    icon: <CheckCircle className="w-4 h-4" />,
  },
  {
    id: "3",
    type: "info",
    title: "New Product Available",
    message: "A new trending product 'Smart Ring' is now available in your category.",
    time: "4 hours ago",
    read: true,
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    id: "4",
    type: "warning",
    title: "Compliance Review Due",
    message: "Your quarterly compliance review is due in 5 days. Please complete the checklist.",
    time: "1 day ago",
    read: true,
    icon: <Shield className="w-4 h-4" />,
  },
];

const typeConfig = {
  alert: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" },
  success: { bg: "bg-success/10", text: "text-success", border: "border-success/20" },
  info: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  warning: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20" },
};

export function NotificationSystem() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-5 h-5 text-primary" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-primary hover:underline"
          >
            Mark all as read
          </button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const config = typeConfig[notification.type];
              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    notification.read
                      ? "bg-muted/20 border-border/50"
                      : `${config.bg} ${config.border}`
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${config.bg} ${config.text}`}>
                      {notification.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`font-medium text-sm ${notification.read ? "text-muted-foreground" : "text-foreground"}`}>
                          {notification.title}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(notification.id);
                          }}
                          className="p-1 hover:bg-muted rounded"
                        >
                          <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                      <p className={`text-sm mt-1 ${notification.read ? "text-muted-foreground/70" : "text-muted-foreground"}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground/50 mt-2">{notification.time}</p>
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="mt-2 flex justify-end">
                      <Badge variant="outline" className={`${config.bg} ${config.text} ${config.border} text-xs`}>
                        New
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
