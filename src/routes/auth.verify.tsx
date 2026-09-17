import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "./auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/auth/verify")({
  head: () => ({
    meta: [
      { title: "Verify your email — Talento" },
      { name: "description", content: "Confirm your email address to activate your Talento account." },
      { property: "og:title", content: "Verify your email — Talento" },
      { property: "og:description", content: "One quick step before you start." },
    ],
  }),
  component: Verify,
});

function Verify() {
  const { state, set, hydrated } = useStore();
  const navigate = useNavigate();
  const [changing, setChanging] = useState(false);
  const [email, setEmail] = useState(state.session?.email ?? "");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (hydrated && !state.session) navigate({ to: "/auth/role" });
  }, [hydrated, state.session, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  return (
    <AuthLayout title="Check Your Email" step="Step 3 of 4">
      <div className="text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent text-accent-foreground">
          <MailCheck className="h-8 w-8" />
        </span>
        <p className="mt-4 text-sm text-muted-foreground">
          We've sent a verification link to{" "}
          <span className="font-semibold text-foreground">{state.session?.email}</span>. Click the
          link to verify your account and continue.
        </p>
      </div>

      {changing ? (
        <div className="mt-6 space-y-2">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => {
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  toast.error("Enter a valid email address.");
                  return;
                }
                if (state.session) set({ session: { ...state.session, email } });
                setChanging(false);
                toast.success("Email updated. A new link is on its way.");
              }}
            >
              Save email
            </Button>
            <Button variant="ghost" onClick={() => setChanging(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          <Button
            className="w-full"
            onClick={() => {
              if (state.session) set({ session: { ...state.session, verified: true } });
              toast.success("Email verified.");
              navigate({ to: "/auth/setup" });
            }}
          >
            I verified my email
          </Button>
          <Button
            variant="outline"
            className="w-full"
            disabled={cooldown > 0}
            onClick={() => {
              setCooldown(60);
              toast.success("Verification email resent.");
            }}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Email"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setChanging(true)}>
            Change Email
          </Button>
        </div>
      )}

      <ul className="mt-6 space-y-1 rounded-xl bg-muted p-4 text-xs text-muted-foreground">
        <li>Didn't receive the email?</li>
        <li>• Check your spam folder</li>
        <li>• Make sure the address is correct</li>
        <li>• You can resend the email after 60 seconds</li>
      </ul>
    </AuthLayout>
  );
}
