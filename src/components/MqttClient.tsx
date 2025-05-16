'use client';

import { useEffect, useState } from 'react';
import { getMqttClient } from '@/lib/mqttClient';

interface MqttClientProps {
  onConnected?: () => void;
}

export default function MqttClient({ onConnected }: MqttClientProps) {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const client = getMqttClient();
    const topic = 'weekend';

    const handleMessage = (topic: string, message: Buffer) => {
      const msg = message.toString();
      console.log(`📩 Received message on ${topic}: ${msg}`);
      setMessages((prev) => [...prev, msg]);
    };

    client.subscribe(topic, (err) => {
      if (err) {
        console.error(`❌ Failed to subscribe to topic "${topic}":`, err);
        return;
      }

      console.log(`✅ Subscribed to topic "${topic}"`);
      client.publish(topic, 'Hello from Next.js MQTT client!');
      onConnected?.(); // ✅ Call onConnected only if it's defined
    });

    client.on('message', handleMessage);

    return () => {
      client.off('message', handleMessage);
    };
  }, [onConnected]);

  return (
    <div style={{ paddingTop: '1rem' }}>
      <h2>MQTT Messages</h2>
      <ul>
        {messages.map((msg, idx) => (
          <li key={idx}>📝 {msg}</li>
        ))}
      </ul>
    </div>
  );
}
