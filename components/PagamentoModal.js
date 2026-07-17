"use client";

import { useState } from "react";
import QrFake from "./QrFake";
import { moeda } from "@/lib/format";

export default function PagamentoModal({
  valor,
  descricao,
  cartaoSalvo,
  onConfirmado,
  onFechar,
}) {
  const [aba, setAba] = useState("pix");
  const [processando, setProcessando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [novoCartao, setNovoCartao] = useState({ numero: "", validade: "", cvv: "", nome: "" });

  const codigoPix =
    "00020126580014BR.GOV.BCB.PIX0136dom-wagao-barbearia-demo52040000530398654" +
    String(Math.round(valor * 100)).padStart(6, "0") +
    "5802BR5920DOM WAGAO BARBEARIA6009SAO PAULO62070503***6304DEMO";

  function confirmar(metodo) {
    setProcessando(true);
    setTimeout(() => {
      setProcessando(false);
      onConfirmado?.(metodo);
    }, 1100);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="card card-ouro w-full max-w-md p-5 sm:rounded-2xl rounded-b-none">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold">Pagamento</h3>
            <p className="text-sm text-nevoa">{descricao}</p>
          </div>
          <button onClick={onFechar} className="text-nevoa hover:text-creme" aria-label="Fechar">✕</button>
        </div>

        <div className="mb-4 rounded-xl border border-ouro/30 bg-ouro/5 p-3 text-center">
          <p className="text-xs text-nevoa">Valor a pagar</p>
          <p className="text-2xl font-bold texto-ouro">{moeda(valor)}</p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-carvao p-1">
          {[
            { id: "pix", label: "PIX" },
            { id: "cartao", label: "Cartão" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setAba(t.id)}
              className={`rounded-lg py-2 text-sm font-semibold transition ${
                aba === t.id ? "bg-ouro text-[#1a1400]" : "text-nevoa hover:text-creme"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {aba === "pix" ? (
          <div className="flex flex-col items-center">
            <QrFake semente={codigoPix} />
            <p className="mt-3 text-center text-xs text-nevoa">
              Escaneie com o app do banco ou use o código copia e cola.
            </p>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(codigoPix).catch(() => {});
                setCopiado(true);
                setTimeout(() => setCopiado(false), 1500);
              }}
              className="btn btn-contorno mt-3 w-full text-sm"
            >
              {copiado ? "✓ Código copiado" : "Copiar código PIX"}
            </button>
            <button
              onClick={() => confirmar("pix")}
              disabled={processando}
              className="btn btn-ouro mt-2 w-full"
            >
              {processando ? "Confirmando..." : "Já paguei (simular)"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {cartaoSalvo ? (
              <div className="rounded-xl border border-grafite-borda p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-nevoa">Cartão salvo</span>
                  <span className="chip">🔒 Tokenizado</span>
                </div>
                <p className="mt-2 font-mono text-lg">
                  {cartaoSalvo.bandeira} •••• {cartaoSalvo.final}
                </p>
                <button
                  onClick={() => confirmar("cartao")}
                  disabled={processando}
                  className="btn btn-ouro mt-3 w-full"
                >
                  {processando ? "Processando..." : "Pagar com este cartão"}
                </button>
              </div>
            ) : (
              <>
                <input className="input" placeholder="Nome no cartão" value={novoCartao.nome}
                  onChange={(e) => setNovoCartao((c) => ({ ...c, nome: e.target.value }))} />
                <input className="input" inputMode="numeric" placeholder="Número do cartão" value={novoCartao.numero}
                  onChange={(e) => setNovoCartao((c) => ({ ...c, numero: e.target.value.replace(/[^\d ]/g, "").slice(0, 19) }))} />
                <div className="grid grid-cols-2 gap-3">
                  <input className="input" placeholder="Validade (MM/AA)" value={novoCartao.validade}
                    onChange={(e) => setNovoCartao((c) => ({ ...c, validade: e.target.value.slice(0, 5) }))} />
                  <input className="input" inputMode="numeric" placeholder="CVV" value={novoCartao.cvv}
                    onChange={(e) => setNovoCartao((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))} />
                </div>
                <button
                  onClick={() => confirmar("cartao")}
                  disabled={processando || novoCartao.numero.replace(/\D/g, "").length < 12}
                  className="btn btn-ouro w-full"
                >
                  {processando ? "Processando..." : "Pagar"}
                </button>
              </>
            )}
            <p className="text-center text-[11px] text-nevoa">
              🔒 Simulação. Em produção, os dados do cartão vão direto para o
              gateway (tokenização) — nunca ficam no nosso servidor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
