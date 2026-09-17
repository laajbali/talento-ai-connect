import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand";

export function AuthLayout({
  title,
  subtitle,
  children,
  step,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  step?: string;
}) {
  return (
    <div className="brand-gradient min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <div className="flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          {step && <span className="text-xs font-semibold text-muted-foreground">{step}</span>}
        </div>
        <div className="surface mt-6 p-6">
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
