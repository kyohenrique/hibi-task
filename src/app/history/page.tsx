import styles from "./page.module.css";

/*
 * Página do histórico. Marcador de posição — a lista de tarefas com
 * status e durações chega na etapa 3.
 */
export default function HistoryPage() {
  return (
    <section className={styles.stage}>
      <span className="eyebrow">histórico</span>
      <p className={styles.placeholder}>em construção</p>
    </section>
  );
}
