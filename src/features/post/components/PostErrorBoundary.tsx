"use client";

import type { FallbackProps } from "react-error-boundary";
import React from "react";
import { isTRPCClientError } from "@trpc/client";
import Link from "next/link";

import ReusableErrorBoundary from "~/features/shared/components/ReusableErrorBoundary";

export default function PostErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReusableErrorBoundary FallbackComponent={PostErrorMessage}>
      {children}
    </ReusableErrorBoundary>
  );
}

function PostErrorMessage({
  error,
  resetErrorBoundary,
}: FallbackProps): React.ReactElement {
  if (isTRPCClientError(error)) {
    // Since nextjs redacts the error message, we can need to throw TRPCError in the server with only code (NOT_FOUND, UNAUTHORIZED, INTERNAL_SERVER_ERROR),
    // then use the error.message to determine the error type in the fallback component
    // This is a workaround to get the error message in the fallback component
    switch (error.message) {
      case "NOT_FOUND":
        return (
          <div
            role="alert"
            className="rounded border border-red-400 bg-red-100 p-4 text-red-700"
          >
            <h2 className="font-bold">Posts Not Found</h2>
            <p>
              The posts you are looking for does not exist or you do not have
              permission to view it.
            </p>
            <div className="flex gap-2">
              <Link
                href="/"
                className="mt-2 inline-block rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Go to Home
              </Link>
              <button
                onClick={resetErrorBoundary}
                className="mt-2 inline-block rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Try again
              </button>
            </div>
          </div>
        );
      case "UNAUTHORIZED":
        return (
          <div
            role="alert"
            className="rounded border border-red-400 bg-red-100 p-4 text-red-700"
          >
            <h2 className="font-bold">Unauthorized</h2>
            <p>You do not have permission to view this post.</p>
            <Link
              href="/login"
              className="mt-2 inline-block rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Login to view
            </Link>
          </div>
        );
      case "INTERNAL_SERVER_ERROR":
        return (
          <div
            role="alert"
            className="rounded border border-red-400 bg-red-100 p-4 text-red-700"
          >
            <h2 className="font-bold">Server Error</h2>
            <p>An internal server error occurred.</p>
            <button
              onClick={resetErrorBoundary}
              className="mt-2 inline-block rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        );
      default:
        return (
          <div
            role="alert"
            className="rounded border border-red-400 bg-red-100 p-4 text-red-700"
          >
            <h2 className="font-bold">Error Loading Post</h2>
            <p>
              An unexpected error occurred while trying to load the post:
              {error.message}
            </p>
            <button
              onClick={resetErrorBoundary}
              className="mt-2 inline-block rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        );
    }
  }

  // Fallback for non-TRPC errors, initial load error and other unexpected errors
  return (
    <div
      role="alert"
      className="rounded border border-red-400 bg-red-100 p-4 text-red-700"
    >
      <h2 className="font-bold">An Unexpected Error Occurred</h2>
      <p>{error instanceof Error ? error.message : "Something went wrong."}</p>
      <Link
        href="/"
        onClick={resetErrorBoundary}
        className="mt-2 inline-block rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Try again
      </Link>
    </div>
  );
}
