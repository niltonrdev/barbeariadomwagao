"use client";

import { useEffect, useMemo, useState } from "react";
import Logo from "@/components/Logo";
import TelaCarregando from "@/components/TelaCarregando";
import { useBarbearia } from "@/lib/store";
import {
  moeda,
  tempoRelativo,
  horaBR,
  mesmoDia,
  labelFrequencia,
  META_FIDELIDADE,
} from "@/lib/format";

const CHAVE_BARBEIRO = "domwagao_barbeiro_v1";

export default function TelaBarbeiro() {
  const { montado, estado } = useBarbearia();
  const [barbeiroId, setBarbeiroId] = useState(null);

  useEffect(() => {
    try {
      const s = sessionStorage.getItem(CHAVE_BARBEIRO);
      if (s) setBarbeiroId(s);
    } catch {}
  }, []);

  function selecionar(id) {
    setBarbeiroId(id);
    try {
      sessionStorage.setItem(CHAVE_BARBEIRO, id);
    } catch {}
  }

  function trocar() {
    setBarbeiroId(null);
    try {
      sessionStorage.removeItem(CHAVE_BARBEIRO);
    } catch {}
  }

  if (!montado) return <TelaCarregando />;

  if (!barbeiroId) {
    return <SelecaoBarbeiro barbeiros={estado.barbeiros} onSelecionar={selecionar} />;
  }

  return <PainelBarbeiro barbeiroId={barbeiroId} onTrocar={trocar} />;
}

function SelecaoBarbeiro({ barbeiros, onSelecionar }) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
      <Logo tamanho={96} />
      <h1 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-bold">
        Quem está atendendo?
      </h1>
      <p className="mb-8 text-sm text-nevoa">Selecione seu perfil para abrir a fila.</p>
      <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-3">
        {barbeiros.map((b) => (
          <button
            key={b.id}
            onClick={() => onSelecionar(b.id)}
            className="card card-ouro flex flex-col items-center gap-3 p-6 transition hover:scale-[1.03]"
          >
            <span
              className="flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold"
              style={{ background: `${b.cor}22`, color: b.cor }}
            >
              {b.nome[0]}
            </span>
            <span className="text-lg font-bold">{b.nome}</span>
            <span className="chip">{b.papel === "dono" ? "Dono" : "Barbeiro"}</span>
          </button>
        ))}
      </div>
    </main>
  );
}

function PainelBarbeiro({ barbeiroId, onTrocar }) {
  const {
    estado,
    getCliente,
    getServico,
    getBarbeiro,
    definirStatusFila,
  } = useBarbearia();
  const [concluindo, setConcluindo] = useState(null); // item da fila
  const barbeiro = getBarbeiro(barbeiroId);

  const fila = useMemo(() => {
    return estado.fila
      .filter(
        (f) =>
          (f.barbeiroId === barbeiroId || !f.barbeiroId) && f.status !== "concluido"
      )
      .sort((a, b) => new Date(a.entrouEm) - new Date(b.entrouEm));
  }, [estado.fila, barbeiroId]);

  const cortesHoje = useMemo(
    () =>
      estado.cortes.filter(
        (c) => c.barbeiroId === barbeiroId && mesmoDia(c.criadoEm)
      ),
    [estado.cortes, barbeiroId]
  );
  const faturamentoHoje = cortesHoje.reduce((a, c) => a + c.valor, 0);
  const comissaoHoje = faturamentoHoje * (barbeiro?.comissao ?? 0.5);

  return (
    <main className="flex-1 px-4 py-5 pb-28 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold"
              style={{ background: `${barbeiro.cor}22`, color: barbeiro.cor }}
            >
              {barbeiro.nome[0]}
            </span>
            <div>
              <p className="text-xs text-nevoa">Painel do barbeiro</p>
              <h1 className="text-xl font-bold">{barbeiro.nome}</h1>
            </div>
          </div>
          <button onClick={onTrocar} className="chip hover:text-ouro-claro">Trocar perfil</button>
        </header>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <Kpi titulo="Na fila" valor={fila.length} />
          <Kpi titulo="Cortes hoje" valor={cortesHoje.length} />
          <Kpi titulo="Faturamento" valor={moeda(faturamentoHoje)} pequeno />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-bold">
              Fila de atendimento
            </h2>
            {fila.length === 0 ? (
              <div className="card p-10 text-center text-nevoa">
                Nenhum cliente na fila. 💈
              </div>
            ) : (
              <div className="space-y-3">
                {fila.map((item, idx) => {
                  const cliente = getCliente(item.clienteId);
                  const servico = getServico(item.servicoId);
                  const proximo = idx === 0;
                  return (
                    <div
                      key={item.id}
                      className={`card p-4 ${proximo ? "card-ouro" : ""}`}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                            proximo ? "bg-ouro text-[#1a1400]" : "bg-grafite-claro text-nevoa"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-semibold">{cliente?.nome}</p>
                            {cliente?.fidelidade >= META_FIDELIDADE && (
                              <span className="chip border-ouro/40 text-ouro-claro">🎁 Brinde</span>
                            )}
                            {!item.barbeiroId && <span className="chip">sem preferência</span>}
                          </div>
                          <p className="text-xs text-nevoa">
                            {servico?.nome} · {moeda(servico?.preco)} · entrou {tempoRelativo(item.entrouEm)}
                          </p>
                        </div>
                        <button
                          onClick={() => setConcluindo(item)}
                          className="btn btn-ouro shrink-0 px-4 py-2 text-sm"
                        >
                          Concluir
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <div className="card card-ouro p-5">
              <p className="text-sm text-nevoa">Sua comissão hoje</p>
              <p className="text-3xl font-bold texto-ouro">{moeda(comissaoHoje)}</p>
              <p className="mt-1 text-xs text-nevoa">
                {Math.round((barbeiro?.comissao ?? 0.5) * 100)}% de {moeda(faturamentoHoje)}
              </p>
            </div>

            <div className="card p-4">
              <h3 className="mb-3 text-sm font-semibold">Concluídos hoje</h3>
              {cortesHoje.length === 0 ? (
                <p className="text-sm text-nevoa">Nenhum ainda.</p>
              ) : (
                <div className="space-y-2">
                  {cortesHoje.map((c) => {
                    const cli = getCliente(c.clienteId);
                    const s = getServico(c.servicoId);
                    return (
                      <div key={c.id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium">{cli?.nome?.split(" ")[0]}</p>
                          <p className="text-xs text-nevoa">{s?.nome} · {horaBR(c.criadoEm)}</p>
                        </div>
                        <span className="text-ouro-claro">
                          {c.cortesiaFidelidade ? "🎁" : moeda(c.valor)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {concluindo && (
        <ModalConcluir
          item={concluindo}
          barbeiroId={barbeiroId}
          onFechar={() => setConcluindo(null)}
        />
      )}
    </main>
  );
}

function Kpi({ titulo, valor, pequeno }) {
  return (
    <div className="card p-4 text-center">
      <p className="text-xs text-nevoa">{titulo}</p>
      <p className={`font-bold texto-ouro ${pequeno ? "text-lg" : "text-2xl"}`}>{valor}</p>
    </div>
  );
}

function ModalConcluir({ item, barbeiroId, onFechar }) {
  const { estado, getCliente, getServico, concluirCorte } = useBarbearia();
  const cliente = getCliente(item.clienteId);
  const servicoInicial = getServico(item.servicoId);

  const [servicoId, setServicoId] = useState(item.servicoId);
  const [produtos, setProdutos] = useState([]);
  const [formaPagamento, setFormaPagamento] = useState("pix");
  const [cortesia, setCortesia] = useState(false);

  const servico = getServico(servicoId);
  const podeCortesia = (cliente?.fidelidade ?? 0) >= META_FIDELIDADE;

  const totalProdutos = produtos.reduce((a, pid) => {
    const p = estado.produtos.find((x) => x.id === pid);
    return a + (p?.preco || 0);
  }, 0);
  const total = cortesia ? totalProdutos : (servico?.preco || 0) + totalProdutos;

  function alternarProduto(pid) {
    setProdutos((prev) =>
      prev.includes(pid) ? prev.filter((x) => x !== pid) : [...prev, pid]
    );
  }

  function finalizar() {
    concluirCorte({
      filaId: item.id,
      clienteId: item.clienteId,
      barbeiroId,
      servicoId,
      produtos,
      valor: total,
      formaPagamento,
      cortesiaFidelidade: cortesia,
    });
    onFechar();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="card card-ouro w-full max-w-lg overflow-y-auto p-5 sm:rounded-2xl rounded-b-none max-h-[92vh]">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold">Concluir corte</h3>
            <p className="text-sm text-nevoa">{cliente?.nome}</p>
          </div>
          <button onClick={onFechar} className="text-nevoa hover:text-creme">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">Serviço</p>
            <div className="grid grid-cols-2 gap-2">
              {estado.servicos.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setServicoId(s.id)}
                  className={`rounded-xl border p-2.5 text-left text-sm transition ${
                    servicoId === s.id ? "border-ouro bg-ouro/10" : "border-grafite-borda"
                  }`}
                >
                  <span className="block font-semibold">{s.nome}</span>
                  <span className="text-xs text-nevoa">{moeda(s.preco)}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Produtos (opcional)</p>
            <div className="flex flex-wrap gap-2">
              {estado.produtos.map((p) => (
                <button
                  key={p.id}
                  onClick={() => alternarProduto(p.id)}
                  className={`chip ${produtos.includes(p.id) ? "border-ouro text-ouro-claro" : ""}`}
                >
                  {p.nome} · {moeda(p.preco)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Forma de pagamento</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "pix", label: "PIX" },
                { id: "cartao", label: "Cartão" },
                { id: "dinheiro", label: "Dinheiro" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormaPagamento(f.id)}
                  className={`rounded-xl border py-2 text-sm font-semibold transition ${
                    formaPagamento === f.id ? "border-ouro bg-ouro/10 text-ouro-claro" : "border-grafite-borda"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {podeCortesia && (
            <label className="flex items-center gap-3 rounded-xl border border-ouro/40 bg-ouro/5 p-3 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-[#d4af37]" checked={cortesia} onChange={(e) => setCortesia(e.target.checked)} />
              <span>🎁 Resgatar corte grátis (fidelidade — {META_FIDELIDADE} cortes)</span>
            </label>
          )}

          <div className="flex items-center justify-between rounded-xl border border-ouro/30 bg-ouro/5 p-4">
            <span className="text-sm text-nevoa">Total</span>
            <span className="text-2xl font-bold texto-ouro">{moeda(total)}</span>
          </div>

          <button onClick={finalizar} className="btn btn-ouro w-full text-base">
            Registrar e finalizar
          </button>
        </div>
      </div>
    </div>
  );
}
