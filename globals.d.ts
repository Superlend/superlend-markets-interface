// globals.d.ts
interface Window {
  gtag: (...args: any[]) => void;
  dataLayer: Record<string, any>[];
}
