import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Star, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TrustMetric {
  name: string;
  score: number;
  maxScore: number;
  status: "excellent" | "good" | "needs-attention";
  icon: React.ReactNode;
}

const trustMetrics: TrustMetric[] = [
  { name: "Order Fulfillment", score: 98, maxScore: 100, status: "excellent", icon: <CheckCircle className="w-4 h-4" /> },
  { name: "Customer Reviews", score: 4.7, maxScore: 5, status: "excellent", icon: <Star className="w-4 h-4" /> },
  { name: "Response Time", score: 85, maxScore: 100, status: "good", icon: <TrendingUp className="w-4 h-4" /> },
  { name: "Compliance", score: 72, maxScore: 100, status: "needs-attention", icon: <AlertCircle className="w-4 h-4" /> },
];

const statusColors = {
  excellent: "text-success",
  good: "text-accent",
  "needs-attention": "text-warning",
};

export function TrustScore() {
  const overallScore = 92;

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Trust Score</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(overallScore / 100) * 352} 352`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground">{overallScore}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Excellent Standing
          </span>
        </div>

        {/* Metrics Breakdown */}
        <div className="space-y-4">
          {trustMetrics.map((metric) => (
            <div key={metric.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={statusColors[metric.status]}>{metric.icon}</span>
                  <span className="text-sm text-foreground">{metric.name}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {metric.score}{metric.maxScore === 5 ? "/5" : "%"}
                </span>
              </div>
              <Progress 
                value={(metric.score / metric.maxScore) * 100} 
                className="h-2"
              />
            </div>
          ))}
        </div>

        {/* Trustpilot Integration */}
        <div className="p-4 rounded-lg bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < 4 ? "text-success fill-success" : "text-success/30"}`} 
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">Trustpilot</span>
          </div>
          <span className="text-sm font-semibold text-foreground">4.7/5</span>
        </div>
      </CardContent>
    </Card>
  );
}
