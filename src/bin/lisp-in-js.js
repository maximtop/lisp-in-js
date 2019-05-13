#!/usr/bin/env node

import interpreter from '..';

console.log(interpreter((process.argv[process.argv.length - 1])));
