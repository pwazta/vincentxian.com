/**
 * Home Page - 3D Portfolio Entry Point
 * Used in: Next.js routing
 */
import { Suspense } from "react";
import { LoadingSpinner } from "~/features/shared/components/LoadingSpinner";

export default function Home() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-gray-400">
          3D Portfolio Scene - Coming Soon
        </p>
      </div>
    </Suspense>
  );
}
