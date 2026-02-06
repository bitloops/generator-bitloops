"use client";

import { useRouter as useNextNavigationRouter } from 'next/navigation';
import type { Router } from '@/lib/router/types';

export function useNextRouter(): Router {
  const nextRouter = useNextNavigationRouter();

  return {
    push: (url: string) => nextRouter.push(url),
    replace: (url: string) => nextRouter.replace(url),
    back: () => nextRouter.back(),
  };
}
