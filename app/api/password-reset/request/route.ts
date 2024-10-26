import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    try {
      await sendPasswordResetEmail(user.email, token);
      return NextResponse.json({ message: 'Password reset email sent' });
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      return NextResponse.json({ error: 'Failed to send password reset email' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}