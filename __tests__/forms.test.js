import {
  BOStor, BO, BP, BPStor, SF, SFStor, keywordValue, valueKeyword,
} from '../src/forms';

test('keywordValue', () => {
  expect(keywordValue['+'] instanceof BO).toBeTruthy();
  expect(keywordValue['+'] === BOStor.ADD).toBeTruthy();
  expect(keywordValue['-'] instanceof BO).toBeTruthy();
  expect(keywordValue['-'] === BOStor.SUB).toBeTruthy();
  expect(keywordValue['>'] instanceof BP).toBeTruthy();
  expect(keywordValue['>'] === BPStor.GT).toBeTruthy();
  expect(keywordValue['<'] instanceof BP).toBeTruthy();
  expect(keywordValue['<'] === BPStor.LT).toBeTruthy();
  expect(keywordValue.print instanceof SF).toBeTruthy();
  expect(keywordValue.print === SFStor.PRINT).toBeTruthy();
  expect(keywordValue.read instanceof SF).toBeTruthy();
  expect(keywordValue.read === SFStor.READ).toBeTruthy();
});

test('valueKeyword', () => {
  expect(valueKeyword[BOStor.ADD] === '+').toBeTruthy();
  expect(valueKeyword[BOStor.SUB] === '-').toBeTruthy();
  expect(valueKeyword[BPStor.GT] === '>').toBeTruthy();
  expect(valueKeyword[BPStor.LT] === '<').toBeTruthy();
  expect(valueKeyword[SFStor.PRINT] === 'print').toBeTruthy();
  expect(valueKeyword[SFStor.READ] === 'read').toBeTruthy();
});
