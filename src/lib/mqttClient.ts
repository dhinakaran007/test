// src/lib/mqttClient.ts
import mqtt, { MqttClient } from 'mqtt';

let client: MqttClient | null = null;

export function getMqttClient(): MqttClient {
  if (!client) {
    const brokerUrl = "ws://localhost:9001";
    if (!brokerUrl) {
      throw new Error('Missing MQTT broker URL in environment variables.');
    }

    client = mqtt.connect(brokerUrl);

    client.on('connect', () => {
      console.log('✅ MQTT connected');
    });

    client.on('error', (err) => {
      console.error('❌ MQTT connection error:', err);
    });

    client.on('close', () => {
      console.log('🚫 MQTT connection closed');
    });
  }

  return client;
}

export function subscribe(
    topic: string | string[],
    callback: (topic: string, message: Buffer) => void,
    options?: mqtt.IClientSubscribeOptions
): void {
    const mqttClient = getMqttClient();
    mqttClient.subscribe(topic, options || {qos: 0}, (err) => {
        if (err) {
            console.error(`❌ Failed to subscribe to topic ${topic}:`, err);
            return;
        }
        console.log(`✅ Subscribed to topic ${topic}`);
    });
    mqttClient.on('message', callback);
}

export function publish(
  topic: string,
  message: string | Buffer,
  options?: mqtt.IClientPublishOptions
): Promise<void> {
  return new Promise((resolve, reject) => {
    const mqttClient = getMqttClient();
    
    mqttClient.publish(topic, message, options || { qos: 0, retain: false }, (err) => {
      if (err) {
        console.error(`❌ Error publishing to ${topic}:`, err);
        reject(err);
        return;
      }
      console.log(`📤 Published message to ${topic}`);
      resolve();
    });
  });
}
