'use client';

import { useState } from 'react';
import { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { CreditCard as Edit, Trash2, FileText, Download } from 'lucide-react';
import { useSession } from '@/store/useSession';
import { canEditTransaction } from '@/lib/rbac';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export function TransactionTable({ 
  transactions, 
  onEdit, 
  onDelete, 
  isLoading 
}: TransactionTableProps) {
  const { user } = useSession();
  const [sortField, setSortField] = useState<keyof Transaction>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const canEdit = user ? canEditTransaction(user.role) : false;

  const handleSort = (field: keyof Transaction) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleDownloadAttachment = (attachment: any) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Belum ada transaksi</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-muted"
              onClick={() => handleSort('date')}
            >
              Tanggal {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted"
              onClick={() => handleSort('description')}
            >
              Deskripsi {sortField === 'description' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted"
              onClick={() => handleSort('category')}
            >
              Kategori {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead className="text-right">Jumlah</TableHead>
            <TableHead>Lampiran</TableHead>
            {canEdit && <TableHead>Aksi</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-mono">
                {formatDate(transaction.date)}
              </TableCell>
              <TableCell>
                <div className="max-w-[200px] truncate">
                  {transaction.description}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{transaction.category}</Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={transaction.type === 'MASUK' ? 'default' : 'destructive'}
                >
                  {transaction.type}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono">
                <span
                  className={
                    transaction.type === 'MASUK'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {transaction.type === 'MASUK' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </span>
              </TableCell>
              <TableCell>
                {transaction.attachments.length > 0 ? (
                  <div className="flex gap-1">
                    {transaction.attachments.map((attachment) => (
                      <Button
                        key={attachment.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadAttachment(attachment)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {transaction.attachments.length === 1 
                          ? 'Download' 
                          : transaction.attachments.indexOf(attachment) + 1
                        }
                      </Button>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              {canEdit && (
                <TableCell>
                  <div className="flex gap-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit?.(transaction)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete?.(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}