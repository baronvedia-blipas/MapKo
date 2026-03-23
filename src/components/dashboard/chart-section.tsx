"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Scan } from "@/types";

interface ChartSectionProps {
  completedScans: Scan[];
  summary: { high: number; medium: number; low: number };
}

export default function ChartSection({ completedScans, summary }: ChartSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Scan activity */}
      <Card className="glass">
        <div className="p-6 pb-2">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            Scan Activity
          </h2>
        </div>
        <CardContent className="pb-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={completedScans.slice(-7).map((s) => ({
                name: new Date(s.created_at).toLocaleDateString("en", {
                  month: "short",
                  day: "numeric",
                }),
                businesses: s.total_businesses || 0,
              }))}
            >
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(218,11%,50%)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(218,11%,50%)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(228,14%,9%)",
                  border: "1px solid hsl(220,13%,14%)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "hsl(210,40%,96%)" }}
                itemStyle={{ color: "#60a5fa" }}
              />
              <Bar dataKey="businesses" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Opportunity distribution */}
      <Card className="glass">
        <div className="p-6 pb-2">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            Opportunity Distribution
          </h2>
        </div>
        <CardContent className="pb-4">
          <div className="flex items-center justify-center gap-8">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={[
                    { name: "High (70+)", value: summary.high },
                    { name: "Medium (40-69)", value: summary.medium },
                    { name: "Low (0-39)", value: summary.low },
                  ].filter((d) => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  <Cell fill="#ef4444" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#22c55e" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(228,14%,9%)",
                    border: "1px solid hsl(220,13%,14%)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {[
                { label: "High (70+)", value: summary.high, color: "bg-red-500" },
                { label: "Medium (40-69)", value: summary.medium, color: "bg-amber-500" },
                { label: "Low (0-39)", value: summary.low, color: "bg-green-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  <div className={`h-3 w-3 rounded-full ${item.color}`} />
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
