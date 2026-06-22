// Ambient declaration for troika-three-text, which ships no types of
// its own (no `types` field, no bundled .d.ts, no @types package).
//
// drei's <Text> depends on troika-three-text transitively; we import
// its `configureTextBuilder` directly (the canonical way to set global
// troika options) in components/constellation-3d.tsx to disable
// web-worker typesetting under Turbopack. Only the surface we actually
// use is declared here — keep it minimal.
declare module 'troika-three-text' {
  export function configureTextBuilder(config: {
    /** Run typesetting in a web worker. Defaults to true. */
    useWorker?: boolean;
    sdfGlyphSize?: number;
    sdfMargin?: number;
    sdfExponent?: number;
    textureWidth?: number;
    unicodeFontsURL?: string;
  }): void;
}
