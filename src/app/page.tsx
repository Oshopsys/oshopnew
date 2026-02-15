"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardSummary } from "@/app/actions/reports";
import { TrendingUp, DollarSign, AlertCircle, PieChart, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { AreaChart, Area, PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function Home() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary().then((data) => {
      setSummary(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <p>لا توجد بيانات متاحة حالياً. يرجى التأكد من إعداد دليل الحسابات.</p>
      </div>
    );
  }

  const { balanceSheet, incomeStatement } = summary;

  // Metric cards data
  const metrics = [
    {
      title: "إجمالي الأصول",
      value: balanceSheet.totalAssets,
      change: "+12.5%",
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-500/10",
      iconColor: "text-orange-500"
    },
    {
      title: "الإيرادات",
      value: incomeStatement.revenue,
      change: "+18.2%",
      icon: DollarSign,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-500/10",
      iconColor: "text-green-500"
    },
    {
      title: "المصروفات",
      value: incomeStatement.expenses,
      change: "+8.1%",
      icon: AlertCircle,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-500/10",
      iconColor: "text-red-500"
    },
    {
      title: "صافي الربح",
      value: incomeStatement.netProfit,
      change: incomeStatement.netProfit >= 0 ? "+24.3%" : "-15.2%",
      icon: PieChart,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-500/10",
      iconColor: "text-amber-500"
    }
  ];

  // Sample data for revenue trend (you can replace with actual monthly data)
  const revenueData = [
    { month: 'يناير', revenue: incomeStatement.revenue * 0.7 },
    { month: 'فبراير', revenue: incomeStatement.revenue * 0.75 },
    { month: 'مارس', revenue: incomeStatement.revenue * 0.82 },
    { month: 'أبريل', revenue: incomeStatement.revenue * 0.88 },
    { month: 'مايو', revenue: incomeStatement.revenue * 0.95 },
    { month: 'يونيو', revenue: incomeStatement.revenue }
  ];

  // Account distribution data for donut chart
  const distributionData = [
    { name: 'الأصول', value: balanceSheet.totalAssets, color: '#FF6B35' }, // Brand orange
    { name: 'الالتزامات', value: balanceSheet.totalLiabilities, color: '#EF4444' }, // Red
    { name: 'حقوق الملكية', value: balanceSheet.totalEquity, color: '#FFB84D' } // Brand amber
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = !metric.change.startsWith('-');

          return (
            <Card key={index} className="overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`h-6 w-6 ${metric.iconColor}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    <span>{metric.change}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
                  <p className="text-2xl font-bold">
                    {metric.value.toLocaleString('ar-LY', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">د.ل</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Trend Chart */}
        <Card className="border-0 bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="text-lg">اتجاه الإيرادات</CardTitle>
            <p className="text-sm text-muted-foreground">الإيرادات الشهرية والنمو</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#F9FAFB' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Account Distribution Chart */}
        <Card className="border-0 bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="text-lg">توزيع الحسابات</CardTitle>
            <p className="text-sm text-muted-foreground">تقسيم المركز المالي</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  formatter={(value: any) => (typeof value === 'number' ? value.toLocaleString('ar-LY') : value)}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => <span style={{ color: '#9CA3AF' }}>{value}</span>}
                />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Financial Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Balance Sheet Summary */}
        <Card className="border-0 bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle>قائمة المركز المالي</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-blue-500/10">
              <span className="text-sm">الأصول</span>
              <span className="font-bold text-blue-500">{balanceSheet.totalAssets.toLocaleString('ar-LY')}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-orange-500/10">
              <span className="text-sm">الالتزامات</span>
              <span className="font-bold text-orange-500">{balanceSheet.totalLiabilities.toLocaleString('ar-LY')}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-purple-500/10">
              <span className="text-sm">حقوق الملكية</span>
              <span className="font-bold text-purple-500">{balanceSheet.totalEquity.toLocaleString('ar-LY')}</span>
            </div>
            <div className={`flex justify-between items-center p-3 rounded-lg mt-4 ${balanceSheet.bsIsBalanced ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <span className="text-sm font-semibold">حالة التوازن</span>
              <span className={`font-bold ${balanceSheet.bsIsBalanced ? 'text-green-500' : 'text-red-500'}`}>
                {balanceSheet.bsIsBalanced ? '✓ متوازن' : '✗ غير متوازن'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Income Statement Summary */}
        <Card className="border-0 bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle>قائمة الدخل</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/10">
              <span className="text-sm">الإيرادات</span>
              <span className="font-bold text-green-500">{incomeStatement.revenue.toLocaleString('ar-LY')}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-orange-500/10">
              <span className="text-sm">المصروفات</span>
              <span className="font-bold text-orange-500">({incomeStatement.expenses.toLocaleString('ar-LY')})</span>
            </div>
            <div className={`flex justify-between items-center p-3 rounded-lg mt-4 border-t-2 ${incomeStatement.netProfit >= 0 ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
              <span className="text-sm font-semibold">صافي الربح</span>
              <span className={`font-bold text-lg ${incomeStatement.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {incomeStatement.netProfit.toLocaleString('ar-LY')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
