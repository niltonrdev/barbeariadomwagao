export const moeda = (v) =>
  (Number(v) || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export function soDigitos(str) {
  return (str || "").replace(/\D/g, "");
}

export function formatarTelefone(valor) {
  const d = soDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Máscara de digitação DD/MM/AAAA */
export function formatarDataBR(valor) {
  const d = soDigitos(valor).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/** Converte DD/MM/AAAA → ISO (YYYY-MM-DD), ou null se inválida */
export function dataBRparaISO(valor) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((valor || "").trim());
  if (!m) return null;
  const dia = Number(m[1]);
  const mes = Number(m[2]);
  const ano = Number(m[3]);
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31 || ano < 1900 || ano > new Date().getFullYear()) {
    return null;
  }
  const data = new Date(ano, mes - 1, dia);
  if (
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) {
    return null;
  }
  return data.toISOString();
}

export function dataBR(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function diaMes(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function horaBR(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function tempoRelativo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}

export function diasDesde(iso) {
  if (!iso) return Infinity;
  return Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
}

export function aniversarianteNoMes(nascimentoIso) {
  if (!nascimentoIso) return false;
  return new Date(nascimentoIso).getMonth() === new Date().getMonth();
}

export function aniversarianteHoje(nascimentoIso) {
  if (!nascimentoIso) return false;
  const n = new Date(nascimentoIso);
  const h = new Date();
  return n.getMonth() === h.getMonth() && n.getDate() === h.getDate();
}

// Cliente "atrasado": passou 40% além da frequência habitual sem cortar.
export function clienteAtrasado(cliente) {
  if (!cliente?.frequenciaDias || !cliente?.ultimoCorte) return false;
  return diasDesde(cliente.ultimoCorte) > cliente.frequenciaDias * 1.4;
}

export function labelFrequencia(dias) {
  if (dias === 7) return "Toda semana";
  if (dias === 15) return "A cada 15 dias";
  if (dias === 30) return "1x por mês";
  return `${dias} dias`;
}

export const META_FIDELIDADE = 10;

export function mesmoDia(iso, ref = new Date()) {
  const d = new Date(iso);
  return (
    d.getDate() === ref.getDate() &&
    d.getMonth() === ref.getMonth() &&
    d.getFullYear() === ref.getFullYear()
  );
}
