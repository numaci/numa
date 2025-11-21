import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="pt-20 md:pt-36 pb-20">{children}</div>
      <MobileBottomNav />
    </>
  );
}
