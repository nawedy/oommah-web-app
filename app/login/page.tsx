import Layout from '../components/Layout'
import AuthForm from '../components/AuthForm'

export default function LoginPage() {
  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-primary">Login to Oommah</h1>
        <AuthForm />
      </div>
    </Layout>
  )
}

