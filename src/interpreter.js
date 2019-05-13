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

const nil = cons(null, null);

const isNull = list => car(list) === null && cdr(list) === null;

export const interpreter = input => input;
