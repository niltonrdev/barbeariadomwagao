import { Geist, Playfair_Display } from "next/font/google";
import "./globals.css";
import { BarbeariaProvider } from "@/lib/store";
import DemoNav from "@/components/DemoNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata = {
  title: "Dom Wagão Barbearia",
  description:
    "Sistema de fila em tempo real, cadastro de clientes, gestão de cortes e pagamentos da Dom Wagão Barbearia.",
};

export const viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="bg-vinheta min-h-full flex flex-col">
        <BarbeariaProvider>
          {children}
          <DemoNav />
        </BarbeariaProvider>
      </body>
    </html>
  );
}
