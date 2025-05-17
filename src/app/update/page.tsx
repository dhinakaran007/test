"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UpdatePage() {
  const router = useRouter();
  type User = { _id: string; name: string; email: string };
  const [user, setUser] = useState<User | null>(null);
  const [updates, setUpdates] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const userId = params.get("userId");

        if (!userId) throw new Error("No userId provided in URL");

        // Get user via API
        const response = await fetch(`/api/user?id=${userId}`);
        const data = await response.json();

        if (!data.success) throw new Error(data.error || "User not found");

        setUser(data.user);
        setUpdates({
          name: data.user.name,
          email: data.user.email,
        });

      } catch (error) {
        console.error("Failed to load user:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleUpdate = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
            updates: {
                name: updates.name,
                email: updates.email,
            }
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert("User updated successfully!");
        router.push('/welcome'); // Or wherever you want to go after updating
      } else {
        throw new Error(data.error || "Failed to update user");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update user");
    }
  };

  if (loading) return <div>Loading user data...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Update User</h1>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Name"
          value={updates.name}
          onChange={(e) => setUpdates({ ...updates, name: e.target.value })}
          style={{ padding: "8px", width: "300px" }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="email"
          placeholder="Email"
          value={updates.email}
          onChange={(e) => setUpdates({ ...updates, email: e.target.value })}
          style={{ padding: "8px", width: "300px" }}
        />
      </div>
      <button
        onClick={handleUpdate}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Save Changes
      </button>
    </div>
  );
}