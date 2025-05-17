import RealmSingleton from "@/lib/realmDB";
import { User } from "@/schemas/UserSchema";
import { NextResponse } from "next/server";
import Realm from "realm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, updates } = body;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "No user ID provided" },
        { status: 400 }
      );
    }

    // Get the same Realm instance - no new connection needed
    const realm = await RealmSingleton.getInstance();
    
    try {
      const objectId = new Realm.BSON.ObjectId(userId);
      
      // Check if user exists
      const user = realm.objectForPrimaryKey<User>("User", objectId);
      if (!user) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }
      
      // Update user in a write transaction
      realm.write(() => {
        if (updates.name !== undefined) user.name = updates.name;
        if (updates.email !== undefined) user.email = updates.email;
        user.lastUpdated = new Date();
      });
      
      return NextResponse.json({
        success: true,
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          lastUpdated: user.lastUpdated
        }
      });
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid user ID" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}