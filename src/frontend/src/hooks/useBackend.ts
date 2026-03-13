import type { backendInterface } from "../backend";
/**
 * Convenience hook that returns the backend actor directly.
 * Returns null while actor is initializing.
 */
import { useActor } from "./useActor";

export function useBackend(): {
  actor: backendInterface | null;
  isFetching: boolean;
} {
  return useActor();
}
