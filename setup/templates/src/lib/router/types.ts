export interface Router {
  push: (url: string) => void;
  replace: (url: string) => void;
  back: () => void;
}
