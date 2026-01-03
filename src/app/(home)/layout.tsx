// The layout.tsx file is used to define the layout for the home route.

import HomeRouteLayout from "./_components/HomeRouteLayout";

export const metadata = {
  title: "Home",
  description: "Home",
};

export default function HomeLayout({children}: {children: React.ReactNode}) {
  return <HomeRouteLayout>{children}</HomeRouteLayout>;
}
