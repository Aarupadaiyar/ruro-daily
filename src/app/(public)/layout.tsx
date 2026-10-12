import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MarketStrip } from "@/components/layout/MarketStrip";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <MarketStrip />
      {children}
      <Footer />
    </>
  );
}
