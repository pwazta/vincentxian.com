import {
  defaultShouldDehydrateQuery,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import SuperJSON from "superjson";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 30 * 1000,
        // Set to retry on error once so we always get TRPCClientError on the client
        retry: 1,
        // Throw on error if the query has no data, so we can see the error in the UI immediately
        throwOnError: (error, query) => {
          return typeof query.state.data === "undefined";
        },
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
        shouldRedactErrors: () => {
          // We should not catch Next.js server errors
          // as that's how Next.js detects dynamic pages
          // so we cannot redact them.
          // Next.js also automatically redacts errors for us
          // with better digests.
          return false;
        },
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
    queryCache: new QueryCache({
      // If we already have data in cache and query errors, show the toast error
      onError: (error, query) => {
        if (typeof query.state.data !== "undefined") {
          toast.error(error.message);
        }
      },
    }),
  });
