# T3 Stack with Type-Safe Architecture Pattern

This is an opinionated [T3 Stack](https://create.t3.gg/) template that implements a robust, type-safe architecture pattern designed for scalability and maintainability.

## Architecture Overview

This template implements a clean architecture pattern with clear separation of concerns, combining the power of T3 Stack with enterprise-grade architectural patterns.

### Key Architectural Decisions

#### 1. Types as Single Source of Truth (`src/types/`)
All domain types are defined using Zod schemas in the `types` folder. These types serve as the single source of truth across the entire application, ensuring type safety from database to frontend.

**Benefits:**
- **Type Safety**: Zod schemas provide runtime validation and TypeScript type inference
- **Consistency**: One definition used everywhere prevents type drift
- **Documentation**: Schema definitions serve as living documentation
- **Validation**: Built-in validation for API inputs and outputs

#### 2. Database Abstraction Layer (`src/mappings/`)
The mappings folder contains transformation functions that convert Prisma types to our domain types. This creates a clean boundary between the database layer and application logic.

**Benefits:**
- **Flexibility**: Change database schema without affecting business logic
- **Type Safety**: Compile-time guarantees that all fields are properly mapped
- **Testability**: Easy to unit test mapping logic
- **Evolution**: Database and domain models can evolve independently

#### 3. Feature-Based Frontend Structure (`src/features/`)
Frontend code is organized by feature rather than technical layers. Each feature folder contains its own components, hooks, and utilities.

```
features/
├── post/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── shared/
    ├── components/
    └── hooks/
```

**Benefits:**
- **Modularity**: Features can be developed, tested, and deployed independently
- **Discoverability**: Easy to find all code related to a specific feature
- **Scalability**: New features don't bloat existing folders
- **Team Collaboration**: Different teams can work on different features without conflicts

#### 4. Route Layout Components (`src/app/(route)/_components/`)
The `_components` folders within app routes are specifically for layout and page orchestration components. These components handle:
- Page structure and layout
- Data fetching coordination
- Loading states management
- Error boundaries setup

**Key Pattern**: Business logic components live in `features/`, while route `_components/` focus on composition and orchestration.

#### 5. SSR Streaming Pattern with Suspense
The template includes a custom `Await` component that implements React's streaming SSR pattern:
- **Server-side prefetching**: Data is fetched on the server
- **Progressive enhancement**: UI streams to the client as data becomes available
- **Built-in error handling**: Each suspended component has its own error boundary
- **Type-safe data fetching**: Full TypeScript support with tRPC

**Benefits:**
- **Improved performance**: Users see content faster with streaming
- **Better UX**: Loading states are granular and contextual
- **SEO friendly**: Content is server-rendered
- **Resilient**: Errors in one component don't break the entire page

#### 6. Dependency Injection Pattern (Backend Services)
Backend services use dependency injection for better testability and flexibility. Services are injected with their dependencies (like database clients) rather than importing them directly.

**Benefits:**
- **Testability**: Easy to mock dependencies for unit testing
- **Flexibility**: Swap implementations without changing business logic
- **Decoupling**: Services don't depend on concrete implementations
- **Configuration**: Different environments can use different implementations

### Architecture Benefits Summary

1. **Type Safety Throughout**: From database queries to API responses to frontend components, everything is fully typed
2. **Maintainability**: Clear separation of concerns makes the codebase easy to understand and modify
3. **Scalability**: Feature-based organization and dependency injection support growing codebases
4. **Developer Experience**: IntelliSense, auto-completion, and compile-time error checking everywhere
5. **Testing**: Architecture supports unit, integration, and end-to-end testing strategies
6. **Refactoring Safety**: Strong typing and clear boundaries make large-scale refactoring safer

## Tech Stack

Built on the powerful T3 Stack:
- [Next.js](https://nextjs.org) - Full-stack React framework
- [NextAuth.js](https://next-auth.js.org) - Authentication
- [Prisma](https://prisma.io) - Database ORM
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [tRPC](https://trpc.io) - End-to-end type-safe APIs
- [Zod](https://zod.dev) - Schema validation

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your database:
   ```bash
   npx prisma db push
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── types/          # Domain type definitions (single source of truth)
├── mappings/       # Database-to-domain type converters
├── services/       # Backend business logic with dependency injection
├── features/       # Frontend features (components, hooks, utils)
├── server/         # tRPC routers and API configuration
└── app/            # Next.js app directory
```

## Acknowledgments

This project incorporates grass rendering code from "How to Make The Fluffiest Grass With Three.js" by Ebenezer, available under the MIT License. The original article can be found at: https://tympanus.net/codrops/2025/02/04/how-to-make-the-fluffiest-grass-with-three-js/

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## Deployment

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
