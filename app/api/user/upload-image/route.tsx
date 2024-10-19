import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save the file to the public directory
    const filename = `${userId}-${Date.now()}${path.extname(file.name)}`;
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
    await writeFile(filepath, buffer);

    // Update the user's settings with the new image URL
    const imageUrl = `/uploads/${filename}`;
    await db.userSettings.update({
      where: { userId },
      data: { image: imageUrl },
    });

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}