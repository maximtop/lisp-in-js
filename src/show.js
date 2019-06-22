import { Symb, valueKeyword, Lambda } from './forms';
import { isNull, car, cdr } from './helpers';

export const show = (inputList) => {
  let input = inputList;
  if (inputList instanceof Function) {
    let result = '';
    while (!isNull(input)) {
      result = `${result} ${show(car(input))}`;
      input = cdr(input);
    }
    return `(${result.trim()})`;
  }
  if (input in valueKeyword) {
    return valueKeyword[input];
  }
  if (input instanceof Symb) {
    return input.value;
  }
  if (input instanceof Lambda) {
    return `(lambda ${show(inputList.args)} ${show(inputList.body)})`;
  }
  if (input instanceof Boolean || typeof input === 'boolean') {
    return input ? 'true' : 'false';
  }
  if (input instanceof String || typeof input === 'string') {
    return `"${input}"`;
  }
  return `${input}`;
};
