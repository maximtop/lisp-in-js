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

const enrichObj = (obj, props) => {
  props.forEach((prop) => {
    obj[prop] = prop;
  });
};

class BinaryOperations {}
const BO = new BinaryOperations();
const propsBO = ['ADD', 'SUB', 'MUL', 'DIV', 'MOD', 'SCONCAT'];
enrichObj(BO, propsBO);

class BinaryPredicates {}
const BP = new BinaryPredicates();
const propsBP = ['GT', 'GTE', 'LT', 'LTE', 'EQ', 'NOEQ'];
enrichObj(BP, propsBP);

class SpecialForms {}
const SF = new SpecialForms();
const propsSF = ['DEF', 'SET', 'GET', 'QUOTE', 'TYPEOF', 'CONS', 'CAR', 'CDR', 'COND', 'PRINT', 'READ',
  'EVAL', 'EVALIN', 'LAMBDA', 'MACRO', 'MACROEXPAND'];
enrichObj(SF, propsSF);

const keyValuePairs = {
  '+': BO.ADD,
  '-': BO.SUB,
  '*': BO.MUL,
  '/': BO.DIV,
  mod: BO.MOD,
  '++': BO.SCONCAT,
  '>': BP.GT,
  '>=': BP.GTE,
  '<': BP.LT,
  '<=': BP.LTE,
  '=': BP.EQ,
  '/=': BP.NOEQ,
  def: SF.DEF,
  'set!': SF.SET,
  get: SF.GET,
  quote: SF.QUOTE,
  typeof: SF.TYPEOF,
  cons: SF.CONS,
  car: SF.CAR,
  cdr: SF.CDR,
  cond: SF.COND,
  print: SF.PRINT,
  read: SF.READ,
  eval: SF.EVAL,
  'eval-in': SF.EVALIN,
  lambda: SF.LAMBDA,
  macro: SF.MACRO,
  macroexpand: SF.MACROEXPAND,
};

const valueKeyPairs = Object.keys(keyValuePairs).reduce((acc, key) => {
  const objProp = keyValuePairs[key];
  return { ...acc, [objProp]: key };
}, {});

class Symb {
  constructor(value) {
    this.value = value;
  }
}

const prsList = (inputStr) => {
  const str = inputStr.trim();
  if (!str || str.length <= 0) {
    throw new Error('closing ")" is absent');
  } else if (str[0] === ')') {
    return [nil, str.substring(1)];
  }

  const [x, ss] = prs(str); // eslint-disable-line no-use-before-define
  const [t, zz] = prsList(ss);
  return [cons(x, t), zz];
};

const limitOutput = inputString => (
  inputString.length > 20
    ? `${inputString.substring(0, 20)}...`
    : inputString
);

const prsVal = (str) => {
  if (str === 'true') {
    return true;
  }
  if (str === 'false') {
    return false;
  }
  if (str in keyValuePairs) {
    return keyValuePairs[str];
  }

  let result = parseFloat(str);
  if (Number.isNaN(result)) {
    result = new Symb(str);
  }
  return result;
};

const prs = (inputStr) => {
  const str = inputStr.trim();
  if (!str || str.length <= 0) {
    return [nil, ''];
  }
  const first = str.substring(0, 1);
  const rest = str.substring(1);
  if (first === '(') {
    return prsList(rest);
  } if (first === ')') {
    throw new Error(`extra closed ")" : ${limitOutput(str)}`);
  } else if (first === '"') {
    const pos = rest.indexOf('"');
    if (pos !== -1) {
      return [rest.substring(0, pos), rest.substring(pos + 1)];
    }
    throw new Error('closing \'"\' is absent: ', limitOutput(str));
  } else if (first === ';') {
    const pos = rest.indexOf(';');
    if (pos !== -1) {
      return [rest.substring(0, pos), rest.substring(pos)];
    }
    throw new Error('closing ";"  is absent: ', limitOutput(str));
  } else if (first === "'") {
    const [x, ss] = prs(rest);
    return [cons(SF.QUOTE, cons(x, nil)), ss];
  } else {
    const regex = /\s|\(|\)|"|;|$/m;
    const match = str.match(regex);
    const index = match === null ? str.length : match.index;
    return [prsVal(str.substring(0, index)), str.substring(index)];
  }
};

const parse = (inputString) => {
  const [x, ss] = prs(inputString);
  if (!ss || ss.trim().length <= 0) {
    return x;
  }
  const [y, zz] = prs(`(${ss})`);
  if (!zz || zz.trim().length <= 0) {
    return cons(x, y);
  }
  throw new Error('extra symbols: ', limitOutput(zz));
};

const show = (inputList) => {
  let input = inputList;
  if (inputList instanceof Function) {
    let result = '';
    while (!isNull(input)) {
      result = `${result} ${show(car(input))}`;
      input = cdr(input);
    }
    return `(${result.trim()})`;
  }
  if (input in valueKeyPairs) {
    return valueKeyPairs[input];
  }
  if (input instanceof Symb) {
    return input.value;
  }
  if (input instanceof Boolean || typeof input === 'boolean') {
    return input ? 'true' : 'false';
  }
  if (input instanceof String || typeof input === 'string') {
    return `"${input}"`;
  }
  return `${input}`;
};

export const interpreter = (input) => {
  const result = parse(input);
  return show(result);
};
