'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MqttClient from '@/components/MqttClient';

export default function Home() {
  const [connected, setConnected] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (connected) {
      setTimeout(() => {
        router.push('/welcome');
      }, 1000);
    }
  }, [connected, router]);

  return (
    <>
      <h1>MQTT Client</h1>
      <MqttClient onConnected={() => setConnected(true)} />
      
      <p style={{ paddingTop: '1rem' }}>
        This is a simple MQTT client built with Next.js and MQTT.js.
      </p>
      <p>
        It connects to a local MQTT broker and subscribes to a topic.
      </p>
      <p>
        You can publish messages to the topic and see them in real-time.
      </p>

      {connected && <p>✅ Connected! Redirecting to welcome page...</p>}
    </>
  );
}
