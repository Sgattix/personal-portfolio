import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel | Alessandro Sgattoni",
  description:
    "Manage your portfolio projects and settings in the admin panel.",
};

function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export default AdminLayout;
