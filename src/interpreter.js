import { show } from './show';
import { parse } from './parser';

export const interpreter = (input) => {
  const result = parse(input);
  return show(result);
};
