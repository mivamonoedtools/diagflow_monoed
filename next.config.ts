import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Native server packages should stay external in Turbopack builds.
   * @resvg/resvg-js ships native bindings used by the PNG export API route.
   */
  serverExternalPackages: ["@resvg/resvg-js"],
};

export default nextConfig;
