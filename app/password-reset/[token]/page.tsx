import PasswordResetForm from '@/components/password-reset-form'

export default function PasswordResetPage({ params }: { params: { token: string } }) {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <PasswordResetForm token={params.token} />
    </div>
  )
}