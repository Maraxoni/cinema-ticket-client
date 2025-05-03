import React, { useEffect, useState } from 'react';
import { fetchUsers } from '../api/cinemaApi';
import { User } from '../types';

const UserPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers().then(setUsers);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Użytkownicy</h1>
      <ul className="space-y-2">
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserPage;
