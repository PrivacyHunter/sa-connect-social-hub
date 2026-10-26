import logo from "@/assets/brand-logo.asset.json";
import mark from "@/assets/brand-mark.asset.json";

export function Brand({ compact = false }: { compact?: boolean }) {
  return <img src={compact ? mark.url : logo.url} alt="S&A Connect" className={compact ? "brand-mark" : "brand-logo"} />;
}