"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { estadoInicial } from "./mockData";
import {
  diasDesde,
  aniversarianteHoje,
  clienteAtrasado,
  META_FIDELIDADE,
} from "./format";

const CHAVE_ESTADO = "domwagao_estado_v1";
const CHAVE_SESSAO = "domwagao_sessao_v1";
const CANAL = "domwagao_sync_v1";

const BarbeariaContext = createContext(null);

function gerarId(prefixo) {
  return `${prefixo}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

export function BarbeariaProvider({ children }) {
  const [estado, setEstado] = useState(() => estadoInicial());
  const [sessao, setSessaoState] = useState(null); // clienteId logado neste dispositivo/aba
  const [montado, setMontado] = useState(false);
  const canalRef = useRef(null);
  const ignorarBroadcast = useRef(false);

  // Carrega estado persistido + configura sincronização entre abas
  useEffect(() => {
    const inicial = estadoInicial();
    try {
      const bruto = localStorage.getItem(CHAVE_ESTADO);
      let salvo = null;
      if (bruto) {
        try {
          salvo = JSON.parse(bruto);
        } catch {
          salvo = null;
        }
      }
      if (salvo && salvo.versao === inicial.versao) {
        setEstado(salvo);
      } else {
        setEstado(inicial);
        localStorage.setItem(CHAVE_ESTADO, JSON.stringify(inicial));
      }
    } catch {}

    try {
      const s = sessionStorage.getItem(CHAVE_SESSAO);
      if (s) setSessaoState(s);
    } catch {}

    if (typeof BroadcastChannel !== "undefined") {
      const canal = new BroadcastChannel(CANAL);
      canal.onmessage = (ev) => {
        if (ev?.data?.tipo === "estado") {
          ignorarBroadcast.current = true;
          setEstado(ev.data.estado);
        }
      };
      canalRef.current = canal;
    }

    const aoMudarStorage = (e) => {
      if (e.key === CHAVE_ESTADO && e.newValue) {
        try {
          ignorarBroadcast.current = true;
          setEstado(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener("storage", aoMudarStorage);

    setMontado(true);
    return () => {
      window.removeEventListener("storage", aoMudarStorage);
      canalRef.current?.close();
    };
  }, []);

  // Persiste + transmite sempre que o estado muda (exceto quando veio de fora)
  useEffect(() => {
    if (!montado) return;
    if (ignorarBroadcast.current) {
      ignorarBroadcast.current = false;
      return;
    }
    try {
      localStorage.setItem(CHAVE_ESTADO, JSON.stringify(estado));
      canalRef.current?.postMessage({ tipo: "estado", estado });
    } catch {}
  }, [estado, montado]);

  const setSessao = useCallback((clienteId) => {
    setSessaoState(clienteId);
    try {
      if (clienteId) sessionStorage.setItem(CHAVE_SESSAO, clienteId);
      else sessionStorage.removeItem(CHAVE_SESSAO);
    } catch {}
  }, []);

  // ------- Lookups -------
  const getCliente = useCallback(
    (id) => estado.clientes.find((c) => c.id === id) || null,
    [estado.clientes]
  );
  const getBarbeiro = useCallback(
    (id) => estado.barbeiros.find((b) => b.id === id) || null,
    [estado.barbeiros]
  );
  const getServico = useCallback(
    (id) => estado.servicos.find((s) => s.id === id) || null,
    [estado.servicos]
  );
  const getPlano = useCallback(
    (id) => estado.planos.find((p) => p.id === id) || null,
    [estado.planos]
  );
  const getProduto = useCallback(
    (id) => estado.produtos.find((p) => p.id === id) || null,
    [estado.produtos]
  );

  // ------- Ações -------
  const login = useCallback(
    (telefone) => {
      const alvo = (telefone || "").replace(/\D/g, "");
      const c = estado.clientes.find(
        (cl) => cl.telefone.replace(/\D/g, "") === alvo
      );
      return c || null;
    },
    [estado.clientes]
  );

  const cadastrar = useCallback((dados) => {
    const novo = {
      id: gerarId("c"),
      nome: dados.nome.trim(),
      telefone: (dados.telefone || "").replace(/\D/g, ""),
      email: dados.email?.trim() || "",
      nascimento: dados.nascimento || null,
      frequenciaDias: Number(dados.frequenciaDias) || 30,
      criadoEm: new Date().toISOString(),
      ultimoCorte: null,
      cortesTotais: 0,
      fidelidade: 0,
      planoId: null,
      barbeiroPreferido: dados.barbeiroPreferido || null,
      cartaoSalvo: null,
    };
    setEstado((prev) => ({ ...prev, clientes: [...prev.clientes, novo] }));
    return novo;
  }, []);

  const entrarNaFila = useCallback(({ clienteId, barbeiroId, servicoId }) => {
    const item = {
      id: gerarId("f"),
      clienteId,
      barbeiroId: barbeiroId || null,
      servicoId,
      entrouEm: new Date().toISOString(),
      status: "aguardando",
    };
    setEstado((prev) => {
      const jaNaFila = prev.fila.some(
        (f) => f.clienteId === clienteId && f.status !== "concluido"
      );
      if (jaNaFila) return prev;
      return { ...prev, fila: [...prev.fila, item] };
    });
    return item;
  }, []);

  const sairDaFila = useCallback((filaId) => {
    setEstado((prev) => ({
      ...prev,
      fila: prev.fila.filter((f) => f.id !== filaId),
    }));
  }, []);

  const definirStatusFila = useCallback((filaId, status) => {
    setEstado((prev) => ({
      ...prev,
      fila: prev.fila.map((f) => (f.id === filaId ? { ...f, status } : f)),
    }));
  }, []);

  const concluirCorte = useCallback((dados) => {
    const {
      filaId,
      clienteId,
      barbeiroId,
      servicoId,
      produtos = [],
      valor,
      formaPagamento,
      cortesiaFidelidade = false,
    } = dados;

    const corte = {
      id: gerarId("ct"),
      clienteId,
      barbeiroId,
      servicoId,
      produtos,
      valor: Number(valor) || 0,
      formaPagamento,
      criadoEm: new Date().toISOString(),
      avaliacao: null,
      cortesiaFidelidade,
    };

    setEstado((prev) => {
      const clientes = prev.clientes.map((c) => {
        if (c.id !== clienteId) return c;
        let fidelidade = (c.fidelidade || 0) + 1;
        if (cortesiaFidelidade) fidelidade = 0; // resgatou o brinde
        else if (fidelidade > META_FIDELIDADE) fidelidade = fidelidade % META_FIDELIDADE;
        return {
          ...c,
          cortesTotais: (c.cortesTotais || 0) + 1,
          ultimoCorte: corte.criadoEm,
          fidelidade,
        };
      });
      return {
        ...prev,
        clientes,
        cortes: [corte, ...prev.cortes],
        fila: filaId ? prev.fila.filter((f) => f.id !== filaId) : prev.fila,
      };
    });
    return corte;
  }, []);

  const avaliarCorte = useCallback((corteId, nota, comentario) => {
    setEstado((prev) => ({
      ...prev,
      cortes: prev.cortes.map((ct) =>
        ct.id === corteId
          ? { ...ct, avaliacao: { nota, comentario: comentario || "" } }
          : ct
      ),
    }));
  }, []);

  const assinarPlano = useCallback(({ clienteId, planoId, metodo }) => {
    setEstado((prev) => {
      const plano = prev.planos.find((p) => p.id === planoId);
      if (!plano) return prev;
      const parcela =
        plano.periodo === "mensal"
          ? plano.preco
          : plano.periodo === "semestral"
          ? plano.preco / 6
          : plano.preco / 12;
      const nova = {
        id: gerarId("as"),
        clienteId,
        planoId,
        inicio: new Date().toISOString(),
        proximaCobranca: new Date(Date.now() + 30 * 864e5).toISOString(),
        valorParcela: Math.round(parcela * 100) / 100,
        status: "ativa",
        metodo: metodo || "cartao",
      };
      return {
        ...prev,
        assinaturas: [
          nova,
          ...prev.assinaturas.filter((a) => a.clienteId !== clienteId),
        ],
        clientes: prev.clientes.map((c) =>
          c.id === clienteId ? { ...c, planoId } : c
        ),
      };
    });
  }, []);

  const salvarCartao = useCallback((clienteId, cartao) => {
    setEstado((prev) => ({
      ...prev,
      clientes: prev.clientes.map((c) =>
        c.id === clienteId ? { ...c, cartaoSalvo: cartao } : c
      ),
    }));
  }, []);

  const registrarMensagem = useCallback(({ clienteId, tipo, texto, canal = "whatsapp" }) => {
    const msg = {
      id: gerarId("m"),
      clienteId,
      tipo,
      canal,
      texto,
      criadoEm: new Date().toISOString(),
      status: "simulada",
    };
    setEstado((prev) => ({ ...prev, mensagens: [msg, ...prev.mensagens] }));
    return msg;
  }, []);

  const dispararAniversariantes = useCallback(() => {
    setEstado((prev) => {
      const novas = prev.clientes
        .filter((c) => aniversarianteHoje(c.nascimento))
        .map((c) => ({
          id: gerarId("m"),
          clienteId: c.id,
          tipo: "aniversario",
          canal: "whatsapp",
          texto: `Parabéns, ${c.nome.split(" ")[0]}! 🎉 A Dom Wagão Barbearia deseja um feliz aniversário. Passe aqui e ganhe um mimo especial no seu corte!`,
          criadoEm: new Date().toISOString(),
          status: "simulada",
        }));
      return { ...prev, mensagens: [...novas, ...prev.mensagens] };
    });
  }, []);

  const dispararReativacao = useCallback(() => {
    setEstado((prev) => {
      const novas = prev.clientes
        .filter((c) => clienteAtrasado(c))
        .map((c) => ({
          id: gerarId("m"),
          clienteId: c.id,
          tipo: "reativacao",
          canal: "whatsapp",
          texto: `Fala, ${c.nome.split(" ")[0]}! Sentimos sua falta na Dom Wagão. Já faz ${diasDesde(
            c.ultimoCorte
          )} dias desde seu último corte. Bora dar aquele trato? 💈`,
          criadoEm: new Date().toISOString(),
          status: "simulada",
        }));
      return { ...prev, mensagens: [...novas, ...prev.mensagens] };
    });
  }, []);

  const resetarDemo = useCallback(() => {
    const novo = estadoInicial();
    setEstado(novo);
    setSessao(null);
    try {
      localStorage.setItem(CHAVE_ESTADO, JSON.stringify(novo));
      canalRef.current?.postMessage({ tipo: "estado", estado: novo });
    } catch {}
  }, [setSessao]);

  const valor = {
    estado,
    montado,
    sessao,
    setSessao,
    getCliente,
    getBarbeiro,
    getServico,
    getPlano,
    getProduto,
    login,
    cadastrar,
    entrarNaFila,
    sairDaFila,
    definirStatusFila,
    concluirCorte,
    avaliarCorte,
    assinarPlano,
    salvarCartao,
    registrarMensagem,
    dispararAniversariantes,
    dispararReativacao,
    resetarDemo,
  };

  return (
    <BarbeariaContext.Provider value={valor}>
      {children}
    </BarbeariaContext.Provider>
  );
}

export function useBarbearia() {
  const ctx = useContext(BarbeariaContext);
  if (!ctx)
    throw new Error("useBarbearia deve ser usado dentro de BarbeariaProvider");
  return ctx;
}
