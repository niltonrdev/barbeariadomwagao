// Gera um "código PIX copia e cola" apenas para a demonstração.
// NÃO é um código PIX válido/real — serve só para ilustrar o fluxo de pagamento.
// Em produção, o código PIX (com valor correto) é gerado pelo gateway de pagamento.
export function gerarCodigoPix(valor) {
  const centavos = String(Math.round((Number(valor) || 0) * 100)).padStart(6, "0");
  return (
    "00020126580014BR.GOV.BCB.PIX0136dom-wagao-barbearia-demo5204000053039865406" +
    centavos +
    "5802BR5920DOM WAGAO BARBEARIA6009SAO PAULO62070503***6304DEMO"
  );
}
