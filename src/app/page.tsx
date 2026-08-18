import { TimerScreen } from "@/components/TimerScreen";

/*
 * A página é só a casca da rota: a tela de verdade mora em components/.
 * Isso mantém o padrão do projeto — páginas montam, componentes fazem.
 */
export default function TimerPage() {
  return <TimerScreen />;
}
