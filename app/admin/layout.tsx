import dynamic from "next/dynamic";
import "./admin.css";
import AdminSidebar from "./components/Sidebar/Sidebar";

const AdminNavbar = dynamic(
  () => import("./components/AdminNavbar/AdminNavbar"),
  { ssr: false }
);

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="container-fluid admin-panel">
        <div className="row">
          <AdminSidebar />
          <div className="col-10 col-sm-8 col-md-9 col-xl-10">
            <AdminNavbar />
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
