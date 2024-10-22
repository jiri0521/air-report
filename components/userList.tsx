'use client'

import React, { useState, useEffect } from 'react';
import useFetchUsers from '@/components/useFetchUsers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from './ui/button';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function UserList() {
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const { users: fetchedUsers, refreshUsers, loading, error } = useFetchUsers();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setUsers(fetchedUsers);
  }, [fetchedUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/user/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (response.ok) {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, role: newRole } : user
          )
        );
        setIsSuccessModalOpen(true);
        console.log('ロールの更新に成功しました。');
        await refreshUsers(); // Refresh the users list from the server
      } else {
        throw new Error('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  // 重複するユーザーIDをフィルタリング
  const uniqueUsers = users.filter((user, index, self) =>
    index === self.findIndex((u) => u.id === user.id)
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      {uniqueUsers.map((user) => (
        <div key={user.id} className="flex items-center justify-between">
          <p>{user.name} ({user.email})</p>
          <Select
            value={user.role}
            onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="ロールを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">ユーザー</SelectItem>
              <SelectItem value="ADMIN">管理者</SelectItem>
              <SelectItem value="MANAGER">マネージャー</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ))}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent>
          <div className="rounded-lg shadow-lg p-6 bg-white border border-gray-300">
            <DialogHeader className="text-center mb-4">
              <DialogTitle className="text-xl font-bold text-blue-600">成功</DialogTitle>
              <DialogDescription className="text-gray-600">
                ユーザーの権限が変更されました。
              </DialogDescription>
            </DialogHeader>
            <div className="">
              {/* アイコンや画像をここに追加する場合は、ここに記述 */}
            </div>
            <Button
              onClick={() => setIsSuccessModalOpen(false)} 
              className="w-full mt-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-200"
            >
              閉じる
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}