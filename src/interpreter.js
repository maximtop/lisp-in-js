import { show } from './show';
import { parse } from './parser';
import { evalRec, Env } from './evaluator';

// TODO [maximtop] make this expression to throw error: (1 / 22)
const globalEnv = new Env({});

export const interpreter = (input) => {
  const parseResult = parse(input);
  return show(evalRec(parseResult, globalEnv));
};
