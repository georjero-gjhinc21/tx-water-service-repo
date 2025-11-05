import Link from "next/link";

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="text-lg font-semibold text-zinc-900">
                Water Service Admin
              </Link>
              <nav className="flex gap-4 text-sm">
                <Link href="/admin" className="text-zinc-600 hover:text-zinc-900">
                  Dashboard
                </Link>
                <Link href="/" className="text-zinc-600 hover:text-zinc-900">
                  Public Form
                </Link>
              </nav>
            </div>
            <form action="/admin/logout" method="POST">
              <button className="text-sm text-zinc-600 hover:text-zinc-900">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
