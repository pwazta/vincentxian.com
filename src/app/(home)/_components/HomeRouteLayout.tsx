// The _components folder is used to store layout-related components that are used in multiple pages within a route.
// This is a good practice because it allows you to reuse components across different pages without having to copy and paste the same code multiple times.
// You can also define page specific layout components in the _components folder.

export default function HomeRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="h-screen w-screen">{children}</main>;
}
