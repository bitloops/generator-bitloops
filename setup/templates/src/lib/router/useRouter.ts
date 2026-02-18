import type { Router } from './types';

// This will be implemented by platform-specific code
// The implementation will be injected at build time
let routerImplementation: (() => Router) | null = null;

export function setRouterImplementation(implementation: () => Router) {
  routerImplementation = implementation;
}

export function useRouter(): Router {
  if (!routerImplementation) {
    throw new Error(
      'Router implementation not set. Make sure to call setRouterImplementation in your platform setup.'
    );
  }
  return routerImplementation();
}
