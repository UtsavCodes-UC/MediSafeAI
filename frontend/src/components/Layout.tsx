import Navbar from "./Navbar";

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
    <footer className="border-t bg-card py-8">
      <div className="container text-center text-sm text-muted-foreground">
        © 2026 MediSafe AI. For informational purposes only — always consult your healthcare provider.
      </div>
    </footer>
  </div>
);

export default Layout;
