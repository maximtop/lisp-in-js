import { show } from './show';
import { parse } from './parser';
import { evalRec } from './evaluator';

// TODO [maximtop] make this expression to throw error: (1 / 22)
export const interpreter = (input) => {
  const parseResult = parse(input);
  return show(evalRec(parseResult));
};
