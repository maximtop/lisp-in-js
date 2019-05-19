#!/usr/bin/env node

import readline from 'readline';
import interpreter from '..';

const { log } = console;
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const recursiveAsyncReadLine = () => {
  rl.question('>>> ', (input) => {
    if (input === ':q') {
      return rl.close();
    }
    try {
      log(interpreter(input));
    } catch (e) {
      console.log('PARSING ERROR: ', e);
      return rl.close();
    }
    recursiveAsyncReadLine();
  });
};

recursiveAsyncReadLine();
