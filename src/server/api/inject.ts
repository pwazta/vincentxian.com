/**
 * Dependency Injection Configuration
 * Central place to wire up all services with their dependencies
 * 
 * This pattern provides:
 * - Clear visibility of all service dependencies
 * - Easy testing by mocking the database
 * - Environment-specific configurations
 * - Service lifecycle management
 * 
 * Use cases:
 * - Production: Real database and services
 * - Testing: Mock database and services
 * - Development: Debug-enabled services
 */
import { db } from "../db";

/**
 * Injects services that require authentication
 * These services are available only in protected tRPC procedures
 * 
 * Example usage in tRPC router:
 * .mutation(async ({ ctx }) => {
 *   const { exampleService } = ctx;
 *   return exampleService.create(input);
 * })
 */
export function injectProtectedServices() {
  // const postService = getPostService(db);

  // return {
  //   postService,
  // };
  return {}
}

/**
 * Injects services available to public endpoints
 * Keep sensitive operations in protected services
 * 
 * Use case: Public-facing APIs that don't require auth
 */
export function injectPublicServices() {
  return {};
}
