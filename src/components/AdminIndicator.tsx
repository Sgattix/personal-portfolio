import Link from "next/link";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { Badge } from "@/components/ui/badge";

async function AdminIndicator() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge
        asChild
        variant="secondary"
        className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] bg-transparent text-blue-400 border border-blue-400 hover:bg-neutral-700! transition-colors"
      >
        <Link href="/admin" aria-label="Open admin dashboard">
          <span className="relative flex size-2 items-center justify-center">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-blue-400/60" />
            <span className="relative inline-flex size-2 rounded-full bg-blue-400" />
          </span>
          Admin
        </Link>
      </Badge>
    </div>
  );
}

export default AdminIndicator;
