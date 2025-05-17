import RealmSingleton from "@/lib/realmDB";
import { User } from "@/schemas/UserSchema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    
    const realm = await RealmSingleton.getInstance();

    const existingUsers = realm.objects<User>("User").filtered("email == $0", userData.email);
    if (existingUsers.length > 0) {
      return NextResponse.json({ 
        success: true, 
        userId: existingUsers[0]._id,
        message: "User already exists" 
      });
    }


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


export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "No user ID provided" },
        { status: 400 }
      );
    }

    // Get the realm instance - this is the key part that reuses the instance
    const realm = await RealmSingleton.getInstance();
    
    try {
      const objectId = new Realm.BSON.ObjectId(userId);
      // Direct use of the realm instance
      const user = realm.objectForPrimaryKey<User>("User", objectId);
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email
        }
      });
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid user ID" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}