/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// Starlight resolves these virtual modules at build time via its Vite plugin.
// They are untyped in this Starlight version, so declare them for `astro check`
// in our SiteTitle override. Kept loose on purpose: we only read a few fields.
declare module 'virtual:starlight/user-config' {
  const config: {
    logo?: { alt?: string; replacesTitle?: boolean; src?: string };
    [key: string]: unknown;
  };
  export default config;
}

declare module 'virtual:starlight/user-images' {
  type Img = { src: string; width: number; height: number } | undefined;
  export const logos: { dark?: Img; light?: Img };
}

// The release script exposes the version as a Vite define.
interface ImportMetaEnv {
  readonly UPMO_VERSION: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
