import { queryOptions } from "@tanstack/react-query";
import { getHealth } from "../../api_client";

export const healthQueryOptions = () =>
  queryOptions({
    queryKey: ["health"],
    queryFn: ({ signal }) => getHealth(signal),
  });
