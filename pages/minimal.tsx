import { useMemo } from 'react';
import {
  SessionProvider,
  useSession,
  VideoConference,
  setLogLevel,
  useEvents,
  useDataChannel,
  SessionEvent,
} from '@livekit/components-react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { RoomEvent, TokenSource, MediaDeviceFailure } from 'livekit-client';

const tokenSource = TokenSource.endpoint(process.env.NEXT_PUBLIC_LK_TOKEN_ENDPOINT!);

const TranscriptionOverlay = () => {
  const [messages, setMessages] = useState<{ id: number; text: string; user: string }[]>([]);

  // Fixed hook signature: topic first, then callback with typed message
  useDataChannel('transcriptions', (message: any) => {
    try {
      const decoded = JSON.parse(new TextDecoder().decode(message.payload));

      if (decoded.type === 'transcript') {
        const newMessage = {
          id: Date.now(),
          text: decoded.text,
          user: decoded.participantId,
        };

        setMessages((prev) => [...prev.slice(-2), newMessage]);

        // Auto-cleanup after 6 seconds
        setTimeout(() => {
          setMessages((prev) => prev.filter((m) => m.id !== newMessage.id));
        }, 6000);
      }
    } catch (e: any) {
      console.error('Data Channel Parse Error:', e);
    }
  });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        width: '90%',
        maxWidth: '700px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}
    >
      {messages.map((m) => (
        <div
          key={m.id}
          style={{
            background: 'rgba(0, 0, 0, 0.75)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '10px',
            fontSize: '1.25rem',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.1)',
            animation: 'fadeUp 0.3s ease-out',
          }}
        >
          <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{m.user}: </span> {m.text}
        </div>
      ))}
      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

const MinimalExample: NextPage = () => {
  const router = useRouter();
  const { room, user } = router.query;
  const roomName = typeof room === 'string' ? room : '';
  const userIdentity = typeof user === 'string' ? user : '';

  setLogLevel('debug', { liveKitClientLogLevel: 'info' });

  const sessionOptions = useMemo(() => {
    return {
      roomName,
      participantIdentity: userIdentity,
      participantName: userIdentity,
    };
  }, [roomName, userIdentity]);

  const session = useSession(tokenSource, sessionOptions);

  useEffect(() => {
    if (!router.isReady) return;
    if (!roomName || !userIdentity) {
      router.push('/');
      return;
    }
    session
      .start({ tracks: { microphone: { enabled: true } } }) // Mic must be on for transcription
      .catch((err) => console.error('Start error:', err));
    return () => {
      session.end().catch(console.error);
    };
  }, [router.isReady, roomName, userIdentity]);

  useEffect(() => {
    if (!session.room) return;
    const onDisconnected = () => router.push('/');
    session.room.on(RoomEvent.Disconnected, onDisconnected);
    return () => {
      session.room.off(RoomEvent.Disconnected, onDisconnected);
    };
  }, [session.room, router]);

  if (!session.isConnected) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div data-lk-theme="default" style={{ height: '100vh', position: 'relative', background: '#111' }}>
      <SessionProvider session={session}>
        <VideoConference />
        <TranscriptionOverlay />
      </SessionProvider>
    </div>
  );
};

export default MinimalExample;