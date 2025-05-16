"use client";
import { useEffect } from "react";
import { getMqttClient } from "@/lib/mqttClient";

export default function Welcome() {
  useEffect(() => {
    const createUser = async () => {
      try {
        const response = await fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: "The weekend is here",
            email: "cool@w.com"
          }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          const client = getMqttClient();
          const userId = data.userId;
          const topic = `weekend/${userId}`;
          const payload = JSON.stringify({
          action: "User_Created",
          userId: userId,
          user: {
            name: data.name,
            email: data.email
          }
        });
    client.publish(topic, payload);
          console.log("User created successfully with ID:", data.userId);
        } else {
          console.error("Failed to create user:", data.error);
        }
      } catch (error) {
        console.error("API request failed:", error);
      }
    };
    
    createUser();
  }, []);
  
  return (
    <div>
      <h1>Welcome</h1>
      <p>Creating a new user...</p>
    </div>
  );
}