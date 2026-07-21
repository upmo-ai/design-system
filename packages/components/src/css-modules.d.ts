// CSS modules import as a map of class names to generated strings.
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
