import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/hr")({
  component: HrLayout,
});

function HrLayout() {
  const { state, hydrated } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hydrated) return;
    if (!state.session) navigate({ to: "/auth" });
    else if (state.session.role !== "employer") navigate({ to: "/app" });
  }, [hydrated, state.session, navigate]);

  if (!hydrated || !state.session || state.session.role !== "employer") {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading your workspace…
      </div>
    );
  }

  return <Outlet />;
}
