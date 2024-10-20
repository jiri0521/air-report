import React from 'react';
import useFetchUsers from '@/components/useFetchUsers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

  
  const handleRoleChange = async (userId: string, newRole: string) => { // 型を明示的に指定
    try {
    const response = await fetch(`/api/user/${userId}/role`, {
    method: 'PUT',
    headers: {
    'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role: newRole }),
    })
    if (response.ok) {
    //setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user))
    toast({
    title: "ロールが更新されました",
    description: "ユーザーのロールが正常に更新されました。",
    variant: "default",
    })
    } else {
    throw new Error('Failed to update user role')
    }
    } catch (error) {
    console.error('Error updating user role:', error)
    toast({
    title: "エラー",
    description: "ユーザーのロール更新中にエラーが発生しました。",
    variant: "destructive",
    })
    }
    }

const UserList = () => { // UserList コンポーネントを定義
    const { users, }: { users: { id: string; name: string; email: string; role: string }[]; } = useFetchUsers();// フックでユーザー情報を取得

    // 重複するユーザーIDをフィルタリング
    const uniqueUsers = users.filter((user, index, self) =>
      index === self.findIndex((u) => u.id === user.id)
    );
  
    return (
        <div className="space-y-4">
          {uniqueUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <span>{user.name} ({user.email})</span>
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
        </div>
      );
    };
    
    export default UserList;
