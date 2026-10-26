import { useEffect, useState } from "react";
import { BadgeCheck, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function VerificationCard() {
  const [email, setEmail] = useState<{ address: string; verified: boolean } | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await supabase.auth.getUser();
    const u = data.user;
    if (!u) return;
    setEmail({ address: u.email ?? "", verified: !!u.email_confirmed_at });
    setPhoneVerified(!!u.phone_confirmed_at);
    if (u.phone) setPhone(`+${u.phone}`);
  }
  useEffect(() => { load(); }, []);

  async function resendEmail() {
    if (!email) return;
    setBusy(true);
    const { error } = await supabase.auth.resend({ type: "signup", email: email.address, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    error ? toast.error(error.message) : toast.success("Verification email sent");
  }
  async function sendCode() {
    if (!/^\+\d{8,15}$/.test(phone)) return toast.error("Enter number with country code, e.g. +923001234567");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ phone });
    setBusy(false);
    if (error) return toast.error("Phone verification is not active yet. SMS service needs to be connected.");
    setSent(true); toast.success("Code sent by SMS");
  }
  async function verify() {
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ phone, token: code, type: "phone_change" });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Phone verified"); setSent(false); load();
  }

  if (!email) return null;
  return (
    <section className="mx-4 mt-4 space-y-3 rounded-md border border-glass-border glass p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold"><BadgeCheck className="h-4 w-4 text-primary" /> Verify your account</h2>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Mail className="h-4 w-4" /><span className="break-all">{email.address}</span>
        {email.verified ? <span className="text-primary">Verified</span> : <Button size="sm" variant="outline" disabled={busy} onClick={resendEmail}>Send verification email</Button>}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Phone className="h-4 w-4" />
        {phoneVerified ? <><span>{phone}</span><span className="text-primary">Verified</span></> : sent ? (
          <><Input className="w-32" inputMode="numeric" aria-label="SMS code" placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} /><Button size="sm" disabled={busy} onClick={verify}>Verify</Button></>
        ) : (
          <><Input className="w-52" type="tel" aria-label="Phone number" placeholder="+923001234567" value={phone} onChange={(e) => setPhone(e.target.value.trim())} /><Button size="sm" variant="outline" disabled={busy} onClick={sendCode}>Send code</Button></>
        )}
      </div>
    </section>
  );
}
