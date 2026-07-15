import { useAtomRefresh, useAtomValue } from "@effect/atom-react";
import { Button } from "@repo/ui/button";
import { healthAtom } from "./health_atoms";
import styles from "./health_status.module.css";

export function HealthStatus() {
  const health = useAtomValue(healthAtom);
  const refreshHealth = useAtomRefresh(healthAtom);

  switch (health._tag) {
    case "Initial":
      return <p className={styles.pending}>Checking the API…</p>;
    case "Failure":
      return (
        <div className={styles.error} role="alert">
          <p>The API could not be reached.</p>
          <Button onClick={refreshHealth}>Try again</Button>
        </div>
      );
    case "Success":
      return (
        <p className={styles.healthy}>
          <span className={styles.indicator} aria-hidden="true" />
          API status: {health.value.status}
        </p>
      );
  }
}
