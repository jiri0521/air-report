import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/password-reset/${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'レポッチ <onboarding@resend.dev>', // Use Resend's default domain
      to: email,
      subject: 'パスワードリセットのリクエスト',
      html: `
        <html>
          <body>
            <h2>パスワードリセットのリクエスト</h2>
            <p>以下のリンクをクリックしてパスワードをリセットしてください：</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>このリンクは1時間後に無効になります。</p>
            <p>パスワードリセットをリクエストしていない場合は、このメールを無視してください。</p>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }

    return data;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}