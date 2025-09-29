'use client';

import { useState } from 'react';
import { Member } from '@/types';
import { formatDate } from '@/lib/format';
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
import { CreditCard as Edit, Trash2, Users } from 'lucide-react';
import { useSession } from '@/store/useSession';
import { canEditMember } from '@/lib/rbac';

interface MemberTableProps {
  members: Member[];
  onEdit?: (member: Member) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export function MemberTable({ 
  members, 
  onEdit, 
  onDelete, 
  isLoading 
}: MemberTableProps) {
  const { user } = useSession();
  const [sortField, setSortField] = useState<keyof Member>('joinedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const canEdit = user ? canEditMember(user.role) : false;

  const handleSort = (field: keyof Member) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedMembers = [...members].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Belum ada anggota</p>
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
              onClick={() => handleSort('name')}
            >
              Nama {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted"
              onClick={() => handleSort('email')}
            >
              Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted"
              onClick={() => handleSort('role')}
            >
              Peran {sortField === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted"
              onClick={() => handleSort('status')}
            >
              Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted"
              onClick={() => handleSort('joinedAt')}
            >
              Bergabung {sortField === 'joinedAt' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            {canEdit && <TableHead>Aksi</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMembers.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">
                {member.name}
              </TableCell>
              <TableCell>
                {member.email}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={
                    member.role === 'BENDAHARA' ? 'default' :
                    member.role === 'SEKRETARIS' ? 'secondary' : 'outline'
                  }
                >
                  {member.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={member.status === 'AKTIF' ? 'default' : 'destructive'}
                >
                  {member.status}
                </Badge>
              </TableCell>
              <TableCell className="font-mono">
                {formatDate(member.joinedAt)}
              </TableCell>
              {canEdit && (
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit?.(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete?.(member.id)}
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