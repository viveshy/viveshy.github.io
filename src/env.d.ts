/**
 * `@rollup/plugin-yaml` resolves these at build time, but TypeScript needs
 * to be told they exist. Consumers narrow the shape with their own local
 * interfaces (see Nav.astro and SocialLinks.astro).
 */
declare module '*.yaml' {
	const data: any;
	export default data;
}
