export const treeItemStyles = `

  border:1px solid transparent;
  
 [data-name='Dots'] {
    transform: translate(0,0) !important;
  }
  
  &[data-hover='insert-above'] {
    border-top: 1px solid var(--color-blue-gray-50);
  }

  &[data-hover='insert-under'] {
    border-bottom: 1px solid var(--color-blue-gray-50);
  }

  &[data-hover='insert'] {
    background-color:var(--color-blue-gray-20);
  }`;
