# sass-all-variable-loader

> Loads sass files and extracts all variable declarations including
from the imported sass files.

[![npm version](https://badge.fury.io/js/sass-all-variable-loader.svg)](https://badge.fury.io/js/sass-all-variable-loader) [![dependencies](https://david-dm.org/milichev/sass-all-variable-loader.svg)](https://david-dm.org/milichev/sass-all-variable-loader) [![devDependecies](https://david-dm.org/milichev/sass-all-variable-loader/dev-status.svg)](https://david-dm.org/milichev/sass-all-variable-loader#info=devDependencies)

## About

This webpack loader helps to get variable values from the SASS file
in the JavaScript file as a JSON object with the property names
corresponding to variable names.

## Installation

### npm

```
$ npm install --save-dev sass-all-variable-loader
```

### yarn

```
$ yarn add sass-all-variable-loader -D
```

## Usage

It's better to create a SASS file which imports all variable declaration
files you need. For example, `variables.scss`:

```
@import "./common-variables";
@import "./bootstrap-variables";
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
```

Suppose _bootstrap-variables.scss_ declares variables as follows:

```
$gray-800: #29363d;

$body-color: $gray-800;
```

Then declare a loader in your **webpack config**:

```
module.exports = {
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /variables\.scss/,
            use: [
              'sass-all-variable-loader',
            ]
          },
```

**Important thing: this entry should be _before_ any other .scss loaders.**

Then you can import variables in your .js/.ts file:

```
import * as reactstrap from 'reactstrap';
import styled from 'styled-components';

const variables = require('../../scss/variables.scss');

export const Pimpochka = styled(reactstrap.Button)`
  background-color: ${variables['$body-color']};
`;
```

If you don't want to declare a separate entry in webpack config, you
can import the sass file with the exclamation mark syntax:

```
import variables from '!!sass-all-variable-loader!./_variables.scss';
```

However I don't recommend it because it is weird and it breaks
navigation in your favorite IDE.

## Limitations

This loader was created because of critical limitations of similar ones
out there. For example
[sass-variable-loader](https://github.com/nordnet/sass-variable-loader)
can't handle any multiline statements or declarations such as sass maps
or functions. Even though this loader still has it's own limitations:

* The current implementation neglects the content from the previous
loaders, if any.
* The resulting map preserves the variable names (see usage example
above). If you need them _camelCased_, you are welcome to contribute.

## License

[MIT](LICENSE)
