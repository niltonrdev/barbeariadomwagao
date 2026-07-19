"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import TelaCarregando from "@/components/TelaCarregando";
import Estrelas from "@/components/Estrelas";
import PagamentoModal from "@/components/PagamentoModal";
import { useBarbearia } from "@/lib/store";
import {
  moeda,
  dataBR,
  tempoRelativo,
  labelFrequencia,
  aniversarianteNoMes,
  META_FIDELIDADE,
} from "@/lib/format";

export default function AreaCliente() {
  const router = useRouter();
  const {
    montado,
    sessao,
    setSessao,
    estado,
    getCliente,
    getBarbeiro,
    getServico,
    getPlano,
    entrarNaFila,
    sairDaFila,
  } = useBarbearia();

  const [aba, setAba] = useState("fila");

  useEffect(() => {
    if (montado && !sessao) router.replace("/");
  }, [montado, sessao, router]);

  if (!montado) return <TelaCarregando />;
  const cliente = getCliente(sessao);
  if (!cliente) return <TelaCarregando />;

  const meuItem = estado.fila.find((f) => f.clienteId === cliente.id);
  const plano = getPlano(cliente.planoId);

  return (
    <main className="flex-1 px-4 py-5 pb-28">
      <div className="mx-auto w-full max-w-lg">
        <header className="mb-5 flex items-center justify-between">
          <Logo tamanho={48} comNome />
          <button
            onClick={() => {
              setSessao(null);
              router.push("/");
            }}
            className="chip hover:text-ouro-claro"
          >
            Sair
          </button>
        </header>

        <div className="card card-ouro mb-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-nevoa">Olá,</p>
              <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
                {cliente.nome.split(" ")[0]}
              </h1>
            </div>
            <div className="text-right">
              {plano ? (
                <span className="chip border-ouro/40 text-ouro-claro">
                  ★ Plano {plano.nome}
                </span>
              ) : (
                <span className="chip">Sem plano</span>
              )}
              {aniversarianteNoMes(cliente.nascimento) && (
                <p className="mt-1 text-xs text-ouro-claro">🎉 Aniversariante do mês!</p>
              )}
            </div>
          </div>

          <FidelidadeBarra fidelidade={cliente.fidelidade} />
        </div>

        <nav className="mb-4 grid grid-cols-3 gap-2 rounded-xl bg-carvao p-1">
          {[
            { id: "fila", label: "Fila" },
            { id: "planos", label: "Planos" },
            { id: "historico", label: "Histórico" },
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
        </nav>

        {aba === "fila" &&
          (meuItem ? (
            <StatusFila item={meuItem} onSair={() => sairDaFila(meuItem.id)} />
          ) : (
            <EntrarFila cliente={cliente} onEntrar={entrarNaFila} />
          ))}

        {aba === "planos" && <AbaPlanos cliente={cliente} />}

        {aba === "historico" && <AbaHistorico cliente={cliente} />}
      </div>
    </main>
  );
}

function FidelidadeBarra({ fidelidade }) {
  const faltam = META_FIDELIDADE - fidelidade;
  const pronto = fidelidade >= META_FIDELIDADE;
  return (
    <div className="mt-4">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-nevoa">Fidelidade</span>
        <span className="text-ouro-claro">
          {pronto ? "Corte grátis disponível! 🎁" : `Faltam ${faltam} para um corte grátis`}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: META_FIDELIDADE }).map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full ${i < fidelidade ? "bg-ouro" : "bg-grafite-borda"}`}
          />
        ))}
      </div>
    </div>
  );
}

function StatusFila({ item, onSair }) {
  const { estado, getBarbeiro, getServico, getCliente } = useBarbearia();
  const barbeiro = getBarbeiro(item.barbeiroId);
  const servico = getServico(item.servicoId);
  const cliente = getCliente(item.clienteId);
  const [pagando, setPagando] = useState(false);
  const [pago, setPago] = useState(false);

  const { posicao, espera } = useMemo(() => {
    const aguardando = estado.fila
      .filter((f) => f.status === "aguardando" || f.status === "atendendo")
      .sort((a, b) => new Date(a.entrouEm) - new Date(b.entrouEm));

    const relevantes = aguardando.filter(
      (f) => !item.barbeiroId || !f.barbeiroId || f.barbeiroId === item.barbeiroId
    );
    const idx = relevantes.findIndex((f) => f.id === item.id);
    const antes = relevantes.slice(0, Math.max(idx, 0));
    const minutos = antes.reduce((acc, f) => {
      const s = estado.servicos.find((x) => x.id === f.servicoId);
      return acc + (s?.duracao || 30);
    }, 0);
    const divisor = item.barbeiroId ? 1 : Math.max(estado.barbeiros.length, 1);
    return { posicao: idx + 1, espera: Math.round(minutos / divisor) };
  }, [estado, item]);

  const suaVez = posicao <= 1;

  return (
    <div className="space-y-4">
      <div className={`card p-6 text-center ${suaVez ? "card-ouro pulso" : ""}`}>
        <p className="text-sm text-nevoa">{suaVez ? "É a sua vez!" : "Sua posição na fila"}</p>
        <p className="my-2 font-[family-name:var(--font-display)] text-6xl font-bold texto-ouro">
          {suaVez ? "🎉" : `${posicao}º`}
        </p>
        {!suaVez && (
          <p className="text-sm text-nevoa">
            Tempo estimado de espera:{" "}
            <span className="font-semibold text-creme">~{espera} min</span>
          </p>
        )}
        {suaVez && (
          <p className="text-sm text-ouro-claro">Dirija-se ao barbeiro. Bom corte!</p>
        )}
      </div>

      <div className="card p-4 space-y-2 text-sm">
        <Linha rotulo="Serviço" valor={`${servico?.nome} · ${moeda(servico?.preco)}`} />
        <Linha rotulo="Barbeiro" valor={barbeiro ? barbeiro.nome : "Qualquer disponível"} />
        <Linha rotulo="Entrou na fila" valor={tempoRelativo(item.entrouEm)} />
      </div>

      {pago ? (
        <div className="rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-center text-sm text-green-300">
          ✓ Pagamento adiantado! É só confirmar com o barbeiro ao terminar.
        </div>
      ) : (
        <button onClick={() => setPagando(true)} className="btn btn-ouro w-full">
          Adiantar pagamento ({moeda(servico?.preco)})
        </button>
      )}

      <button onClick={onSair} className="btn btn-contorno w-full hover:border-red-500/50 hover:text-red-400">
        Sair da fila
      </button>

      {pagando && (
        <PagamentoModal
          valor={servico?.preco || 0}
          descricao={`${servico?.nome} — adiantar pagamento`}
          cartaoSalvo={cliente?.cartaoSalvo}
          onConfirmado={() => {
            setPagando(false);
            setPago(true);
          }}
          onFechar={() => setPagando(false)}
        />
      )}
    </div>
  );
}

function EntrarFila({ cliente, onEntrar }) {
  const { estado } = useBarbearia();
  const [barbeiroId, setBarbeiroId] = useState(cliente.barbeiroPreferido || "");
  const [servicoId, setServicoId] = useState("s-corte");

  const filaPorBarbeiro = (bid) =>
    estado.fila.filter((f) => f.barbeiroId === bid && f.status !== "concluido").length;
  const totalFila = estado.fila.filter((f) => f.status !== "concluido").length;

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h2 className="mb-3 font-semibold">Escolha o barbeiro</h2>
        <div className="space-y-2">
          <OpcaoBarbeiro
            selecionado={barbeiroId === ""}
            onClick={() => setBarbeiroId("")}
            nome="Qualquer disponível"
            sub={`${totalFila} na fila geral`}
            inicial="✂"
          />
          {estado.barbeiros.map((b) => (
            <OpcaoBarbeiro
              key={b.id}
              selecionado={barbeiroId === b.id}
              onClick={() => setBarbeiroId(b.id)}
              nome={`${b.nome}${b.papel === "dono" ? " (Dono)" : ""}`}
              sub={`${filaPorBarbeiro(b.id)} na fila`}
              inicial={b.nome[0]}
              cor={b.cor}
            />
          ))}
        </div>
      </div>

      <div className="card p-4">
        <h2 className="mb-3 font-semibold">Serviço</h2>
        <div className="grid grid-cols-2 gap-2">
          {estado.servicos.map((s) => (
            <button
              key={s.id}
              onClick={() => setServicoId(s.id)}
              className={`rounded-xl border p-3 text-left transition ${
                servicoId === s.id ? "border-ouro bg-ouro/10" : "border-grafite-borda hover:border-ouro/40"
              }`}
            >
              <span className="block text-sm font-semibold">{s.nome}</span>
              <span className="block text-xs text-nevoa">{moeda(s.preco)} · {s.duracao}min</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onEntrar({ clienteId: cliente.id, barbeiroId: barbeiroId || null, servicoId })}
        className="btn btn-ouro w-full text-base"
      >
        Entrar na fila
      </button>
    </div>
  );
}

function OpcaoBarbeiro({ selecionado, onClick, nome, sub, inicial, cor = "#d4af37" }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
        selecionado ? "border-ouro bg-ouro/10" : "border-grafite-borda hover:border-ouro/40"
      }`}
    >
      <span
        className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
        style={{ background: `${cor}22`, color: cor }}
      >
        {inicial}
      </span>
      <span className="flex-1">
        <span className="block font-semibold">{nome}</span>
        <span className="block text-xs text-nevoa">{sub}</span>
      </span>
      <span className={`h-4 w-4 rounded-full border ${selecionado ? "border-ouro bg-ouro" : "border-grafite-borda"}`} />
    </button>
  );
}

function AbaPlanos({ cliente }) {
  const { estado, getPlano, assinarPlano, salvarCartao } = useBarbearia();
  const [pagamento, setPagamento] = useState(null); // {tipo, valor, descricao, planoId}
  const [sucesso, setSucesso] = useState("");
  const planoAtual = getPlano(cliente.planoId);

  function aoConfirmar(metodo) {
    if (pagamento?.planoId) {
      assinarPlano({ clienteId: cliente.id, planoId: pagamento.planoId, metodo });
      setSucesso(`Plano ativado com sucesso via ${metodo === "pix" ? "PIX" : "cartão"}!`);
    } else {
      if (metodo === "cartao" && !cliente.cartaoSalvo) {
        salvarCartao(cliente.id, { bandeira: "Cartão", final: "0000" });
      }
      setSucesso(`Pagamento de ${moeda(pagamento.valor)} confirmado!`);
    }
    setPagamento(null);
    setTimeout(() => setSucesso(""), 3500);
  }

  return (
    <div className="space-y-4">
      {sucesso && (
        <div className="rounded-xl border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-300">
          ✓ {sucesso}
        </div>
      )}

      {planoAtual && (
        <div className="card card-ouro p-4">
          <p className="text-xs text-nevoa">Seu plano atual</p>
          <p className="text-lg font-bold texto-ouro">{planoAtual.nome}</p>
          <p className="text-sm text-nevoa">{planoAtual.descricao}</p>
        </div>
      )}

      <div className="card p-4">
        <h2 className="mb-1 font-semibold">Pagar corte avulso</h2>
        <p className="mb-3 text-sm text-nevoa">Pague agora via PIX ou cartão.</p>
        <div className="grid grid-cols-2 gap-2">
          {estado.servicos.slice(0, 4).map((s) => (
            <button
              key={s.id}
              onClick={() => setPagamento({ valor: s.preco, descricao: s.nome })}
              className="rounded-xl border border-grafite-borda p-3 text-left hover:border-ouro/40"
            >
              <span className="block text-sm font-semibold">{s.nome}</span>
              <span className="block text-xs text-ouro-claro">{moeda(s.preco)}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2 px-1 font-semibold">Assine um plano</h2>
        <div className="space-y-3">
          {estado.planos.map((p) => {
            const atual = cliente.planoId === p.id;
            return (
              <div key={p.id} className={`card p-4 ${atual ? "card-ouro" : ""}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold">{p.nome}</p>
                    <p className="text-sm text-nevoa">{p.descricao}</p>
                    <p className="mt-1 text-xs text-nevoa">{p.cobranca}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold texto-ouro">{moeda(p.preco)}</p>
                    <p className="text-[11px] text-nevoa">
                      {p.periodo === "anual" ? "12x " + moeda(p.preco / 12) : p.periodo === "semestral" ? "6x " + moeda(p.preco / 6) : "por mês"}
                    </p>
                  </div>
                </div>
                <button
                  disabled={atual}
                  onClick={() => setPagamento({ valor: p.preco, descricao: `Plano ${p.nome}`, planoId: p.id })}
                  className={`btn mt-3 w-full ${atual ? "btn-contorno" : "btn-ouro"}`}
                >
                  {atual ? "Plano ativo" : "Assinar"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {pagamento && (
        <PagamentoModal
          valor={pagamento.valor}
          descricao={pagamento.descricao}
          cartaoSalvo={cliente.cartaoSalvo}
          onConfirmado={aoConfirmar}
          onFechar={() => setPagamento(null)}
        />
      )}
    </div>
  );
}

function AbaHistorico({ cliente }) {
  const { estado, getBarbeiro, getServico, avaliarCorte } = useBarbearia();
  const meusCortes = estado.cortes
    .filter((c) => c.clienteId === cliente.id)
    .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

  if (meusCortes.length === 0) {
    return (
      <div className="card p-8 text-center text-nevoa">
        Você ainda não tem cortes registrados.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="card p-4 text-sm text-nevoa">
        Total de cortes: <span className="font-semibold text-creme">{cliente.cortesTotais}</span> · Frequência:{" "}
        <span className="text-creme">{labelFrequencia(cliente.frequenciaDias)}</span>
      </div>
      {meusCortes.map((ct) => {
        const b = getBarbeiro(ct.barbeiroId);
        const s = getServico(ct.servicoId);
        return (
          <div key={ct.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{s?.nome}</p>
                <p className="text-xs text-nevoa">
                  {dataBR(ct.criadoEm)} · {b?.nome}
                </p>
              </div>
              <p className="font-bold texto-ouro">
                {ct.cortesiaFidelidade ? "Cortesia 🎁" : moeda(ct.valor)}
              </p>
            </div>
            <div className="mt-2 border-t border-grafite-borda pt-2">
              {ct.avaliacao ? (
                <div className="flex items-center gap-2 text-sm text-nevoa">
                  Sua avaliação: <Estrelas nota={ct.avaliacao.nota} tamanho={14} />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-nevoa">Avalie:</span>
                  <Estrelas onSelecionar={(n) => avaliarCorte(ct.id, n)} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Linha({ rotulo, valor }) {
  return (
    <div className="flex justify-between">
      <span className="text-nevoa">{rotulo}</span>
      <span className="font-medium">{valor}</span>
    </div>
  );
}
