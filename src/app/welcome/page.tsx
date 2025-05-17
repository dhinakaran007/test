"use client";
import { useEffect, useState } from "react";
import { getMqttClient } from "@/lib/mqttClient";
import { useRouter } from "next/navigation";

export default function Welcome() {
  const [userCreated, setUserCreated] = useState(false);
  const [userId, setUserId] = useState("");
  const [userData, setUserData] = useState({ name: "", email: "" });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const createUser = async () => {
      const abortController = new AbortController();

      try {
        setIsLoading(true);
        const response = await fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: "G&G",
            email: "cool@g.com"
          }),
          signal: abortController.signal,
        });
        
        const data = await response.json();
        
        if (data.success) {
          setUserCreated(true);
          setUserId(data.userId);
          setUserData({
            name: data.name,
            email: data.email,
          });
          console.log("User created successfully with ID:", data.userId);
        } else {
          console.error("Failed to create user:", data.error);
        }
      } catch (error) {
        console.error("API request failed:", error);
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    
    createUser();
  }, []);
  
  const publishMqttMessage = () => {
    try {
      const client = getMqttClient();
      const topic = `weekend/${userId}`;
      const payload = JSON.stringify({
        action: "User_Created",
        userId: userId,
        user: {
          name: userData.name,
          email: userData.email
        }
      });
      
      client.publish(topic, payload);
      alert("MQTT message published successfully!");
    } catch (error) {
      console.error("Failed to publish MQTT message:", error);
      alert("Failed to publish MQTT message");
    }
  };
  
  return (
    <div style={{ padding: "20px" }}>
      <h1>Welcome</h1>
      
      {isLoading ? (
        <p>Creating a new user...</p>
      ) : userCreated ? (
        <div>
          <p>User created successfully with ID: {userId}</p>
          <button 
            onClick={publishMqttMessage}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Publish MQTT Message
          </button>

          <button
            onClick={() => router.push(`/update?userId=${userId}`)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
          Edit User
          </button>
        </div>
      ) : (
        <p>Failed to create user. Please try again.</p>
      )}
    </div>
  );
}