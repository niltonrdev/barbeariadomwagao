# Dom Wagão Barbearia — Sistema de Fila e Gestão

Sistema web para a **Dom Wagão Barbearia**: cadastro de clientes via QR Code,
fila de atendimento em tempo real, registro de cortes, planos/assinaturas,
pagamentos (PIX e cartão) e comunicação automática com clientes.

> ⚠️ **Fase atual: DEMONSTRAÇÃO com dados fictícios.**
> Todos os dados são de exemplo e ficam salvos apenas no navegador
> (`localStorage`). Nenhum dado real ou pagamento verdadeiro é processado.
> A próxima fase troca o mock por banco de dados e gateway de pagamento reais.

## ✨ Funcionalidades da demonstração

### Cliente (celular — destino do QR Code)
- Entrada pelo telefone: quem já tem cadastro **entra**, quem não tem **se cadastra**.
- Cadastro rápido: nome, telefone, e-mail, nascimento, frequência de corte e aceite (LGPD).
- **Fila em tempo real** com posição e tempo de espera estimado.
- **Fidelidade**: a cada 10 cortes, 1 grátis.
- **Planos** (mensal/semestral/anual) e **pagamento avulso** via PIX (QR) ou cartão.
- Histórico de cortes e **avaliação** pós-atendimento.

### Barbeiro (tablet — Wagão, Leozinho e Walisson)
- Seleção do profissional e **fila ao vivo**.
- **Concluir corte**: serviço, produtos, forma de pagamento e valor.
- Resgate de **corte cortesia** (fidelidade).
- Resumo do dia: cortes, faturamento e **comissão** automática.

### Dono (Wagão — gestão)
- Faturamento do dia/mês, ticket médio e **desempenho por barbeiro**.
- Base de clientes, **aniversariantes do mês** e **clientes atrasados** (reativação).
- **Assinaturas ativas** e receita recorrente.
- **Central de mensagens** (WhatsApp) simulada: aniversário e reativação.

## 🔄 Tempo real entre telas

A sincronização entre as telas (celular do cliente e tablets dos barbeiros) é
simulada com `localStorage` + `BroadcastChannel`. Para ver funcionando, abra o
app em **duas abas/janelas**: entre na fila como cliente em uma e acompanhe/conclua
na tela do barbeiro na outra — a atualização é instantânea.

> No rodapé há um menu **"Trocar de tela"** para alternar entre Cliente,
> Barbeiro e Dono durante a apresentação, além de **Reiniciar a demonstração**.

## 🛠️ Tecnologias

- [Next.js 16](https://nextjs.org/) (App Router) + React 19
- Tailwind CSS v4
- JavaScript
- Deploy: [Vercel](https://vercel.com/)

## 🚀 Rodando localmente

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## ☁️ Publicando na Vercel

1. Suba o projeto para o GitHub.
2. Em [vercel.com](https://vercel.com/), importe o repositório.
3. A Vercel detecta o Next.js automaticamente — basta clicar em **Deploy**.

## 🗺️ Próximas fases (produção)

1. **Banco de dados real** (ex.: PostgreSQL no Supabase/Neon) + autenticação por telefone (OTP).
2. **Pagamentos reais** via gateway (Asaas, Mercado Pago ou Stripe) com cartão
   **tokenizado** e assinaturas recorrentes. O número do cartão nunca é
   armazenado no nosso servidor (boa prática de segurança / PCI).
3. **WhatsApp oficial** (Meta Cloud API) para aniversário, "sua vez" e reativação.
4. Ajustes de LGPD (política de privacidade e consentimento).

## 📁 Estrutura

```
app/
  page.js            # Entrada do cliente (QR → telefone)
  cadastro/          # Cadastro rápido
  cliente/           # Área do cliente (fila, planos, histórico)
  barbeiro/          # Painel do barbeiro (tablet)
  admin/             # Painel do dono (gestão)
components/          # Logo, navegação da demo, pagamento, etc.
lib/
  mockData.js        # Dados fictícios
  store.js           # Estado global + sincronização em tempo real
  format.js          # Utilitários (moeda, datas, regras)
```
