import * as camelCase from 'camelcase';
import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore
import * as sassExtract from 'sass-extract';
import { LoaderOptions } from './loader';

const nodeModules = path.resolve(
  process.cwd(),
  'node_modules'
);
const scssExtension = '.scss';

const importer = (url: string, prev: string): { file?: string } => {
  let file: string | undefined;
  if (url.match(/^~/)) {
    file = path.resolve(nodeModules, url.replace(/^[~\/\\]+/, ''));
  } else {
    file = path.resolve(path.dirname(prev), url);
  }

  if (file.slice(-scssExtension.length) !== scssExtension) {
    file += scssExtension;
  }

  const candidates = [
    file,
    path.resolve(path.dirname(file), '_' + path.basename(file)),
  ];

  file = candidates.find(fn => fs.existsSync(fn));

  return { file: file };
};

export type VariableType = 'SassNumber' | 'SassString' | 'SassBoolean' |
  'SassNull' | 'SassColor' | 'SassList' | 'SassMap';

export interface SassColor {
  r: number;
  g: number;
  b: number;
  a: number;
  hex: string;
}

export interface SassList extends ReadonlyArray<Variable> {}

export interface Variable {
  type: VariableType;
  value: VariableValue;
  unit: string;
  separator?: string;
}

export type VariableValue =
  number
  | string
  | boolean
  | null
  | SassColor
  | SassList
  | VariableMap;

export type CssValue = string | number | boolean | null;

export interface VariableMap<T = Variable> {
  [name: string]: T;
}

const getVarValue = (
  variable: Variable, camel: boolean): CssValue | VariableMap<CssValue> => {
  switch (variable.type) {
    case 'SassNumber':
      return `${variable.value}${variable.unit}`;
    case 'SassNull':
      return null;
    case 'SassColor':
      let color = variable.value! as SassColor;
      return color.a !== 1
        ? `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
        : color.hex;
    case 'SassList':
      return (variable.value as SassList)
        .map(o => getVarValue(o, camel))
        .join(variable.separator);
    case 'SassMap':
      return toValues(variable.value as VariableMap,
        camel) as VariableMap<CssValue>;
    case 'SassString':
    case 'SassBoolean':
    default:
      return variable.value as CssValue;
  }
};

const toValues = (variables: VariableMap, camel = false) => {
  return Object.keys(variables)
    .reduce(
      (result, k) => {
        const name = camel
          ? camelCase(k.replace(/^\$/, ''))
          : k;
        result[name] = getVarValue(variables[k], camel);
        return result;
      },
      {});
};

export const extractVariables = (
  file: string,
  {
    camelCase: camel,
    includePaths = [],
  }: LoaderOptions = {},
): VariableMap<CssValue> => {

  const rendered = sassExtract.renderSync({
    file,
    includePaths,
    importer,
  });

  return toValues(rendered.vars.global, camel);
};
