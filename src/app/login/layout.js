import SessionProvider from "@/components/SessionProvider";

export default function LoginLayout({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
