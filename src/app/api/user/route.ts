import RealmSingleton from "@/lib/realmDB";
import { User } from "@/schemas/UserSchema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    
    const realm = await RealmSingleton.getInstance();
    let userId;
    
    await realm.write(() => {
      const createdUser = realm.create<User>("User", {
        _id: new Realm.BSON.ObjectId(),
        name: userData.name,
        email: userData.email,
        lastUpdated: new Date()
      });
      userId = createdUser._id;
    });
    
    return NextResponse.json({ success: true, userId });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}