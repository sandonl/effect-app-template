import { Button } from "@repo/ui/button";
import { useQuery } from "@tanstack/react-query";
import { healthQueryOptions } from "./health_queries";
import styles from "./health_status.module.css";

export function HealthStatus() {
  const health = useQuery(healthQueryOptions());

  if (health.isPending) {
    return <p className={styles.pending}>Checking the API…</p>;
  }

  if (health.isError) {
    return (
      <div className={styles.error} role="alert">
        <p>The API could not be reached.</p>
        <Button onClick={() => void health.refetch()}>Try again</Button>
      </div>
    );
  }

  return (
    <p className={styles.healthy}>
      <span className={styles.indicator} aria-hidden="true" />
      API status: {health.data.status}
    </p>
  );
}
