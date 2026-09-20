import { Logo } from "@/components/brand";
import { useI18n } from "@/lib/i18n";

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
  const { t } = useI18n();
  return (
    <div className="brand-gradient min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <div className="flex items-center justify-between">
          <div>
            <Logo />
          </div>
          {step && <span className="text-xs font-semibold text-muted-foreground">{t(step)}</span>}
        </div>
        <div className="surface mt-6 p-6">
          <h1 className="text-2xl font-bold">{t(title)}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{t(subtitle)}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
