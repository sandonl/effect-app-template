import { useAtomRefresh, useAtomValue } from "@effect/atom-react";
import { Button } from "@repo/ui/button";
import { AsyncResult } from "effect/unstable/reactivity";
import { healthAtom } from "./health_atoms";
import styles from "./health_status.module.css";

export function HealthStatus() {
  const health = useAtomValue(healthAtom);
  const refreshHealth = useAtomRefresh(healthAtom);

  return AsyncResult.match(health, {
    onInitial: () => (
      <p className={styles.pending}>Checking the API…</p>
    ),
    onFailure: () => (
      <div className={styles.error} role="alert">
        <p>The API could not be reached.</p>
        <Button onClick={refreshHealth}>Try again</Button>
      </div>
    ),
    onSuccess: (success) => (
      <p className={styles.healthy}>
        <span className={styles.indicator} aria-hidden="true" />
        API status: {success.value.status}
      </p>
    ),
  });
}
