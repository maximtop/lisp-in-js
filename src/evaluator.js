import {
  ConsList, isNull, car, cdr, isString, cons, nil,
} from './helpers';
import {
  BO, BOStor, BP, valueKeyword, BPStor, Symb, SF, SFStor,
} from './forms';
import { show } from './show';

export const applyBO = (op, a, b) => {
  switch (op) {
    case BOStor.ADD:
      return a + b;
    case BOStor.SUB:
      return a - b;
    case BOStor.MUL:
      return a * b;
    case BOStor.DIV:
      return a / b;
    case BOStor.MOD:
      return a % b;
    case BOStor.SCONCAT: {
      const resA = isString(a) ? a : show(a);
      const resB = isString(b) ? b : show(b);
      return `${resA}${resB}`;
    }
    default:
      return null;
  }
};

export const foldBO = (operation, operands) => {
  if (isNull(operands)) {
    throw new Error(`no operands for arithmetic operation: ${valueKeyword[operation]}`);
  }
  let result = evalRec(car(operands));
  let tail = cdr(operands);
  while (!isNull(tail)) {
    result = applyBO(operation, result, evalRec(car(tail)));
    tail = cdr(tail);
  }
  return result;
};

const isEqual = (a, b) => {
  if (typeof a !== typeof b) {
    return false;
  }
  if (a instanceof Symb) {
    return a.value === b.value;
  }
  if (a instanceof ConsList) {
    while (!isNull(a) && !isNull(b)) {
      if (!isEqual(car(a), car(b))) {
        return false;
      }
      a = cdr(a);
      b = cdr(b);
    }
    return isNull(a) && isNull(b);
  }
  return a === b;
};

export const applyBP = (op, a, b) => {
  switch (op) {
    case BPStor.GT:
      return a > b;
    case BPStor.GTE:
      return a >= b;
    case BPStor.LT:
      return a < b;
    case BPStor.LTE:
      return a <= b;
    case BPStor.EQ:
      return isEqual(a, b);
    case BPStor.NOEQ:
      return !isEqual(a, b);
    default:
      return null;
  }
};

export const foldBP = (operation, operands) => {
  if (isNull(operands)) {
    return true;
  }
  let a = evalRec(car(operands));
  let tail = cdr(operands);
  while (!isNull(tail)) {
    const middle = evalRec(car(tail));
    if (!applyBP(operation, a, middle)) {
      return false;
    }
    a = middle;
    tail = cdr(tail);
  }
  return true;
};

const getTypeName = (obj) => {
  if (obj instanceof ConsList) {
    return 'ConsList';
  }
  return typeof obj;
};

const evalListToArr = (obj) => {
  const arr = [];
  while (!isNull(obj)) {
    arr.push(evalRec(car(obj)));
    obj = cdr(obj);
  }
  return arr;
};

const symbolNil = new Symb('nil');

export const evalRec = (obj) => {
  if (obj instanceof ConsList) {
    if (isNull(obj)) {
      return obj;
    }

    let tail = cdr(obj);
    const head = evalRec(car(obj));
    if (head instanceof BO) {
      return foldBO(head, tail);
    }

    if (head instanceof BP) {
      return foldBP(head, tail);
    }

    if (head instanceof SF) {
      if (head === SFStor.QUOTE) {
        return car(tail);
      }

      if (head === SFStor.TYPEOF) {
        return getTypeName(evalRec(car(tail)));
      }

      if (head === SFStor.CONS) {
        const arr = evalListToArr(tail);
        let v = nil;
        let lst = true;
        arr.reverse().forEach((x) => {
          v = lst && (x instanceof ConsList) ? x : cons(x, v);
          lst = false;
        });
        return v;
      }

      if (head === SFStor.CAR) {
        const a = evalRec(car(tail));
        return a instanceof ConsList ? car(a) : a;
      }

      if (head === SFStor.CDR) {
        const a = evalRec(car(tail));
        return a instanceof ConsList ? cdr(a) : nil;
      }

      if (head === SFStor.COND) {
        while (!isNull(tail) && !isNull(cdr(tail))) {
          if (evalRec(car(tail))) {
            return evalRec(car(cdr(tail)));
          }
          tail = (cdr(cdr(tail)));
        }
        return isNull(tail) ? nil : evalRec(car(tail));
      }

      if (head === SFStor.PRINT || head === SFStor.READ) {
        const arr = evalListToArr(tail);
        let str = '';
        arr.forEach((x) => {
          str += isString(x) ? x : show(x);
        });
        if (head === SFStor.PRINT) {
          console.log(str);
          return symbolNil;
        }
        throw new Error('READ is not implemented yet');

        // TODO [maximtop] figure out how to implement READ
      }

      if (head === SFStor.EVAL) {
        return evalRec(evalRec(car(tail)));
      }

      throw new Error(`unrecognized special form "${head}"`);
    }
    let val = head;
    while (!isNull(tail)) {
      val = evalRec(car(tail));
      tail = cdr(tail);
    }
    return val;
  }
  return obj;
};
