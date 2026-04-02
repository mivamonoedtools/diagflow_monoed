import { ArrowLeft, Frown } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-white">
      {/* Funny mascot icon */}
      <Frown className="w-16 md:w-20 h-16 md:h-20 text-primary animate-bounce mb-6" />

      {/* Heading */}
      <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-900">
        404 - Page Not Found
      </h1>

      {/* Subtext */}
      <p className="mb-8 text-muted-foreground max-w-md">
        Looks like this page went ghost 👻. Don&apos;t worry, we&apos;ll guide you back
        home safely!
      </p>

      {/* Button */}
      <Link
        href="/"
        className="inline-flex items-center px-4 py-2 md:px-6 md:py-3 bg-primary text-white rounded-md shadow hover:bg-primary/90 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Go Back Home!
      </Link>
    </div>
  );
}
