import { ProtectedRoute } from "@/components/auth/protected-route"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
