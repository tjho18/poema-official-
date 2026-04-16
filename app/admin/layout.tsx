// Minimal layout for the admin section.
// Auth protection is handled by middleware.ts — no auth logic needed here.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}
