import logo from "@/assets/brand-logo.png";
import mark from "@/assets/brand-mark.png";

export function Brand({ compact = false }: { compact?: boolean }) {
  return <img src={compact ? mark : logo} alt="S&A Connect" className={compact ? "brand-mark" : "brand-logo"} />;
}
