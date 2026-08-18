import type { Metadata } from "next";
import { Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
import { Topbar } from "@/components/Topbar";
import { TasksProvider } from "@/state/tasks";
import "@/styles/tokens.css";

/*
 * Fontes via next/font em vez de <link> para o Google Fonts: o Next baixa
 * os arquivos no build e os serve do nosso próprio domínio, o que elimina
 * o piscar de troca de fonte e a dependência de terceiros em runtime.
 *
 * A opção `variable` faz cada fonte virar uma variável CSS no <html>
 * (--font-mincho / --font-gothic), que o tokens.css consome. `subsets`
 * controla só o que é pré-carregado; os glifos japoneses (日々) continuam
 * disponíveis, carregados sob demanda pelos unicode-ranges da fonte.
 */
const mincho = Shippori_Mincho({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mincho",
});

const gothic = Zen_Kaku_Gothic_New({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-gothic",
});

export const metadata: Metadata = {
  title: "Hibi Task",
  description: "Timer de tarefas minimalista — tinta sobre papel.",
};

/*
 * Roda antes do primeiro paint para o tema certo já nascer aplicado,
 * sem piscar o tema errado. Por enquanto segue o sistema; na etapa dos
 * ajustes este script passará a priorizar a preferência salva do usuário.
 */
const themeInit = `document.documentElement.dataset.theme =
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "sumi" : "gofun";`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    /*
     * suppressHydrationWarning: o servidor renderiza o <html> sem
     * data-theme e o script acima o adiciona antes do React "acordar"
     * (hidratar). Sem essa prop, o React reclamaria da diferença entre o
     * HTML do servidor e o do navegador — que aqui é intencional e
     * limitada a este elemento.
     */
    <html
      lang="pt-BR"
      className={`${mincho.variable} ${gothic.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        {/*
          O provider é um Client Component, mas o que ele envolve continua
          sendo renderizado no servidor: Server Components podem ser
          passados como children de um Client Component sem "virar" client.
        */}
        <TasksProvider>
          <Topbar />
          <main>{children}</main>
        </TasksProvider>
      </body>
    </html>
  );
}
