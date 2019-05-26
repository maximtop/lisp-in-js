import { parse } from '../src/parser';
import { show } from '../src/show';

const parseAndShow = (str) => {
  const parseResult = parse(str);
  return show(parseResult);
};

describe('interpreter', () => {
  it('parses simple expressions', () => {
    expect(parseAndShow('(+ 1 2)')).toBe('(+ 1 2)');
    expect(parseAndShow("'(+ 1 2)")).toBe('(quote (+ 1 2))');
    expect(parseAndShow('1 2 3')).toBe('(1 2 3)');
  });

  it('parses expressions with comments', () => {
    const str = '1 2 3 ; 4 5 6 ; 7 8 9';
    expect(parseAndShow(str)).toBe('(1 2 3 7 8 9)');
  });

  it('parses expressions with quotes', () => {
    const str = '1 2 3 " 4 5 6 " 7 8 9';
    expect(parseAndShow(str)).toBe('(1 2 3 " 4 5 6 " 7 8 9)');
  });

  it('parses nested expressions with quotes', () => {
    const str = '(1 2 3 (4 5 6) 7 ((8) 9))';
    expect(parseAndShow(str)).toBe('(1 2 3 (4 5 6) 7 ((8) 9))');
  });
});
