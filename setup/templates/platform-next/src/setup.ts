"use client";

import { setRouterImplementation } from '@/lib/router/useRouter';
import { useNextRouter } from './router/useNextRouter';

// Set up Next.js router implementation
setRouterImplementation(useNextRouter);
