import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Recycle, Leaf, Gift, TrendingUp, Package } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface RecyclingActivity {
  date: string;
  packages: number;
  points: number;
}

const recentActivity: RecyclingActivity[] = [
  { date: "Today", packages: 12, points: 120 },
  { date: "Yesterday", packages: 8, points: 80 },
  { date: "Jan 26", packages: 15, points: 150 },
  { date: "Jan 25", packages: 6, points: 60 },
];

export function RecyclingPoints() {
  const totalPoints = 2450;
  const nextReward = 3000;
  const progressToReward = (totalPoints / nextReward) * 100;
  const impactSaved = 48; // kg CO2

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Recycle className="w-5 h-5 text-success" />
          <CardTitle className="text-lg font-semibold">Recycling Points</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Points Balance */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-success/20 to-success/5 border border-success/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Available Points</span>
            <Leaf className="w-5 h-5 text-success" />
          </div>
          <p className="text-3xl font-bold text-foreground">{totalPoints.toLocaleString()}</p>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Next reward at {nextReward.toLocaleString()}</span>
              <span className="text-success font-medium">{(nextReward - totalPoints).toLocaleString()} to go</span>
            </div>
            <Progress value={progressToReward} className="h-2" />
          </div>
        </div>

        {/* Environmental Impact */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/30 text-center">
            <Package className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">156</p>
            <p className="text-xs text-muted-foreground">Packages Recycled</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 text-center">
            <Leaf className="w-6 h-6 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{impactSaved}kg</p>
            <p className="text-xs text-muted-foreground">CO₂ Saved</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Recent Activity</h4>
          <div className="space-y-2">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-success/10">
                    <Recycle className="w-3 h-3 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{activity.packages} packages</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-success">+{activity.points} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Redeem CTA */}
        <button className="w-full py-3 px-4 rounded-xl bg-success/10 border border-success/20 text-success font-medium hover:bg-success/20 transition-colors flex items-center justify-center gap-2">
          <Gift className="w-4 h-4" />
          Redeem Points
        </button>
      </CardContent>
    </Card>
  );
}
