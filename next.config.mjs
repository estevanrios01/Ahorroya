/** @type {import('next').NextConfig} */
const nextConfig = {
    ...(process.env.VERCEL ? {} : { output: "standalone" }),
    outputFileTracingRoot: process.cwd(),
    turbopack: {
        root: process.cwd(),
    },
};

export default nextConfig;
