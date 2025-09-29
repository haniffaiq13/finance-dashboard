'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Member, Role } from '@/types';
import { useToast } from '@/hooks/use-toast';

const memberSchema = z.object({
  name: z.string().min(1, 'Nama harus diisi'),
  email: z.string().email('Email tidak valid'),
  role: z.enum(['BENDAHARA', 'SEKRETARIS', 'ANGGOTA']),
  status: z.enum(['AKTIF', 'NONAKTIF']),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Member, 'id' | 'joinedAt'>) => Promise<void>;
  member?: Member;
}

export function MemberForm({
  isOpen,
  onClose,
  onSubmit,
  member
}: MemberFormProps) {
  const { toast } = useToast();

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: member?.name || '',
      email: member?.email || '',
      role: member?.role || 'ANGGOTA',
      status: member?.status || 'AKTIF',
    },
  });

  const handleSubmit = async (data: MemberFormData) => {
    try {
      await onSubmit(data);
      
      onClose();
      form.reset();
      
      toast({
        title: member ? 'Anggota diperbarui' : 'Anggota ditambahkan',
        description: 'Data anggota berhasil disimpan.',
      });
    } catch (error: any) {
      toast({
        title: 'Terjadi kesalahan',
        description: error.message || 'Gagal menyimpan data anggota.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {member ? 'Edit Anggota' : 'Tambah Anggota'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              placeholder="Masukkan nama lengkap"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Peran</Label>
            <Select
              value={form.watch('role')}
              onValueChange={(value: Role) => form.setValue('role', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih peran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BENDAHARA">Bendahara</SelectItem>
                <SelectItem value="SEKRETARIS">Sekretaris</SelectItem>
                <SelectItem value="ANGGOTA">Anggota</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-sm text-destructive">
                {form.formState.errors.role.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-3">
            <Label>Status</Label>
            <RadioGroup
              value={form.watch('status')}
              onValueChange={(value: 'AKTIF' | 'NONAKTIF') => form.setValue('status', value)}
              className="flex gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="AKTIF" id="aktif" />
                <Label htmlFor="aktif">Aktif</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NONAKTIF" id="nonaktif" />
                <Label htmlFor="nonaktif">Non-Aktif</Label>
              </div>
            </RadioGroup>
            {form.formState.errors.status && (
              <p className="text-sm text-destructive">
                {form.formState.errors.status.message}
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}