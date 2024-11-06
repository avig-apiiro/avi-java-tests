declare module '*.svg' {
  const content: string | keyof IntrinsicElements | ComponentType<any>;
  export default content;
}

declare module '*.png' {
  const content: string | keyof IntrinsicElements | ComponentType<any>;
  export default content;
}
