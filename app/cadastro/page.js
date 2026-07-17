"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import { useBarbearia } from "@/lib/store";
import { formatarTelefone, soDigitos } from "@/lib/format";

const FREQUENCIAS = [
  { valor: 7, titulo: "Toda semana", sub: "Corte de 7 em 7 dias" },
  { valor: 15, titulo: "A cada 15 dias", sub: "Quinzenalmente" },
  { valor: 30, titulo: "1x por mês", sub: "Mensalmente" },
];

function FormularioCadastro() {
  const router = useRouter();
  const params = useSearchParams();
  const { cadastrar, setSessao, login, estado } = useBarbearia();

  const telInicial = params.get("tel") || "";
  const [form, setForm] = useState({
    nome: "",
    telefone: formatarTelefone(telInicial),
    email: "",
    nascimento: "",
    frequenciaDias: 15,
    barbeiroPreferido: "",
  });
  const [aceite, setAceite] = useState(false);
  const [erro, setErro] = useState("");

  const set = (campo) => (e) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }));

  function enviar(e) {
    e.preventDefault();
    setErro("");
    if (!form.nome.trim()) return setErro("Informe seu nome.");
    if (soDigitos(form.telefone).length < 10)
      return setErro("Telefone inválido.");
    if (!aceite) return setErro("É preciso aceitar os termos para continuar.");

    const existente = login(form.telefone);
    if (existente) {
      setSessao(existente.id);
      router.push("/cliente");
      return;
    }

    const novo = cadastrar(form);
    setSessao(novo.id);
    router.push("/cliente");
  }

  return (
    <main className="flex-1 px-5 py-8">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo tamanho={80} />
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold">
            Cadastro rápido
          </h1>
          <p className="text-sm text-nevoa">Leva menos de 30 segundos.</p>
        </div>

        <form onSubmit={enviar} className="card p-6 space-y-4">
          <Campo label="Nome completo">
            <input className="input" placeholder="Seu nome" value={form.nome} onChange={set("nome")} autoFocus />
          </Campo>

          <Campo label="Telefone (com DDD)">
            <input
              className="input"
              inputMode="numeric"
              placeholder="(11) 98765-4321"
              value={form.telefone}
              onChange={(e) => setForm((f) => ({ ...f, telefone: formatarTelefone(e.target.value) }))}
            />
          </Campo>

          <Campo label="E-mail (opcional)">
            <input className="input" type="email" placeholder="voce@email.com" value={form.email} onChange={set("email")} />
          </Campo>

          <Campo label="Data de nascimento">
            <input className="input" type="date" value={form.nascimento} onChange={set("nascimento")} />
          </Campo>

          <div>
            <label className="mb-2 block text-sm font-medium">Com que frequência você corta o cabelo?</label>
            <div className="grid grid-cols-1 gap-2">
              {FREQUENCIAS.map((fq) => (
                <button
                  type="button"
                  key={fq.valor}
                  onClick={() => setForm((f) => ({ ...f, frequenciaDias: fq.valor }))}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                    form.frequenciaDias === fq.valor
                      ? "border-ouro bg-ouro/10"
                      : "border-grafite-borda hover:border-ouro/40"
                  }`}
                >
                  <span>
                    <span className="block font-semibold">{fq.titulo}</span>
                    <span className="block text-xs text-nevoa">{fq.sub}</span>
                  </span>
                  <span className={`h-4 w-4 rounded-full border ${form.frequenciaDias === fq.valor ? "border-ouro bg-ouro" : "border-grafite-borda"}`} />
                </button>
              ))}
            </div>
          </div>

          <Campo label="Barbeiro preferido (opcional)">
            <select className="input" value={form.barbeiroPreferido} onChange={set("barbeiroPreferido")}>
              <option value="">Sem preferência</option>
              {estado.barbeiros.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nome} {b.papel === "dono" ? "(Dono)" : ""}
                </option>
              ))}
            </select>
          </Campo>

          <label className="flex items-start gap-3 rounded-xl border border-grafite-borda p-3 text-sm">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#d4af37]" checked={aceite} onChange={(e) => setAceite(e.target.checked)} />
            <span className="text-nevoa">
              Autorizo o uso dos meus dados para atendimento, fila e comunicações da barbearia, conforme a{" "}
              <span className="text-ouro-claro">Política de Privacidade (LGPD)</span>.
            </span>
          </label>

          {erro && <p className="text-sm text-red-400">{erro}</p>}

          <button type="submit" className="btn btn-ouro w-full text-base">
            Finalizar cadastro
          </button>
          <Link href="/" className="block text-center text-xs text-nevoa hover:text-ouro-claro">
            Já tenho cadastro
          </Link>
        </form>
      </div>
    </main>
  );
}

function Campo({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

export default function PaginaCadastro() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-nevoa">Carregando...</div>}>
      <FormularioCadastro />
    </Suspense>
  );
}
