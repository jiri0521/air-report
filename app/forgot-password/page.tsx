import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ForgotPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[400px] shadow-md">
        <CardHeader>
          <CardTitle className="text-center">パスワードをお忘れの方</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">放射線科の川尻（PHS221）<br/>に連絡お願いします。</p>
          <div className="flex justify-center mt-6">
            <a href="/login" className="text-primary hover:underline">
              ログイン画面に戻る
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

