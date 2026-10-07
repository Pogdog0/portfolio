import AdminDashboard from "@/components/AdminDashboard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getSiteContent, isContentStoreWritable, listEnquiries } from "@/lib/content-store";

export const metadata = { title: "Admin — Pogdog Content OS" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAuthenticated = await verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  if (!isAuthenticated) redirect("/admin/login");
  const [initialContent, initialEnquiries, storageWritable] = await Promise.all([
    getSiteContent(),
    listEnquiries(),
    isContentStoreWritable(),
  ]);
  return <AdminDashboard initialContent={initialContent} initialEnquiries={initialEnquiries} storageWritable={storageWritable} />;
}
