import { Sidebar } from "@/components/layout/sidebar";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-screen bg-background">
      <Sidebar />
      {children}
    </main>
  );
}
