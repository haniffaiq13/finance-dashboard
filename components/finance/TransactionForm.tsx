'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Transaction, TransType, Attachment } from '@/types';
import { createAttachment, validateFileType, formatFileSize } from '@/lib/upload';
import { formatDateForInput } from '@/lib/format';
import { useSession } from '@/store/useSession';
import { Upload, X, FileText, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const transactionSchema = z.object({
  date: z.string().min(1, 'Tanggal harus diisi'),
  description: z.string().min(1, 'Deskripsi harus diisi'),
  category: z.string().min(1, 'Kategori harus dipilih'),
  type: z.enum(['MASUK', 'KELUAR']),
  amount: z.number().min(1, 'Jumlah harus lebih dari 0'),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  transaction?: Transaction;
  categories: string[];
}

export function TransactionForm({
  isOpen,
  onClose,
  onSubmit,
  transaction,
  categories
}: TransactionFormProps) {
  const { user } = useSession();
  const { toast } = useToast();
  const [attachments, setAttachments] = useState<Attachment[]>(transaction?.attachments || []);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: transaction ? formatDateForInput(transaction.date) : formatDateForInput(new Date().toISOString()),
      description: transaction?.description || '',
      category: transaction?.category || '',
      type: transaction?.type || 'KELUAR',
      amount: transaction?.amount || 0,
    },
  });

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!files.length) return;

    setIsUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (!validateFileType(file)) {
          toast({
            title: 'File tidak didukung',
            description: `File ${file.name} tidak didukung. Hanya PDF dan gambar yang diperbolehkan.`,
            variant: 'destructive',
          });
          return null;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          toast({
            title: 'File terlalu besar',
            description: `File ${file.name} lebih dari 5MB.`,
            variant: 'destructive',
          });
          return null;
        }

        return await createAttachment(file);
      });

      const results = await Promise.all(uploadPromises);
      const validAttachments = results.filter(Boolean) as Attachment[];
      
      setAttachments(prev => [...prev, ...validAttachments]);
      
      if (validAttachments.length > 0) {
        toast({
          title: 'File berhasil diupload',
          description: `${validAttachments.length} file berhasil ditambahkan.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Upload gagal',
        description: 'Terjadi kesalahan saat mengupload file.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [toast]);

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === attachmentId);
      if (attachment && attachment.url.startsWith('blob:')) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter(a => a.id !== attachmentId);
    });
  };

  const handleSubmit = async (data: TransactionFormData) => {
    if (!user) return;

    try {
      await onSubmit({
        ...data,
        date: new Date(data.date).toISOString(),
        attachments,
        createdBy: user.id,
      });
      
      onClose();
      form.reset();
      setAttachments([]);
      
      toast({
        title: transaction ? 'Transaksi diperbarui' : 'Transaksi ditambahkan',
        description: 'Data transaksi berhasil disimpan.',
      });
    } catch (error) {
      toast({
        title: 'Terjadi kesalahan',
        description: 'Gagal menyimpan transaksi.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date"
              type="date"
              {...form.register('date')}
            />
            {form.formState.errors.date && (
              <p className="text-sm text-destructive">
                {form.formState.errors.date.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              placeholder="Masukkan deskripsi transaksi"
              {...form.register('description')}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select
              value={form.watch('category')}
              onValueChange={(value) => form.setValue('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.category && (
              <p className="text-sm text-destructive">
                {form.formState.errors.category.message}
              </p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-3">
            <Label>Tipe Transaksi</Label>
            <RadioGroup
              value={form.watch('type')}
              onValueChange={(value: TransType) => form.setValue('type', value)}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MASUK" id="masuk" />
                <Label htmlFor="masuk">Pemasukan</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="KELUAR" id="keluar" />
                <Label htmlFor="keluar">Pengeluaran</Label>
              </div>
            </RadioGroup>
            {form.formState.errors.type && (
              <p className="text-sm text-destructive">
                {form.formState.errors.type.message}
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah (IDR)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="1000"
              placeholder="0"
              {...form.register('amount', { valueAsNumber: true })}
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Lampiran</Label>
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = '.pdf,.png,.jpg,.jpeg';
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files) {
                    handleFileUpload(files);
                  }
                };
                input.click();
              }}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Klik untuk upload atau drag & drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, PNG, JPG (max 5MB)
              </p>
            </div>

            {/* Attachment List */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-2 border rounded-md"
                  >
                    <div className="flex items-center space-x-2">
                      {attachment.mimeType.startsWith('image/') ? (
                        <Image className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {isUploading && (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                <span className="text-sm text-muted-foreground">Uploading...</span>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting || isUploading}
            >
              {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}