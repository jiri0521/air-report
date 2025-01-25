'use client'

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  staffNumber: string;
  role: string;
}

const useFetchUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refreshUsers: fetchUsers };
};

export default useFetchUsers;
