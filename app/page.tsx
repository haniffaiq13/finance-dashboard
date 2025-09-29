'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { financeAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { BalanceLineChart } from '@/components/charts/BalanceLineChart';
import { InOutBarChart } from '@/components/charts/InOutBarChart';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { CategoryDonutChart } from '@/components/charts/CategoryDonutChart';
import { TrendLineChart } from '@/components/charts/TrendLineChart';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Sidebar } from '@/components/layout/Sidebar';
import { DollarSign, TrendingUp, TrendingDown, ChartBar as BarChart3, Filter, RefreshCw } from 'lucide-react';

interface ChartData {
  monthly: Array<{ month: string; income: number; expense: number; balance: number }>;
  categories: Array<{ category: string; amount: number }>;
}

interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Set default date range to last 12 months
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    setDateFrom(twelveMonthsAgo.toISOString().split('T')[0]);
    setDateTo(now.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (dateFrom) {
      loadData();
      loadCategories();
    }
  }, [dateFrom, dateTo, selectedCategory]);

  const loadData = async () => {
    try {
      if (!summary) setIsLoading(true);
      else setIsRefreshing(true);
      
      const [summaryData, chartData] = await Promise.all([
        financeAPI.getSummary(dateFrom, dateTo),
        financeAPI.getChartData(dateFrom, dateTo),
      ]);
      setSummary(summaryData);
      setChartData(chartData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoryList = await financeAPI.getCategories();
      setCategories(categoryList.filter(Boolean));
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleFilterReset = () => {
    setSelectedCategory(undefined);
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    setDateFrom(twelveMonthsAgo.toISOString().split('T')[0]);
    setDateTo(now.toISOString().split('T')[0]);
  };

  const handleRefresh = () => {
    loadData();
  };

  const onCategoryChange = (val: string) => {
    if (val === 'ALL') setSelectedCategory(undefined);
    else setSelectedCategory(val);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex">
          <Sidebar />
          <div className="flex-1 min-h-screen bg-gray-50/50">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground">Memuat data dashboard...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                  Ringkasan keuangan dan statistik organisasi
                </p>
              </div>
              <Button 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Memuat...' : 'Refresh'}
              </Button>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div>
                    <Label htmlFor="dateFrom">Tanggal Mulai</Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateTo">Tanggal Akhir</Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Kategori</Label>
                    <Select value={selectedCategory ?? undefined} onValueChange={onCategoryChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Semua kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Semua kategori</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Button variant="outline" onClick={handleFilterReset} className="w-full">
                      Reset Filter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            {summary && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                      {formatCurrency(summary.totalIncome)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-red-600">
                      {formatCurrency(summary.totalExpense)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                    <DollarSign className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-xl sm:text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(summary.balance)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">
                      {summary.transactionCount}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Charts */}
            {chartData && (
              <div className="space-y-6">
                {/* Top Row - Line Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Trend Saldo Bulanan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TrendLineChart 
                        data={chartData.monthly.map(item => ({
                          month: item.month,
                          balance: item.balance
                        }))} 
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Pemasukan vs Pengeluaran</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <InOutBarChart 
                        data={chartData.monthly.map(item => ({
                          month: item.month,
                          income: item.income,
                          expense: item.expense
                        }))} 
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Middle Row - Balance Line Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Grafik Saldo Kumulatif</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BalanceLineChart 
                      data={chartData.monthly.map(item => ({
                        month: item.month,
                        balance: item.balance
                      }))} 
                    />
                  </CardContent>
                </Card>

                {/* Bottom Row - Category Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribusi Kategori (Pie Chart)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CategoryPieChart data={chartData.categories} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Distribusi Kategori (Donut Chart)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CategoryDonutChart data={chartData.categories} />
                    </CardContent>
                  </Card>
                </div>
              </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
