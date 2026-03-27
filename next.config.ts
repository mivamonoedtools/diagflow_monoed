import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep native resvg bindings as runtime externals; Turbopack can fail
  // to bundle optional platform packages for this dependency.
  serverExternalPackages: ["@resvg/resvg-js", "@resvg/resvg-js-win32-x64-msvc"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
