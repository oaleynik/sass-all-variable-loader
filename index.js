'use strict';

var path = require('path');
var fs = require('fs');
var loaderUtils = require('loader-utils');
var sassExtract = require('sass-extract');

var nodeModules = path.resolve(__dirname, '..');
var scssExtension = '.scss';

var importer = function importer(url, prev) {
  var file = void 0;
  if (url.match(/^~/)) {
    file = path.resolve(nodeModules, url.replace(/^[~\/\\]+/, ''));
  } else {
    file = path.resolve(path.dirname(prev), url);
  }

  if (file.slice(-scssExtension.length) !== scssExtension) {
    file += scssExtension;
  }

  var candidates = [file, path.resolve(path.dirname(file), '_' + path.basename(file))];

  file = candidates.find(function (fn) {
    return fs.existsSync(fn);
  });

  return { file: file };
};

function getVarValue(variable) {
  switch (variable.type) {
    case 'SassNumber':
      return '' + variable.value + variable.unit;
    case 'SassString':
    case 'SassBoolean':
      return variable.value;
    case 'SassNull':
      return null;
    case 'SassColor':
      return variable.value.a !== 1 ? 'rgba(' + variable.value.r + ', ' + variable.value.g + ', ' + variable.value.b + ', ' + variable.value.a + ')' : variable.value.hex;
    case 'SassList':
      return variable.value.map(getVarValue).join(variable.separator);
    case 'SassMap':
      return toValues(variable.value);
    default:
      return variable;
  }
}

function toValues(vars) {
  return Object.keys(vars).reduce(function (result, k) {
    result[k] = getVarValue(vars[k]);
    return result;
  }, {});
}

function sassAllVariableLoader(content) {
  this.cacheable();
  var options = Object.assign({}, loaderUtils.getOptions(this));
  var includePaths = [].concat([this.context], options.includePaths || []);

  var rendered = sassExtract.renderSync({
    // data: content,
    file: this.resourcePath,
    importer: importer,
    includePaths: includePaths
  });

  return 'module.exports = ' + JSON.stringify(toValues(rendered.vars.global)) + ';';
}

module.exports = sassAllVariableLoader;
