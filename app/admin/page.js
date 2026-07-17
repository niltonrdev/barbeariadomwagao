"use client";

import { useMemo, useState } from "react";
import Logo from "@/components/Logo";
import TelaCarregando from "@/components/TelaCarregando";
import { useBarbearia } from "@/lib/store";
import {
  moeda,
  dataBR,
  diaMes,
  tempoRelativo,
  diasDesde,
  labelFrequencia,
  aniversarianteNoMes,
  aniversarianteHoje,
  clienteAtrasado,
  mesmoDia,
} from "@/lib/format";

const ehDoMes = (iso) => {
  const d = new Date(iso);
  const h = new Date();
  return d.getMonth() === h.getMonth() && d.getFullYear() === h.getFullYear();
};

export default function PainelDono() {
  const { montado, estado } = useBarbearia();
  const [aba, setAba] = useState("geral");

  if (!montado) return <TelaCarregando />;

  return (
    <main className="flex-1 px-4 py-5 pb-28 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Logo tamanho={52} comNome />
          <div className="text-right">
            <p className="text-xs text-nevoa">Painel de gestão</p>
            <p className="font-semibold text-ouro-claro">Dom Wagão</p>
          </div>
        </header>

        <nav className="mb-6 flex flex-wrap gap-2">
          {[
            { id: "geral", label: "Visão geral" },
            { id: "clientes", label: "Clientes" },
            { id: "planos", label: "Planos" },
            { id: "mensagens", label: "Mensagens" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setAba(t.id)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                aba === t.id ? "bg-ouro text-[#1a1400]" : "card text-nevoa hover:text-creme"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {aba === "geral" && <VisaoGeral estado={estado} />}
        {aba === "clientes" && <Clientes estado={estado} />}
        {aba === "planos" && <Planos estado={estado} />}
        {aba === "mensagens" && <Mensagens />}
      </div>
    </main>
  );
}

function VisaoGeral({ estado }) {
  const m = useMemo(() => {
    const hoje = estado.cortes.filter((c) => mesmoDia(c.criadoEm));
    const mes = estado.cortes.filter((c) => ehDoMes(c.criadoEm));
    const fatHoje = hoje.reduce((a, c) => a + c.valor, 0);
    const fatMes = mes.reduce((a, c) => a + c.valor, 0);
    const ticket = mes.length ? fatMes / mes.length : 0;

    const porBarbeiro = estado.barbeiros.map((b) => {
      const cortesB = mes.filter((c) => c.barbeiroId === b.id);
      const fat = cortesB.reduce((a, c) => a + c.valor, 0);
      return {
        barbeiro: b,
        cortes: cortesB.length,
        faturamento: fat,
        comissao: fat * b.comissao,
      };
    });

    return { hoje, mes, fatHoje, fatMes, ticket, porBarbeiro };
  }, [estado]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiGrande titulo="Faturamento hoje" valor={moeda(m.fatHoje)} />
        <KpiGrande titulo="Faturamento no mês" valor={moeda(m.fatMes)} />
        <KpiGrande titulo="Cortes no mês" valor={m.mes.length} />
        <KpiGrande titulo="Ticket médio" valor={moeda(m.ticket)} />
      </div>

      <section>
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-bold">
          Desempenho por barbeiro (mês)
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {m.porBarbeiro.map((p) => {
            const max = Math.max(...m.porBarbeiro.map((x) => x.faturamento), 1);
            return (
              <div key={p.barbeiro.id} className="card p-4">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full font-bold"
                    style={{ background: `${p.barbeiro.cor}22`, color: p.barbeiro.cor }}
                  >
                    {p.barbeiro.nome[0]}
                  </span>
                  <div>
                    <p className="font-semibold">{p.barbeiro.nome}</p>
                    <p className="text-xs text-nevoa">
                      {p.barbeiro.papel === "dono" ? "Dono" : `Comissão ${Math.round(p.barbeiro.comissao * 100)}%`}
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-grafite-borda">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(p.faturamento / max) * 100}%`, background: p.barbeiro.cor }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <p className="font-bold">{p.cortes}</p>
                    <p className="text-[11px] text-nevoa">cortes</p>
                  </div>
                  <div>
                    <p className="font-bold texto-ouro">{moeda(p.faturamento)}</p>
                    <p className="text-[11px] text-nevoa">faturou</p>
                  </div>
                  <div>
                    <p className="font-bold">{moeda(p.comissao)}</p>
                    <p className="text-[11px] text-nevoa">comissão</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-bold">
          Últimos cortes
        </h2>
        <ListaCortes estado={estado} limite={8} />
      </section>
    </div>
  );
}

function ListaCortes({ estado, limite = 10 }) {
  const cortes = [...estado.cortes]
    .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
    .slice(0, limite);
  const nomeCliente = (id) => estado.clientes.find((c) => c.id === id)?.nome || "—";
  const nomeBarbeiro = (id) => estado.barbeiros.find((b) => b.id === id)?.nome || "—";
  const nomeServico = (id) => estado.servicos.find((s) => s.id === id)?.nome || "—";

  return (
    <div className="card divide-y divide-grafite-borda overflow-hidden">
      {cortes.map((c) => (
        <div key={c.id} className="flex items-center justify-between p-3 text-sm">
          <div className="min-w-0">
            <p className="truncate font-medium">{nomeCliente(c.clienteId)}</p>
            <p className="text-xs text-nevoa">
              {nomeServico(c.servicoId)} · {nomeBarbeiro(c.barbeiroId)} · {tempoRelativo(c.criadoEm)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold texto-ouro">
              {c.cortesiaFidelidade ? "Cortesia" : moeda(c.valor)}
            </p>
            <p className="text-[11px] uppercase text-nevoa">{c.formaPagamento}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Clientes({ estado }) {
  const [busca, setBusca] = useState("");
  const aniversariantes = estado.clientes.filter((c) => aniversarianteNoMes(c.nascimento));
  const atrasados = estado.clientes.filter(clienteAtrasado);
  const filtrados = estado.clientes.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <h3 className="mb-3 font-semibold">🎂 Aniversariantes do mês ({aniversariantes.length})</h3>
          {aniversariantes.length === 0 ? (
            <p className="text-sm text-nevoa">Ninguém este mês.</p>
          ) : (
            <div className="space-y-2">
              {aniversariantes.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <span>
                    {c.nome}
                    {aniversarianteHoje(c.nascimento) && (
                      <span className="ml-2 chip border-ouro/40 text-ouro-claro">hoje!</span>
                    )}
                  </span>
                  <span className="text-nevoa">{diaMes(c.nascimento)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-4">
          <h3 className="mb-3 font-semibold">⏰ Clientes atrasados ({atrasados.length})</h3>
          {atrasados.length === 0 ? (
            <p className="text-sm text-nevoa">Todos em dia.</p>
          ) : (
            <div className="space-y-2">
              {atrasados.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <span>{c.nome}</span>
                  <span className="text-red-400">
                    {diasDesde(c.ultimoCorte)}d · {labelFrequencia(c.frequenciaDias)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
            Todos os clientes ({estado.clientes.length})
          </h2>
          <input
            className="input max-w-xs"
            placeholder="Buscar por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="card overflow-hidden">
          <div className="hidden grid-cols-12 gap-2 border-b border-grafite-borda p-3 text-xs uppercase text-nevoa md:grid">
            <span className="col-span-4">Cliente</span>
            <span className="col-span-3">Telefone</span>
            <span className="col-span-2">Frequência</span>
            <span className="col-span-1 text-center">Cortes</span>
            <span className="col-span-2 text-right">Plano</span>
          </div>
          <div className="divide-y divide-grafite-borda">
            {filtrados.map((c) => {
              const plano = estado.planos.find((p) => p.id === c.planoId);
              return (
                <div key={c.id} className="grid grid-cols-2 gap-2 p-3 text-sm md:grid-cols-12">
                  <span className="col-span-2 font-medium md:col-span-4">{c.nome}</span>
                  <span className="col-span-1 text-nevoa md:col-span-3">
                    {c.telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}
                  </span>
                  <span className="col-span-1 text-nevoa md:col-span-2">{labelFrequencia(c.frequenciaDias)}</span>
                  <span className="col-span-1 md:col-span-1 md:text-center">{c.cortesTotais}</span>
                  <span className="col-span-1 text-right md:col-span-2">
                    {plano ? (
                      <span className="chip border-ouro/40 text-ouro-claro">{plano.nome}</span>
                    ) : (
                      <span className="text-nevoa">—</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Planos({ estado }) {
  const receitaRecorrente = estado.assinaturas
    .filter((a) => a.status === "ativa")
    .reduce((acc, a) => acc + a.valorParcela, 0);

  const nomeCliente = (id) => estado.clientes.find((c) => c.id === id)?.nome || "—";
  const nomePlano = (id) => estado.planos.find((p) => p.id === id)?.nome || "—";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <KpiGrande titulo="Assinaturas ativas" valor={estado.assinaturas.filter((a) => a.status === "ativa").length} />
        <KpiGrande titulo="Receita recorrente/mês" valor={moeda(receitaRecorrente)} />
        <KpiGrande titulo="Planos oferecidos" valor={estado.planos.length} />
      </div>

      <div>
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-bold">
          Assinaturas ativas
        </h2>
        <div className="card overflow-hidden">
          <div className="hidden grid-cols-12 gap-2 border-b border-grafite-borda p-3 text-xs uppercase text-nevoa md:grid">
            <span className="col-span-4">Cliente</span>
            <span className="col-span-2">Plano</span>
            <span className="col-span-2">Método</span>
            <span className="col-span-2 text-right">Parcela</span>
            <span className="col-span-2 text-right">Próx. cobrança</span>
          </div>
          <div className="divide-y divide-grafite-borda">
            {estado.assinaturas.map((a) => (
              <div key={a.id} className="grid grid-cols-2 gap-2 p-3 text-sm md:grid-cols-12">
                <span className="col-span-2 font-medium md:col-span-4">{nomeCliente(a.clienteId)}</span>
                <span className="col-span-1 md:col-span-2">
                  <span className="chip border-ouro/40 text-ouro-claro">{nomePlano(a.planoId)}</span>
                </span>
                <span className="col-span-1 uppercase text-nevoa md:col-span-2">{a.metodo}</span>
                <span className="col-span-1 text-right md:col-span-2">{moeda(a.valorParcela)}</span>
                <span className="col-span-1 text-right text-nevoa md:col-span-2">{dataBR(a.proximaCobranca)}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs text-nevoa">
          💡 O plano anual/semestral é cobrado mês a mês no cartão (assinatura recorrente).
          Em produção, isso é feito pelo gateway (ex.: Asaas, Mercado Pago, Stripe),
          que guarda o cartão tokenizado — nunca no nosso sistema.
        </p>
      </div>
    </div>
  );
}

function Mensagens() {
  const { estado, getCliente, dispararAniversariantes, dispararReativacao } = useBarbearia();
  const mensagens = [...estado.mensagens].sort(
    (a, b) => new Date(b.criadoEm) - new Date(a.criadoEm)
  );

  const rotuloTipo = {
    aniversario: { txt: "Aniversário", cor: "text-ouro-claro" },
    reativacao: { txt: "Reativação", cor: "text-blue-300" },
    sua_vez: { txt: "Sua vez", cor: "text-green-300" },
  };

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
          Central de mensagens (WhatsApp)
        </h2>
        <p className="mt-1 text-sm text-nevoa">
          Na demonstração, os disparos são apenas simulados e ficam registrados aqui.
          Em produção conectamos a API oficial do WhatsApp.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={dispararAniversariantes} className="btn btn-ouro text-sm">
            🎂 Disparar aniversariantes de hoje
          </button>
          <button onClick={dispararReativacao} className="btn btn-contorno text-sm">
            ⏰ Disparar reativação (atrasados)
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {mensagens.length === 0 && (
          <div className="card p-8 text-center text-nevoa">Nenhuma mensagem ainda.</div>
        )}
        {mensagens.map((m) => {
          const cliente = getCliente(m.clienteId);
          const tipo = rotuloTipo[m.tipo] || { txt: m.tipo, cor: "text-nevoa" };
          return (
            <div key={m.id} className="card p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/15 text-green-400">
                    ✆
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{cliente?.nome}</p>
                    <p className={`text-xs ${tipo.cor}`}>{tipo.txt}</p>
                  </div>
                </div>
                <span className="chip">{tempoRelativo(m.criadoEm)}</span>
              </div>
              <p className="rounded-xl bg-carvao p-3 text-sm text-creme">{m.texto}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KpiGrande({ titulo, valor }) {
  return (
    <div className="card card-ouro p-4">
      <p className="text-xs text-nevoa">{titulo}</p>
      <p className="mt-1 text-2xl font-bold texto-ouro">{valor}</p>
    </div>
  );
}
