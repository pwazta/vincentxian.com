import { Suspense } from "react";
import Link from "next/link";

import { LoadingSpinner } from "~/features/shared/components/LoadingSpinner";

import { HomePageContent } from "./_components/HomePageContent";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-gray-400">
          The best way to start a full-stack, typesafe Next.js app
        </p>
      </div>

      {/* Documentation Links */}
      <div className="mx-auto mb-16 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
        <Link
          className="group flex flex-col gap-4 rounded-xl bg-white/10 p-6 transition-all duration-200 hover:scale-105 hover:bg-white/20"
          href="https://create.t3.gg/en/usage/first-steps"
          target="_blank"
        >
          <h3 className="text-2xl font-bold transition-colors group-hover:text-[hsl(280,100%,70%)]">
            First Steps →
          </h3>
          <div className="text-lg text-gray-300">
            Just the basics - Everything you need to know to set up your
            database and authentication.
          </div>
        </Link>
        <Link
          className="group flex flex-col gap-4 rounded-xl bg-white/10 p-6 transition-all duration-200 hover:scale-105 hover:bg-white/20"
          href="https://create.t3.gg/en/introduction"
          target="_blank"
        >
          <h3 className="text-2xl font-bold transition-colors group-hover:text-[hsl(280,100%,70%)]">
            Documentation →
          </h3>
          <div className="text-lg text-gray-300">
            Learn more about Create T3 App, the libraries it uses, and how to
            deploy it.
          </div>
        </Link>
      </div>
      {/* Using Suspense here as HomePageContent is the boundary of static and dynamic content, everything within it is dynamic, you'll see the magic of PPR here */}
      <Suspense fallback={<LoadingSpinner />}>
        <HomePageContent />
      </Suspense>
    </div>
  );
}
