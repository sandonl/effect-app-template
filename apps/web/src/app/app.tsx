import { HealthStatus } from "../features/health/health_status";
import styles from "./app.module.css";

export function App() {
  return (
    <main className={styles.shell}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Monorepo template</p>
        <h1>Vite meets Effect</h1>
        <p className={styles.description}>
          A small vertical slice connecting React, TanStack Query, an Effect
          HTTP contract, and a single server runtime.
        </p>
        <div className={styles.status}>
          <HealthStatus />
        </div>
      </section>
    </main>
  );
}
