import * as loaderUtils from 'loader-utils';
import * as webpack from 'webpack';
import { extractVariables } from './extractVariables';

export interface LoaderOptions extends loaderUtils.OptionObject {
  includePaths?: string[];
  camelCase?: boolean;
}

const loader: webpack.loader.Loader = function loader (): string {
  this.cacheable();

  const {
    includePaths = [],
    camelCase = false,
  } = loaderUtils.getOptions(this) as LoaderOptions;
  const filePath = this.context as string;
  includePaths.unshift(filePath);

  const variables = extractVariables(this.resourcePath,
    { includePaths, camelCase });

  return 'module.exports = ' + JSON.stringify(variables) + ';';
};

export default loader;
