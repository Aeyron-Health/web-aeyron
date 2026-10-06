export type PublicRoute = "/privacy" | "/terms" | "/support" | "/delete";

export const publicRoutes: ReadonlyArray<{
  path: PublicRoute;
  label: string;
}> = [
  { path: "/privacy", label: "Privacy" },
  { path: "/terms", label: "Terms" },
  { path: "/support", label: "Support" },
  { path: "/delete", label: "Delete account" },
];

export function currentPublicRoute(pathname: string): PublicRoute | null {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return publicRoutes.some(route => route.path === normalized)
    ? (normalized as PublicRoute)
    : null;
}
