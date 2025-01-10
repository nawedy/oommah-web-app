/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com'],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      const originalEntry = config.entry
      config.entry = async () => {
        const entries = await originalEntry()
        return {
          ...entries,
          websocket: './server/websocket.ts',
        }
      }
    }
    return config
  },
}

module.exports = nextConfig

