import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  href: string;
  linkLabel?: string;
}

export function SectionHeader({ title, subtitle, href, linkLabel = "Ver todos →" }: SectionHeaderProps) {
  return (
    <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      <Link href={href} className="text-xs font-medium text-teal-600 hover:text-teal-700">
        {linkLabel}
      </Link>
    </div>
  );
}