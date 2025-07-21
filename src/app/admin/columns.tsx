
'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import type { User, Role } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/auth-context';
import { DeleteUserDialog } from './delete-user-dialog';
import { EditUserDialog } from './edit-user-dialog';
import type { Timestamp } from 'firebase/firestore';

// Helper function to convert Firestore Timestamp to a readable date string
const formatDate = (date: string | Timestamp) => {
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString();
  }
  if (date && typeof date.toDate === 'function') {
    return date.toDate().toLocaleDateString();
  }
  return 'Invalid Date';
};


export const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'User',
    cell: ({ row }) => {
        const user = row.original;
        return (
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                </div>
            </div>
        )
    }
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      const variant: 'default' | 'secondary' | 'outline' =
        role === 'Developer' ? 'default' :
        role === 'TaxConsultant' ? 'secondary' : 'outline';
      return <Badge variant={variant}>{role}</Badge>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
  },
  {
    id: 'actions',
    cell: function ActionsCell({ row }) {
      const user = row.original;
      const { user: currentUser, updateUserRole, deleteUser, updateUser } = useAuth();
      const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
      const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
      const roles: Role[] = ['Client', 'Staff', 'TaxConsultant', 'Developer'];

      const isCurrentUser = currentUser?.id === user.id;
      const isStaffEditingDeveloper = currentUser?.role === 'Staff' && user.role === 'Developer';

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>Edit User</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger disabled={isCurrentUser || isStaffEditingDeveloper}>Change Role</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        {roles.map(role => (
                            <DropdownMenuItem key={role} onSelect={() => updateUserRole(user.id, role)}>
                                {role}
                                {user.role === role && <span className="ml-auto text-xs"> (current)</span>}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onSelect={() => setIsDeleteDialogOpen(true)}
                disabled={isCurrentUser || isStaffEditingDeveloper}
              >
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DeleteUserDialog
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={() => deleteUser(user.id)}
            userName={user.name}
          />
          <EditUserDialog
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            user={user}
            onUpdateUser={updateUser}
          />
        </>
      );
    },
  },
];
