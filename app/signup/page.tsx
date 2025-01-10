import AuthForm from '../components/AuthForm'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join Oommah to connect with your community
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}

