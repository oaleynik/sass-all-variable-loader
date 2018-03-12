const path = require('path');
const fs = require('fs');
const loaderUtils = require('loader-utils');
const sassExtract = require('sass-extract');

const nodeModules = path.resolve(__dirname, '../node_modules');
const scssExtension = '.scss';

const importer = (url, prev) => {
  let file;
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
    path.resolve(path.dirname(file), `_${path.basename(file)}`),
  ];

  file = candidates.find(fn => fs.existsSync(fn));

  return {file};
};

function getVarValue(variable) {
  switch (variable.type) {
    case 'SassNumber':
      return `${variable.value}${variable.unit}`;
    case 'SassString':
    case 'SassBoolean':
      return variable.value;
    case 'SassNull':
      return null;
    case 'SassColor':
      return variable.value.a !== 1
        ? `rgba(${variable.value.r}, ${variable.value.g}, ${variable.value.b}, ${variable.value.a})`
        : variable.value.hex;
    case 'SassList':
      return variable.value.map(getVarValue).join(variable.separator);
    case 'SassMap':
      return toValues(variable.value);
    default:
      return variable;
  }
}

const toValues = (vars) =>
  Object.keys(vars)
        .reduce((result, k) => {
          result[k] = getVarValue(vars[k]);
          return result;
        }, {});

module.exports = function sassVariableInfoLoader(content) {
  this.cacheable();
  const options = Object.assign({}, loaderUtils.getOptions(this));
  const includePaths = [].concat([this.context], options.includePaths || []);

  const rendered = sassExtract.renderSync({
    // data: content,
    file: this.resourcePath,
    importer,
    includePaths,
  });

  return `module.exports = ${JSON.stringify(toValues(rendered.vars.global))};`;
};
