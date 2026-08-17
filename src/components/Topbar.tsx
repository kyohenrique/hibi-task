import Link from "next/link";
import styles from "./Topbar.module.css";

/*
 * Barra superior presente em todas as páginas: a marca 日々 (hibi, "dia a
 * dia") à esquerda e a navegação à direita. É um Server Component — não
 * tem estado nem interatividade própria, então não precisa de "use client".
 */
export function Topbar() {
  return (
    <header className={styles.topbar}>
      <Link href="/" className={styles.wordmark} lang="ja">
        日々
      </Link>
      <nav className={styles.nav}>
        <Link href="/">timer</Link>
        <Link href="/history">histórico</Link>
      </nav>
    </header>
  );
}
