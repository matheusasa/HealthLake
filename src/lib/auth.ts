import { betterAuth } from "better-auth";

export const auth = betterAuth({
  appName: "HealthLake",
  secret: process.env.BETTER_AUTH_SECRET || "healthlake-dev-secret-change-in-prod",
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    // Adicionar providers conforme necessário (Google, GitHub, etc.)
  },
  database: {
    // Por padrão usa SQLite em memória para demo;
    // em produção, configurar PostgreSQL/MySQL via DATABASE_URL
    provider: "sqlite",
    url: ":memory:",
  },
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;