'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MemberTable } from '@/components/members/MemberTable';
import { MemberForm } from '@/components/members/MemberForm';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Sidebar } from '@/components/layout/Sidebar';
import { useMembers } from '@/store/useMembers';
import { useSession } from '@/store/useSession';
import { canCreateMember } from '@/lib/rbac';
import { Member } from '@/types';
import { Plus, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AnggotaPage() {
  const { user } = useSession();
  const { 
    members, 
    isLoading, 
    fetchMembers, 
    createMember, 
    updateMember, 
    deleteMember 
  } = useMembers();
  
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const canCreate = user ? canCreateMember(user.role) : false;

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleCreateMember = async (data: Omit<Member, 'id' | 'joinedAt'>) => {
    try {
      await createMember(data);
      setIsFormOpen(false);
    } catch (error) {
      throw error; // Let the form handle the error
    }
  };

  const handleUpdateMember = async (data: Omit<Member, 'id' | 'joinedAt'>) => {
    if (!editingMember) return;
    
    try {
      await updateMember(editingMember.id, data);
      setEditingMember(undefined);
      setIsFormOpen(false);
    } catch (error) {
      throw error; // Let the form handle the error
    }
  };

  const handleDeleteMember = async () => {
    if (!deleteId) return;
    
    try {
      await deleteMember(deleteId);
      setDeleteId(null);
      toast({
        title: 'Anggota dihapus',
        description: 'Data anggota berhasil dihapus.',
      });
    } catch (error) {
      toast({
        title: 'Terjadi kesalahan',
        description: 'Gagal menghapus data anggota.',
        variant: 'destructive',
      });
    }
  };

  const handleEditClick = (member: Member) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const activeMembers = members.filter(m => m.status === 'AKTIF').length;
  const inactiveMembers = members.filter(m => m.status === 'NONAKTIF').length;

  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 md:ml-64">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">Anggota</h1>
                <p className="text-muted-foreground">
                  Kelola data anggota organisasi
                </p>
              </div>
              {canCreate && (
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Anggota
                </Button>
              )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Anggota</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{members.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Anggota Aktif</CardTitle>
                  <Users className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{activeMembers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Anggota Non-Aktif</CardTitle>
                  <Users className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{inactiveMembers}</div>
                </CardContent>
              </Card>
            </div>

            {/* Member Table */}
            <Card>
              <CardHeader>
                <CardTitle>Daftar Anggota</CardTitle>
                <CardDescription>
                  Daftar semua anggota dalam organisasi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MemberTable
                  members={members}
                  onEdit={canCreate ? handleEditClick : undefined}
                  onDelete={canCreate ? handleDeleteClick : undefined}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>

            {/* Member Form Modal */}
            {canCreate && (
              <MemberForm
                isOpen={isFormOpen}
                onClose={() => {
                  setIsFormOpen(false);
                  setEditingMember(undefined);
                }}
                onSubmit={editingMember ? handleUpdateMember : handleCreateMember}
                member={editingMember}
              />
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Anggota</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus data anggota ini? 
                    Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteMember}>
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