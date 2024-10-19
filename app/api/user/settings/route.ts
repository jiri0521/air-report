import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const userSettings = await db.userSettings.findUnique({
      where: { userId },
    });

    if (!userSettings) {
      return NextResponse.json({ error: "User settings not found" }, { status: 404 });
    }

    return NextResponse.json(userSettings);
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { name, emailNotifications, pushNotifications, fontSize, language, theme } = await req.json();

    const updatedSettings = await db.userSettings.upsert({
      where: { userId },
      update: {
        name,
        emailNotifications,
        pushNotifications,
        fontSize,
        language,
        theme,
      },
      create: {
        userId,
        name,
        emailNotifications,
        pushNotifications,
        fontSize,
        language,
        theme,
      },
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("Error saving user settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}