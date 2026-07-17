// Gera um "QR Code" apenas visual/decorativo a partir de uma semente.
// Não é um QR real — serve só para a demonstração do fluxo de PIX.
function pseudoAleatorio(semente) {
  let h = 2166136261;
  for (let i = 0; i < semente.length; i++) {
    h ^= semente.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function QrFake({ semente = "domwagao", tamanho = 176 }) {
  const n = 25;
  const rand = pseudoAleatorio(semente);
  const celulas = [];
  const ehFinder = (r, c) => {
    const dentro = (br, bc) => r >= br && r < br + 7 && c >= bc && c < bc + 7;
    return dentro(0, 0) || dentro(0, n - 7) || dentro(n - 7, 0);
  };
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      let cheio;
      if (ehFinder(r, c)) {
        const anelR = Math.min(r, n - 1 - r, r);
        cheio =
          r % 7 === 0 ||
          c % 7 === 0 ||
          (r % 7 >= 2 && r % 7 <= 4 && c % 7 >= 2 && c % 7 <= 4);
        // borda + miolo dos marcadores
        const lr = r < 7 ? r : r - (n - 7);
        const lc = c < 7 ? c : c - (n - 7);
        cheio =
          lr === 0 || lr === 6 || lc === 0 || lc === 6 ||
          (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4);
      } else {
        cheio = rand() > 0.5;
      }
      celulas.push(cheio);
    }
  }

  return (
    <div
      className="grid overflow-hidden rounded-lg bg-white p-2"
      style={{
        width: tamanho,
        height: tamanho,
        gridTemplateColumns: `repeat(${n}, 1fr)`,
      }}
    >
      {celulas.map((c, i) => (
        <div key={i} style={{ background: c ? "#0a0a0b" : "transparent" }} />
      ))}
    </div>
  );
}
