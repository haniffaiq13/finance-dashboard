'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { TransactionTable } from '@/components/finance/TransactionTable';
import { TransactionForm } from '@/components/finance/TransactionForm';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Sidebar } from '@/components/layout/Sidebar';
import { useFinance } from '@/store/useFinance';
import { useSession } from '@/store/useSession';
import { financeAPI } from '@/lib/api';
import { canCreateTransaction, canExportData } from '@/lib/rbac';
import { exportFilteredTransactions } from '@/lib/csv';
import { Transaction, TransactionFilters, TransType } from '@/types';
import { Plus, Download, Search, Filter, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function KeuanganPage() {
  const { user } = useSession();
  const { 
    transactions, 
    isLoading, 
    filters, 
    fetchTransactions, 
    setFilters, 
    createTransaction, 
    updateTransaction, 
    deleteTransaction, 
    resetFilters 
  } = useFinance();
  
  const { toast } = useToast();
  const [categories, setCategories] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [localFilters, setLocalFilters] = useState<TransactionFilters>({});

  const canCreate = user ? canCreateTransaction(user.role) : false;
  const canExport = user ? canExportData(user.role) : false;

  useEffect(() => {
    fetchTransactions();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoryList = await financeAPI.getCategories();
      setCategories(['Gaji', 'Operasional', 'Marketing', 'Donasi', 'Jasa', 'Lainnya', ...categoryList]);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSearch = () => {
    const newFilters = {
      ...localFilters,
      search: searchTerm || undefined,
    };
    setFilters(newFilters);
  };

  const handleFilterChange = (key: keyof TransactionFilters, value: any) => {
    const newFilters = {
      ...localFilters,
      [key]: value || undefined,
    };
    setLocalFilters(newFilters);
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setLocalFilters({});
    setSearchTerm('');
    resetFilters();
  };

  const handleCreateTransaction = async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createTransaction(data);
      setIsFormOpen(false);
    } catch (error) {
      throw error; // Let the form handle the error
    }
  };

  const handleUpdateTransaction = async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingTransaction) return;
    
    try {
      await updateTransaction(editingTransaction.id, data);
      setEditingTransaction(undefined);
      setIsFormOpen(false);
    } catch (error) {
      throw error; // Let the form handle the error
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deleteId) return;
    
    try {
      await deleteTransaction(deleteId);
      setDeleteId(null);
      toast({
        title: 'Transaksi dihapus',
        description: 'Data transaksi berhasil dihapus.',
      });
    } catch (error) {
      toast({
        title: 'Terjadi kesalahan',
        description: 'Gagal menghapus transaksi.',
        variant: 'destructive',
      });
    }
  };

  const handleExport = () => {
    exportFilteredTransactions(transactions, filters);
    toast({
      title: 'Data berhasil diexport',
      description: 'File CSV telah diunduh.',
    });
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 md:ml-64">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">Keuangan</h1>
                <p className="text-muted-foreground">
                  Kelola transaksi pemasukan dan pengeluaran
                </p>
              </div>
              <div className="flex gap-2">
                {canExport && (
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                )}
                {canCreate && (
                  <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Transaksi
                  </Button>
                )}
              </div>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
                <CardDescription>
                  Filter transaksi berdasarkan tanggal, kategori, atau tipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Search */}
                  <div className="md:col-span-2">
                    <Label htmlFor="search">Cari</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="search"
                        placeholder="Cari deskripsi atau kategori..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <Button variant="outline" size="icon" onClick={handleSearch}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Date From */}
                  <div>
                    <Label htmlFor="dateFrom">Dari Tanggal</Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={localFilters.dateFrom || ''}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* Date To */}
                  <div>
                    <Label htmlFor="dateTo">Sampai Tanggal</Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={localFilters.dateTo || ''}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <Label htmlFor="category">Kategori</Label>
                    <Select
                      value={localFilters.category || ''}
                      onValueChange={(value) => handleFilterChange('category', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Semua" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Semua kategori</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Type */}
                  <div>
                    <Label htmlFor="type">Tipe</Label>
                    <Select
                      value={localFilters.type || ''}
                      onValueChange={(value: TransType | '') => handleFilterChange('type', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Semua" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Semua tipe</SelectItem>
                        <SelectItem value="MASUK">Pemasukan</SelectItem>
                        <SelectItem value="KELUAR">Pengeluaran</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reset Button */}
                  <div className="md:col-span-5 flex justify-end">
                    <Button variant="outline" onClick={handleResetFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Reset Filter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Table */}
            <Card>
              <CardHeader>
                <CardTitle>Daftar Transaksi</CardTitle>
                <CardDescription>
                  Total: {transactions.length} transaksi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionTable
                  transactions={transactions}
                  onEdit={canCreate ? handleEditClick : undefined}
                  onDelete={canCreate ? handleDeleteClick : undefined}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>

            {/* Transaction Form Modal */}
            {canCreate && (
              <TransactionForm
                isOpen={isFormOpen}
                onClose={() => {
                  setIsFormOpen(false);
                  setEditingTransaction(undefined);
                }}
                onSubmit={editingTransaction ? handleUpdateTransaction : handleCreateTransaction}
                transaction={editingTransaction}
                categories={categories}
              />
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Transaksi</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus transaksi ini? 
                    Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteTransaction}>
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}