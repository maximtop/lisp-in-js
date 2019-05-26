import { evalRec } from '../src/evaluator';
import { cons } from '../src/helpers';
import { parse } from '../src/parser';
import { show } from '../src/show';

describe('evalRec', () => {
  it('returns empty list if input is empty list', () => {
    const emptyList = cons(null, null);
    expect(evalRec(emptyList)).toBe(emptyList);
  });

  it('applies binary operations (BO) correctly', () => {
    expect(evalRec(parse('(+ 1 2)'))).toBe(3);
    expect(evalRec(parse('(- 0 1)'))).toBe(-1);
    expect(evalRec(parse('(+ 1 2 3)'))).toBe(6);
    expect(evalRec(parse('(/ 4 2 1)'))).toBe(2);
    expect(evalRec(parse('(++ 1 2 3)'))).toBe('123');
    expect(evalRec(parse('(++ a b c)'))).toBe('abc');
    expect(evalRec(parse('(++ "test" "test")'))).toBe('testtest');
    expect(() => {
      evalRec(parse('(+)'));
    }).toThrow(new Error('no operands for arithmetic operation: +'));
  });

  it('applies binary predicates (BP) correctly', () => {
    expect(evalRec(parse('(< 1 2)'))).toBe(true);
    expect(evalRec(parse('(< 1 2 3)'))).toBe(true);
    expect(evalRec(parse('(> 1 2 3)'))).toBe(false);
    expect(evalRec(parse('(= (1 2) (1 2))'))).toBe(true);
    expect(evalRec(parse('(= (1 2 (1 2)) (1 2 (1 2)))'))).toBe(true);
    expect(evalRec(parse('(= (1 2 (1)) (1 2 (1 2)))'))).toBe(false);
    // expect(evalRec(parse('(/= (1 2) (2))'))).toBe(true); // TODO FIX this test
  });

  it('applies special forms (SF) correctly', () => {
    expect(evalRec(parse("typeof '(+ 1 2 3)"))).toBe('ConsList');
    expect(evalRec(parse('typeof (quote (+ 1 2 3))'))).toBe('ConsList');
    expect(evalRec(parse('typeof (+ 1 2 3)'))).toBe('number');

    expect(show(evalRec(parse('quote (+ 1 2 3)')))).toBe('(+ 1 2 3)');
    expect(show(evalRec(parse("'(+ 1 2 3)")))).toBe('(+ 1 2 3)');

    expect(show(evalRec(parse('cons 1 2')))).toBe('(1 2)');
    expect(show(evalRec(parse('cons 1 2 3')))).toBe('(1 2 3)');
    expect(show(evalRec(parse("cons 1 '(1 3) ()")))).toBe('(1 (1 3))');
  });
});
