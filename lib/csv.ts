import { Transaction } from '@/types';
import { formatCurrency, formatDate } from './format';

export const exportTransactionsToCSV = (transactions: Transaction[]): string => {
  const headers = [
    'Tanggal',
    'Deskripsi', 
    'Kategori',
    'Tipe',
    'Jumlah (IDR)',
    'Lampiran',
    'Dibuat Oleh',
    'Tanggal Dibuat'
  ];
  
  const rows = transactions.map(transaction => [
    formatDate(transaction.date),
    transaction.description,
    transaction.category,
    transaction.type,
    transaction.amount.toString(),
    transaction.attachments.length > 0 ? 'Ya' : 'Tidak',
    transaction.createdBy,
    formatDate(transaction.createdAt)
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  return csvContent;
};

export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export const exportFilteredTransactions = (
  transactions: Transaction[], 
  filters?: { dateFrom?: string; dateTo?: string; category?: string }
): void => {
  const filteredData = transactions.filter(transaction => {
    if (filters?.dateFrom && transaction.date < filters.dateFrom) return false;
    if (filters?.dateTo && transaction.date > filters.dateTo) return false; 
    if (filters?.category && transaction.category !== filters.category) return false;
    return true;
  });
  
  const csvContent = exportTransactionsToCSV(filteredData);
  const filename = `transaksi-${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(csvContent, filename);
};