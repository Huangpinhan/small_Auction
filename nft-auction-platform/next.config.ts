
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_NFT_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
    NEXT_PUBLIC_PINATA_API_KEY: process.env.NEXT_PUBLIC_PINATA_API_KEY,
    NEXT_PUBLIC_PINATA_SECRET_API_KEY: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
  },
  experimental: {
    turbo: false, // ✅ 關閉 Turbopack，使用 Webpack
  },
};

export default nextConfig;

