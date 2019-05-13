import interpreter from '../src';

test('interpreter', () => {
  expect(interpreter('(+ 1 2)')).toBe('(+ 1 2)');
});
