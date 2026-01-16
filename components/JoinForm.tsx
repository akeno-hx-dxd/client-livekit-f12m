'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.scss';

export const JoinForm = () => {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (roomName && displayName) {
      router.push(`/minimal?room=${roomName}&user=${displayName}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="text"
        placeholder="Room name"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Display name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        required
      />
      <button type="submit">Join</button>
    </form>
  );
};
