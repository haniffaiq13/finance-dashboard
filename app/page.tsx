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
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Sidebar } from '@/components/layout/Sidebar';
import { DollarSign, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  // JANGAN pakai string kosong untuk Select. Pakai undefined saat “belum pilih”.
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
      setIsLoading(true);
      const [summaryData, chartData] = await Promise.all([
        financeAPI.getSummary(dateFrom, dateTo /* TODO: terapkan selectedCategory jika API mendukung */),
        financeAPI.getChartData(dateFrom, dateTo /* TODO: terapkan selectedCategory jika API mendukung */),
      ]);
      setSummary(summaryData);
      setChartData(chartData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoryList = await financeAPI.getCategories();
      setCategories(categoryList.filter(Boolean)); // buang kosong/null
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleFilterReset = () => {
    setSelectedCategory(undefined); // BUKAN ""
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    setDateFrom(twelveMonthsAgo.toISOString().split('T')[0]);
    setDateTo(now.toISOString().split('T')[0]);
  };

  // handler Select: "ALL" dianggap clear (undefined)
  const onCategoryChange = (val: string) => {
    if (val === 'ALL') setSelectedCategory(undefined);
    else setSelectedCategory(val);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex">
          <Sidebar />
          <div className="">
            <div className="p-6">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
        <div className="">
          <div className="p-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Ringkasan keuangan dan statistik organisasi
              </p>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <Label htmlFor="dateFrom">Tanggal Mulai</Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateTo">Tanggal Akhir</Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Kategori</Label>
                    {/* value harus undefined untuk placeholder, jangan "" */}
                    <Select value={selectedCategory ?? undefined} onValueChange={onCategoryChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Semua kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Jangan pernah value="" */}
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
                    <Button variant="outline" onClick={handleFilterReset}>
                      Reset Filter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
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
                    <div className="text-2xl font-bold text-red-600">
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
                    <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
                    <div className="text-2xl font-bold">
                      {summary.transactionCount}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Charts */}
            {chartData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Saldo Per Bulan</CardTitle>
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

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Kategori Pengeluaran</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategoryPieChart data={chartData.categories} />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
