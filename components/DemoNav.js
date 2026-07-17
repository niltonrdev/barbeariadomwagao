"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useBarbearia } from "@/lib/store";

const AREAS = [
  { href: "/", label: "Cliente", icone: "📱" },
  { href: "/barbeiro", label: "Barbeiro", icone: "💈" },
  { href: "/admin", label: "Dono", icone: "📊" },
];

export default function DemoNav() {
  const pathname = usePathname();
  const { resetarDemo, setSessao } = useBarbearia();
  const [aberto, setAberto] = useState(false);

  const ativo = (href) =>
    href === "/" ? pathname === "/" || pathname.startsWith("/cliente") || pathname.startsWith("/cadastro") : pathname.startsWith(href);

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 print:hidden">
      {aberto && (
        <div className="mb-2 flex flex-col items-stretch gap-2 rounded-2xl border border-grafite-borda bg-grafite-claro/95 p-2 backdrop-blur shadow-2xl">
          <p className="px-2 pt-1 text-[10px] uppercase tracking-widest text-nevoa">
            Modo demonstração
          </p>
          <div className="flex gap-1">
            {AREAS.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                onClick={() => {
                  if (a.href === "/barbeiro" || a.href === "/admin") {
                    // ao entrar nas telas internas, encerra sessão de cliente da aba
                  }
                }}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs transition ${
                  ativo(a.href)
                    ? "bg-ouro text-[#1a1400] font-semibold"
                    : "text-creme hover:bg-carvao"
                }`}
              >
                <span className="text-base">{a.icone}</span>
                {a.label}
              </Link>
            ))}
          </div>
          <button
            onClick={() => {
              if (confirm("Reiniciar a demonstração com os dados de exemplo?")) {
                resetarDemo();
              }
            }}
            className="rounded-xl border border-grafite-borda px-3 py-2 text-xs text-nevoa hover:border-red-500/50 hover:text-red-400"
          >
            ↺ Reiniciar demonstração
          </button>
        </div>
      )}
      <button
        onClick={() => setAberto((v) => !v)}
        className="mx-auto flex items-center gap-2 rounded-full border border-ouro/40 bg-grafite-claro/95 px-4 py-2 text-xs font-semibold text-ouro-claro shadow-2xl backdrop-blur"
      >
        {aberto ? "Fechar" : "Trocar de tela"}
        <span className="text-[10px] text-nevoa">(demo)</span>
      </button>
    </div>
  );
}
