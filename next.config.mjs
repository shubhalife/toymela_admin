/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "res.cloudinary.com",
      },
      {
        hostname: "kindwoodpecker.com",
      },
    ],
  },
};

export default nextConfig;
