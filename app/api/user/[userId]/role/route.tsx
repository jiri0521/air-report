import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth'; // 認証用モジュール

const prisma = new PrismaClient();

export async function PUT(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // 認証チェック
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // userIdをパラメータから取得
     const userId = parseInt(params.userId)

    // リクエストボディから新しいロールを取得
    const { role } = await req.json();

    // roleの値が有効かどうかを確認
    const validRoles = ['USER', 'ADMIN', 'MANAGER'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Prismaを使用してユーザーのロールを更新
    const updatedUser = await prisma.user.update({
      where: { id: String(userId) }, // userIdが文字列の場合
      data: { role },
    });

    // 更新されたユーザー情報を返す
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
