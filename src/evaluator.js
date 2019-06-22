import {
  ConsList, isNull, car, cdr, isString, cons, nil,
} from './helpers';
import {
  BO, BOStor, BP, valueKeyword, BPStor, Symb, SF, SFStor, Lambda,
} from './forms';
import { show } from './show';

export class Env {
  constructor(frame, parent) {
    this.frame = frame;
    this.parent = parent;
  }

  setVar(key, value) {
    let env = this;
    while (env) {
      if (Object.prototype.hasOwnProperty.call(env.frame, key)) {
        env.frame[key] = value;
        break;
      }
      env = env.parent;
    }
  }

  getVar(key, str) {
    let env = this;
    while (env) {
      if (Object.prototype.hasOwnProperty.call(env.frame, key)) {
        return env.frame[key];
      }
      env = env.parent;
    }
    return str instanceof Symb ? str : new Symb(key);
  }

  defVar(key, value) {
    this.frame[key] = value;
  }
}

const getBody = (obj) => {
  if (obj instanceof Function && !isNull(obj) && isNull(cdr(obj))) {
    return car(obj);
  }
  return obj;
};

const getMapNamesValues = (names, forms, env, evalFlag) => {
  const map = {};
  while (!isNull(names) && !isNull(forms)) {
    let value;
    if (isNull(cdr(names)) && !isNull(cdr(forms))) {
      if (evalFlag) {
        const m = evalListToArr(forms, env);
        value = nil;
        m.forEach((x) => {
          value = cons(x, value);
        });
      } else {
        value = forms;
      }
    } else {
      value = evalFlag ? evalRec(car(forms), env) : car(forms);
    }
    map[car(names).value] = value;
    names = cdr(names);
    forms = cdr(forms);
  }
  return map;
};

const objectEvalToSymbolName = (obj, env) => {
  if (obj instanceof Symb) {
    return obj.value;
  }
  if (typeof obj === 'string' || obj instanceof String) {
    return obj;
  }
  const str = show(evalRec(obj, env));
  return str[0] === '"' || str[str.length - 1] === '"' ? str.substring(1, str.length - 1) : str;
};

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

export const foldBO = (operation, operands, env) => {
  if (isNull(operands)) {
    throw new Error(`no operands for arithmetic operation: ${valueKeyword[operation]}`);
  }
  let result = evalRec(car(operands), env);
  let tail = cdr(operands);
  while (!isNull(tail)) {
    result = applyBO(operation, result, evalRec(car(tail), env));
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

export const foldBP = (operation, operands, env) => {
  if (isNull(operands)) {
    return true;
  }
  let a = evalRec(car(operands), env);
  let tail = cdr(operands);
  while (!isNull(tail)) {
    const middle = evalRec(car(tail), env);
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

const evalListToArr = (obj, env) => {
  const arr = [];
  while (!isNull(obj)) {
    arr.push(evalRec(car(obj), env));
    obj = cdr(obj);
  }
  return arr;
};

const symbolNil = new Symb('nil');

export const evalRec = (obj, env) => {
  if (obj instanceof Symb) {
    return env.getVar(obj.value, obj);
  }
  if (obj instanceof ConsList) {
    if (isNull(obj)) {
      return obj;
    }

    let tail = cdr(obj);
    const head = evalRec(car(obj), env);
    if (head instanceof BO) {
      return foldBO(head, tail, env);
    }

    if (head instanceof BP) {
      return foldBP(head, tail, env);
    }

    if (head instanceof SF) {
      if (head === SFStor.DEF || head === SFStor.SET) {
        while (!isNull(tail) && !isNull(cdr(tail))) {
          const symb = objectEvalToSymbolName(car(tail), env);
          const val = evalRec(car(cdr(tail)), env);
          if (head === SFStor.DEF) {
            env.defVar(symb, val);
          } else {
            env.setVar(symb, val);
          }
          tail = cdr(cdr(tail));
        }
        return symbolNil;
      }
      if (head === SFStor.GET) {
        const symb = car(tail);
        return env.getVar(objectEvalToSymbolName(symb, env), symb);
      }
      if (head === SFStor.QUOTE) {
        return car(tail);
      }

      if (head === SFStor.TYPEOF) {
        return getTypeName(evalRec(car(tail), env));
      }

      if (head === SFStor.CONS) {
        const arr = evalListToArr(tail, env);
        let v = nil;
        let lst = true;
        arr.reverse().forEach((x) => {
          v = lst && (x instanceof ConsList) ? x : cons(x, v);
          lst = false;
        });
        return v;
      }

      if (head === SFStor.CAR) {
        const a = evalRec(car(tail), env);
        return a instanceof ConsList ? car(a) : a;
      }

      if (head === SFStor.CDR) {
        const a = evalRec(car(tail), env);
        return a instanceof ConsList ? cdr(a) : nil;
      }

      if (head === SFStor.COND) {
        while (!isNull(tail) && !isNull(cdr(tail))) {
          if (evalRec(car(tail), env)) {
            return evalRec(car(cdr(tail)), env);
          }
          tail = (cdr(cdr(tail)));
        }
        return isNull(tail) ? nil : evalRec(car(tail), env);
      }

      if (head === SFStor.PRINT || head === SFStor.READ) {
        const arr = evalListToArr(tail, env);
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
        return evalRec(evalRec(car(tail), env));
      }

      if (head === SFStor.LAMBDA) {
        return new Lambda(car(tail), getBody(cdr(tail)), env);
      }

      throw new Error(`unrecognized special form "${head}"`);
    }
    if (head instanceof Lambda) {
      return evalRec(head.body, new Env(getMapNamesValues(head.args, tail, env, true), head.env));
    }
    let val = head;
    while (!isNull(tail)) {
      val = evalRec(car(tail), env);
      tail = cdr(tail);
    }
    return val;
  }
  return obj;
};
