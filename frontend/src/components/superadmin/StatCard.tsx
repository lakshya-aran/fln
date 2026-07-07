import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: "blue" | "green" | "purple" | "orange" | "red" | "indigo";
  loading?: boolean;
}

const COLOR_CLASSES = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  purple: "bg-purple-50 text-purple-600",
  orange: "bg-orange-50 text-orange-600",
  red: "bg-red-50 text-red-600",
  indigo: "bg-indigo-50 text-indigo-600",
};

export function StatCard({ title, value, icon: Icon, trend, trendUp, color = "blue", loading }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {loading ? (
            <div className="mt-2 h-8 w-20 animate-pulse rounded bg-gray-200" />
          ) : (
            <p className="mt-2 text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
          )}
          {trend && (
            <p className={cn("mt-2 text-xs font-medium", trendUp ? "text-green-600" : "text-red-600")}>
              {trendUp ? "↑" : "↓"} {trend}
            </p>
          )}
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", COLOR_CLASSES[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
