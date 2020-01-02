import { Application } from "../../application";
// #document

export type HtmlAttrs = { innerHtml?: string } & {
  [x: string]: string;
};

export interface HtmlTag<TagNames = string> {
  tagName: TagNames;
  attrs?: HtmlAttrs;
}

export interface DocumentProps {
  appHtml: string;
  headTags: HtmlTag<"meta" | "link" | "script" | "style">[];
  bodyTags: HtmlTag<"script">[];
}

// #renderer

export interface AppDaTa {}

export interface RenderDocumentOptions {
  appData: AppDaTa;
  documentProps: DocumentProps;
}

export interface RenderAppOptions {
  appData: AppDaTa;
  documentProps: DocumentProps;
}

export interface BootstrapOptions<T = unknown> {
  hydrate?: boolean;
  App: T;
}

export type Bootstrap<T = unknown> = (options: BootstrapOptions<T>) => void;

export interface Runtime<T = unknown> {
  install(app: Application): void;

  renderDocument(Document: T, options: RenderDocumentOptions): string;

  renderApp(App: T, options: RenderAppOptions): string;

  getDocumentModulePath(): string;

  getBootstrapModulePath(): string;
}
