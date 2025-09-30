// Admin Layout - Code split from main application
// All admin-specific code is lazy loaded to reduce bundle size for guests

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

// Hint to Next.js that this route group should be code-split
export const dynamic = 'force-dynamic'
