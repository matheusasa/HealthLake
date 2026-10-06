"use client";

import { useState, useMemo } from "react";
import type { IamData, IamUser, IamGroup, IamRole, ServiceKey, DataLayer, PermissionLevel } from "@/lib/iam-service";

type TabKey = "usuarios" | "grupos" | "roles" | "chaves";

const TAB_LABELS: Record<TabKey, string> = {
  usuarios: "Usuários",
  grupos: "Grupos",
  roles: "Roles",
  chaves: "Chaves de Serviço",
};

const LAYER_COLORS: Record<DataLayer, string> = {
  raw: "bg-blue-100 text-blue-800 border-blue-200",
  staging: "bg-purple-100 text-purple-800 border-purple-200",
  curated: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const PERMISSION_COLORS: Record<PermissionLevel, string> = {
  admin: "bg-rose-100 text-rose-800 border-rose-200",
  write: "bg-amber-100 text-amber-800 border-amber-200",
  read: "bg-sky-100 text-sky-800 border-sky-200",
  none: "bg-slate-100 text-slate-500 border-slate-200",
};

const PERMISSION_LABELS: Record<PermissionLevel, string> = {
  admin: "Admin",
  write: "Escrita",
  read: "Leitura",
  none: "Nenhum",
};

const KEY_STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rotated: "bg-amber-100 text-amber-800 border-amber-200",
  revoked: "bg-rose-100 text-rose-800 border-rose-200",
};

const KEY_STATUS_LABELS: Record<string, string> = {
  active: "Ativa",
  rotated: "Rotacionada",
  revoked: "Revogada",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function daysSince(iso: string): number {
  const now = new Date();
  const created = new Date(iso);
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
}

export function IamContent({ data }: { data: IamData }) {
  const [activeTab, setActiveTab] = useState<TabKey>("usuarios");
  const [userSearch, setUserSearch] = useState("");

  const filteredUsers = useMemo(() => {
    if (!userSearch) return data.users;
    const q = userSearch.toLowerCase();
    return data.users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.groups.some((g) => g.toLowerCase().includes(q)) ||
        u.roles.some((r) => r.toLowerCase().includes(q))
    );
  }, [data.users, userSearch]);

  // Build permission matrix: group -> layer -> highest permission level
  const permissionMatrix = useMemo(() => {
    const layers: DataLayer[] = ["raw", "staging", "curated"];
    const matrix: Record<string, Record<DataLayer, PermissionLevel>> = {};
    for (const group of data.groups) {
      matrix[group.id] = { raw: "none", staging: "none", curated: "none" };
      for (const perm of group.permissions) {
        const current = matrix[group.id][perm.layer];
        const rank: Record<PermissionLevel, number> = { none: 0, read: 1, write: 2, admin: 3 };
        if (rank[perm.level] > rank[current]) {
          matrix[group.id][perm.layer] = perm.level;
        }
      }
    }
    return { layers, matrix };
  }, [data.groups]);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-3 border-b border-slate-100 flex gap-1 overflow-x-auto">
          {(Object.keys(TAB_LABELS) as TabKey[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "bg-teal-50 text-teal-700 border border-teal-200"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* USUÁRIOS TAB */}
          {activeTab === "usuarios" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {filteredUsers.length} de {data.users.length} usuários
                </p>
                <input
                  type="text"
                  placeholder="Buscar por nome, email, grupo ou role..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-72"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUsers.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
              {filteredUsers.length === 0 && (
                <p className="text-center text-slate-400 text-sm py-8">
                  Nenhum usuário encontrado para a busca aplicada.
                </p>
              )}
            </div>
          )}

          {/* GRUPOS TAB */}
          {activeTab === "grupos" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.groups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          )}

          {/* ROLES TAB */}
          {activeTab === "roles" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 pr-4 font-semibold text-slate-600">Role</th>
                    <th className="pb-3 pr-4 font-semibold text-slate-600">Descrição</th>
                    <th className="pb-3 pr-4 font-semibold text-slate-600">Trust Policy</th>
                    <th className="pb-3 pr-4 font-semibold text-slate-600">Permissões</th>
                    <th className="pb-3 font-semibold text-slate-600">Sessão Máx.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.roles.map((role) => (
                    <tr key={role.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-slate-900">{role.name}</td>
                      <td className="py-3 pr-4 text-slate-600">{role.description}</td>
                      <td className="py-3 pr-4">
                        <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">
                          {role.trustPolicy.split("/").pop()}
                        </code>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {role.permissions.length} permissões
                        </span>
                      </td>
                      <td className="py-3 text-slate-600">
                        {role.maxSessionDuration >= 3600
                          ? `${role.maxSessionDuration / 3600}h`
                          : `${role.maxSessionDuration / 60}min`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CHAVES DE SERVIÇO TAB */}
          {activeTab === "chaves" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 pr-4 font-semibold text-slate-600">Nome</th>
                    <th className="pb-3 pr-4 font-semibold text-slate-600">Proprietário</th>
                    <th className="pb-3 pr-4 font-semibold text-slate-600">Criada em</th>
                    <th className="pb-3 pr-4 font-semibold text-slate-600">Último Uso</th>
                    <th className="pb-3 pr-4 font-semibold text-slate-600">Idade</th>
                    <th className="pb-3 font-semibold text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.serviceKeys.map((key) => {
                    const ageDays = daysSince(key.created);
                    const isStale = ageDays > 90 && key.status === "active";
                    const owner = data.users.find((u) => u.id === key.ownerId);
                    return (
                      <tr key={key.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 pr-4 font-semibold text-slate-900">{key.name}</td>
                        <td className="py-3 pr-4 text-slate-600">{owner?.name || key.ownerId}</td>
                        <td className="py-3 pr-4 text-slate-600">{formatDate(key.created)}</td>
                        <td className="py-3 pr-4 text-slate-600">{formatDate(key.lastUsed)}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                              isStale
                                ? "bg-rose-100 text-rose-800 border-rose-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {ageDays} dias{isStale && " ⚠"}
                          </span>
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${KEY_STATUS_COLORS[key.status]}`}
                          >
                            {KEY_STATUS_LABELS[key.status]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Matriz de Permissões */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Matriz de Permissões</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Visão consolidada do nível de acesso de cada grupo por camada de dados
          </p>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 pr-4 font-semibold text-slate-600">Grupo</th>
                {permissionMatrix.layers.map((layer) => (
                  <th key={layer} className="pb-3 pr-4 font-semibold text-slate-600 capitalize">
                    {layer}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.groups.map((group) => (
                <tr key={group.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-4 font-semibold text-slate-900">{group.name}</td>
                  {permissionMatrix.layers.map((layer) => {
                    const level = permissionMatrix.matrix[group.id][layer];
                    return (
                      <td key={layer} className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${PERMISSION_COLORS[level]}`}
                        >
                          {PERMISSION_LABELS[level]}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function UserCard({ user }: { user: IamUser }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 hover:border-teal-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900 truncate">{user.name}</h3>
            {user.mfaEnabled ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-medium border border-emerald-200">
                MFA
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-medium border border-rose-200">
                Sem MFA
              </span>
            )}
            {user.status !== "active" && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-medium border border-slate-300 capitalize">
                {user.status}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">{user.email}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] text-slate-400 font-medium">Último login</p>
          <p className="text-xs text-slate-600 mt-0.5 whitespace-nowrap">{formatDate(user.lastLogin)}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Grupos:</span>
          {user.groups.map((g) => (
            <span
              key={g}
              className="inline-flex items-center px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 text-[10px] font-medium border border-teal-200"
            >
              {g}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Roles:</span>
          {user.roles.map((r) => (
            <span
              key={r}
              className="inline-flex items-center px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-medium border border-sky-200"
            >
              {r}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function GroupCard({ group }: { group: IamGroup }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 hover:border-teal-300 transition-colors shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">{group.name}</h3>
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
          {group.memberCount} membros
        </span>
      </div>
      <p className="text-xs text-slate-500 mt-2">{group.description}</p>
      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Camadas:</span>
        {group.dataLayers.map((layer) => (
          <span
            key={layer}
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border capitalize ${LAYER_COLORS[layer]}`}
          >
            {layer}
          </span>
        ))}
      </div>
      <div className="mt-2 text-xs text-slate-400">
        {group.permissions.length} permissões configuradas
      </div>
    </div>
  );
}