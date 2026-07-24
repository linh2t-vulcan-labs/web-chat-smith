export interface CssVariable {
  name: string;
  value: string;
}

export const toCssDeclaration = ({ name, value }: CssVariable): string =>
  `  ${name}: ${value};`;

export const toRootCssBlock = (variables: CssVariable[]): string => {
  const lines = [":root {"];

  for (const variable of variables) {
    lines.push(toCssDeclaration(variable));
  }

  lines.push("}");

  return `${lines.join("\n")}\n`;
};
