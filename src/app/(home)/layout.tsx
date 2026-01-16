export const metadata = {
  title: "vx.dev",
  description: "Vincent's 3D portfolio site 🍀",
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <main className="h-screen w-screen">{children}</main>;
}
