import SessionProvider from "@/components/SessionProvider";

export default function AdminLayout({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
