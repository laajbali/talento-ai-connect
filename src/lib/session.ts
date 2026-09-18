import { useNavigate } from "@tanstack/react-router";
import { useStore } from "./store";

export function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "T";
  return parts.slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase();
}

export function useLogout() {
  const { reset } = useStore();
  const navigate = useNavigate();

  return () => {
    reset();
    void navigate({ to: "/", replace: true });
  };
}
