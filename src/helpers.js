/**
 * Returns the pair
 * @param x
 * @param y
 * @return {function(*): *}
 */
export const cons = (x, y) => f => f(x, y);

/**
 * Returns car first argument of the pair
 * @param pair
 * @return {*}
 */
export const car = pair => pair(x => x);

/**
 * Returns cdr - second argument of the pair
 * @param pair
 * @return {*}
 */
export const cdr = pair => pair((_, y) => y);

export const nil = cons(null, null);

export const isNull = list => car(list) === null && cdr(list) === null;


export const limitOutput = inputString => (
  inputString.length > 20
    ? `${inputString.substring(0, 20)}...`
    : inputString
);
