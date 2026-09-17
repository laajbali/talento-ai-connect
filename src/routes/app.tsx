import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/app")({
  component: SeekerLayout,
});

function SeekerLayout() {
  const { state, hydrated } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hydrated) return;
    if (!state.session) navigate({ to: "/auth" });
    else if (state.session.role !== "seeker") navigate({ to: "/hr" });
  }, [hydrated, state.session, navigate]);

  if (!hydrated || !state.session || state.session.role !== "seeker") {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading your workspace…
      </div>
    );
  }

  return <Outlet />;
}
