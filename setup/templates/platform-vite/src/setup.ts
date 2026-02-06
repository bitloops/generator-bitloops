import { setRouterImplementation } from "@/lib/router/useRouter";
import { useViteRouter } from "./router/useViteRouter";

// Set up Vite/Storybook router implementation
setRouterImplementation(useViteRouter);
