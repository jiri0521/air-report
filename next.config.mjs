/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async headers() {
        return [
          {
            source: '/:path*',
            headers: [
              {
                key: 'Content-Security-Policy',
                value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'self' https://api.resend.com",
              },
            ],
          },
        ]
      },
    images: {
        domains: [
            "lh3.googleusercontent.com",
            "res.cloudinary.com",
        ]
    }
};

export default nextConfig;
