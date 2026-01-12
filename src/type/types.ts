export type Breadcrumb =
  | { type: "click"; ts: number; url: string; target: string }
  | { type: "route"; ts: number; from: string; to: string };

export type CapturedError = {
  source: "error" | "unhandledrejection";
  ts: number;
  url: string;
  message: string;
  stack?: string;
};

export type ErrorRecord = {
  id: string;
  host: string;
  capturedAt: number;
  error: CapturedError;
  breadcrumbs: Breadcrumb[];
  env: { ua: string; viewport: { w: number; h: number } };
};