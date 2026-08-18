import type { Metadata } from "next";
import { Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
import { Petals } from "@/components/Petals";
import { TimerEffects } from "@/components/TimerEffects";
import { Topbar } from "@/components/Topbar";
import { SettingsProvider } from "@/state/settings";
import { TasksProvider } from "@/state/tasks";
import "@/styles/tokens.css";
import styles from "./layout.module.css";

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
 * Roda antes do primeiro paint para o tema certo já nascer aplicado, sem
 * piscar o tema errado: primeiro tenta a preferência salva nos ajustes;
 * sem ela (ou com ela em "system"), cai no tema do sistema operacional.
 * Depois da hidratação, o efeito do SettingsProvider assume o controle.
 */
const themeInit = `(function () {
  var theme = "system";
  try {
    var saved = JSON.parse(localStorage.getItem("hibi.settings.v1"));
    if (saved && (saved.theme === "gofun" || saved.theme === "sumi")) theme = saved.theme;
  } catch (e) {}
  if (theme === "system") {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "sumi" : "gofun";
  }
  document.documentElement.dataset.theme = theme;
})();`;

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
        <SettingsProvider>
          <TasksProvider>
            <TimerEffects />
            <Petals />
            <div className={styles.frame}>
              <div className={styles.card}>
                <Topbar />
                <main>{children}</main>
              </div>
            </div>
          </TasksProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
