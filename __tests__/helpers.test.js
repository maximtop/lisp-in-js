import { cons, car, cdr } from '../src/helpers';

test('cons, car, cdr', () => {
  const a = 1;
  const b = 2;
  const pair = cons(1, 2);
  expect(car(pair)).toBe(a);
  expect(cdr(pair)).toBe(b);
});
