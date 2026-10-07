import AdminDashboard from "@/components/AdminDashboard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getSiteContent, listEnquiries } from "@/lib/content-store";

export const metadata = { title: "Admin — Pogdog Content OS" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAuthenticated = await verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  if (!isAuthenticated) redirect("/admin/login");
  return <AdminDashboard initialContent={getSiteContent()} initialEnquiries={listEnquiries()} />;
}
