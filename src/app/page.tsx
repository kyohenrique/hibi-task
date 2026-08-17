import styles from "./page.module.css";

/*
 * Página do timer. Por enquanto é um marcador de posição — a tela de
 * verdade (intenção, relógio, traço de progresso) chega na etapa 2.
 */
export default function TimerPage() {
  return (
    <section className={styles.stage}>
      <span className="eyebrow">timer</span>
      <p className={styles.placeholder}>em construção</p>
    </section>
  );
}
