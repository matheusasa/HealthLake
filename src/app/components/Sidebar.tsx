"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  CheckCircle,
  Database,
  FlaskConical,
  DollarSign,
  Zap,
  Bell,
  Server,
  Shield,
  FileText,
  Users,
  BarChart3,
  TrendingUp,
  Activity,
  Menu,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/freshness", label: "Atualização de Dados", icon: Clock },
  { href: "/quality", label: "Qualidade de Dados", icon: CheckCircle },
  { href: "/storage", label: "Armazenamento", icon: Database },
  { href: "/jobs", label: "Jobs ETL (Glue)", icon: FlaskConical },
  { href: "/finops", label: "FinOps & Custos", icon: DollarSign },
  { href: "/lineage", label: "Linhagem de Dados", icon: Zap },
  { href: "/alerts", label: "Alertas", icon: Bell },
  { href: "/environments", label: "Ambientes", icon: Server },
  { href: "/governance", label: "Governança", icon: Shield },
  { href: "/audit", label: "Auditoria", icon: FileText },
  { href: "/iam", label: "IAM & Acessos", icon: Users },
  { href: "/user-cost", label: "Custos por Usuário", icon: BarChart3 },
  { href: "/athena", label: "Análise Athena", icon: TrendingUp },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed top-4 left-4 z-30 lg:hidden rounded-lg bg-slate-900 p-2 text-white shadow-md"
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
      >
        {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
      </button>

      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 transform bg-slate-900 text-white flex flex-col z-20 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo / Brand */}
        <div className="px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Activity className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">HealthLake</h1>
              <p className="text-[11px] text-slate-400 font-medium">Portal de Saúde do Datalake</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav role="navigation" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Navegação
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-teal-500/15 text-teal-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <span className={isActive ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300"}>
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="px-4 py-4 border-t border-slate-800">
          <div className="rounded-lg bg-slate-800/50 p-3">
            <p className="text-[11px] text-slate-400 font-medium mb-1">Status do Sistema</p>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-emerald-400 font-medium">Operacional</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}