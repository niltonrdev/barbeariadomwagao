"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { useBarbearia } from "@/lib/store";
import { formatarTelefone, soDigitos } from "@/lib/format";

export default function EntradaCliente() {
  const router = useRouter();
  const { login, setSessao } = useBarbearia();
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState("");

  const digitos = soDigitos(telefone);
  const valido = digitos.length >= 10;

  function continuar(e) {
    e.preventDefault();
    setErro("");
    if (!valido) {
      setErro("Digite um telefone válido com DDD.");
      return;
    }
    const cliente = login(digitos);
    if (cliente) {
      setSessao(cliente.id);
      router.push("/cliente");
    } else {
      router.push(`/cadastro?tel=${digitos}`);
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo tamanho={128} />
          <span className="chip mt-5 border-ouro/30 text-ouro-claro">
            ✓ Você escaneou o QR Code da barbearia
          </span>
        </div>

        <div className="card card-ouro p-6">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            Bem-vindo à <span className="texto-ouro">Dom Wagão</span>
          </h1>
          <p className="mt-1 text-sm text-nevoa">
            Entre na fila em tempo real. Informe seu telefone para começar.
          </p>

          <form onSubmit={continuar} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-creme">
                Seu telefone (com DDD)
              </label>
              <input
                className="input text-lg"
                inputMode="numeric"
                placeholder="(11) 98765-4321"
                value={telefone}
                onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                autoFocus
              />
              {erro && <p className="mt-1.5 text-sm text-red-400">{erro}</p>}
            </div>

            <button type="submit" className="btn btn-ouro w-full text-base" disabled={!valido}>
              Continuar
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-nevoa">
            Primeira vez? Faremos um cadastro rápido em seguida.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { t: "Fila", d: "em tempo real" },
            { t: "Fidelidade", d: "corte grátis" },
            { t: "Planos", d: "PIX e cartão" },
          ].map((f) => (
            <div key={f.t} className="card p-3">
              <p className="text-sm font-semibold text-ouro-claro">{f.t}</p>
              <p className="text-xs text-nevoa">{f.d}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-nevoa">
          Dica: no rodapé há um menu para alternar entre as telas de Cliente,
          Barbeiro e Dono durante a demonstração.
        </p>
      </div>
    </main>
  );
}
