import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import {
  Bell,
  X,
  AlertTriangle,
  CheckCircle,
  Info,
  Package,
  TrendingUp,
  Shield,
} from "lucide-react";
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

const initialNotifications: Notification[] = [];

const typeConfig = {
  alert: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    border: "border-destructive/20",
  },
  success: {
    bg: "bg-success/10",
    text: "text-success",
    border: "border-success/20",
  },
  info: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
  },
  warning: {
    bg: "bg-warning/10",
    text: "text-warning",
    border: "border-warning/20",
  },
};

export function NotificationSystem() {
  useLanguage();
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
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
            {translateUi("Mark all as read")}
          </button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>{translateUi("No notifications")}</p>
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
                    <div
                      className={`p-2 rounded-lg ${config.bg} ${config.text}`}
                    >
                      {notification.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`font-medium text-sm ${notification.read ? "text-muted-foreground" : "text-foreground"}`}
                        >
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
                      <p
                        className={`text-sm mt-1 ${notification.read ? "text-muted-foreground/70" : "text-muted-foreground"}`}
                      >
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground/50 mt-2">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="mt-2 flex justify-end">
                      <Badge
                        variant="outline"
                        className={`${config.bg} ${config.text} ${config.border} text-xs`}
                      >
                        {translateUi("New")}
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
