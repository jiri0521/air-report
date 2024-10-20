import { useState, useEffect } from 'react';

const useFetchUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ error ] = useState(null);

  // ユーザー情報を取得する非同期関数
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user');
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
        console.error('Error updating user role:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error };
};

export default useFetchUsers;
