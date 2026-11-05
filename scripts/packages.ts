// The @upmo-ai packages that release in lockstep, in publish order:
// dependencies before dependents. The release workflow lists the same names in
// its publish loop; scripts/test/release.test.ts fails when the two differ.
export const PACKAGES = ['tokens', 'icons', 'brands', 'brand', 'theme', 'components'] as const;
export const PKG_NAMES: string[] = PACKAGES.map((p) => `@upmo-ai/${p}`);
