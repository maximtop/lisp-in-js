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

const createStorage = (ClassName, keys) => {
  return keys.reduce((acc, key) => {
    return { ...acc, [key]: new ClassName(key) };
  }, {});
};

class Forms {
  constructor(key) {
    this.key = key;
  }
}

class BO extends Forms { }

class BP extends Forms { }

class SF extends Forms { }

const BOKeys = ['ADD', 'SUB', 'MUL', 'DIV', 'MOD', 'SCONCAT'];
const BOStor = createStorage(BO, BOKeys);

const BPKeys = ['GT', 'GTE', 'LT', 'LTE', 'EQ', 'NOEQ'];
const BPStor = createStorage(BP, BPKeys);

const SFKeys = ['DEF', 'SET', 'GET', 'QUOTE', 'TYPEOF', 'CONS', 'CAR', 'CDR', 'COND', 'PRINT', 'READ',
  'EVAL', 'EVALIN', 'LAMBDA', 'MACRO', 'MACROEXPAND'];
const SFStor = createStorage(SF, SFKeys);

const keywordValue = {
  '+': BOStor.ADD,
  '-': BOStor.SUB,
  '*': BOStor.MUL,
  '/': BOStor.DIV,
  mod: BOStor.MOD,
  '++': BOStor.SCONCAT,
  '>': BPStor.GT,
  '>=': BPStor.GTE,
  '<': BPStor.LT,
  '<=': BPStor.LTE,
  '=': BPStor.EQ,
  '/=': BPStor.NOEQ,
  def: SFStor.DEF,
  'set!': SFStor.SET,
  get: SFStor.GET,
  quote: SFStor.QUOTE,
  typeof: SFStor.TYPEOF,
  cons: SFStor.CONS,
  car: SFStor.CAR,
  cdr: SFStor.CDR,
  cond: SFStor.COND,
  print: SFStor.PRINT,
  read: SFStor.READ,
  eval: SFStor.EVAL,
  'eval-in': SFStor.EVALIN,
  lambda: SFStor.LAMBDA,
  macro: SFStor.MACRO,
  macroexpand: SFStor.MACROEXPAND,
};

const valueKeyword = Object.keys(keywordValue).reduce((acc, key) => {
  const objProp = keywordValue[key].key;
  return { ...acc, [objProp]: key };
}, {});

class Symb {
  constructor(value) {
    this.value = value;
  }
}

const parseList = (inputStr) => {
  const str = inputStr.trim();
  if (!str || str.length <= 0) {
    throw new Error('closing ")" is absent');
  } else if (str[0] === ')') {
    return [nil, str.substring(1)];
  }

  const [x, ss] = prs(str); // eslint-disable-line no-use-before-define
  const [t, zz] = parseList(ss);
  return [cons(x, t), zz];
};

const limitOutput = inputString => (
  inputString.length > 20
    ? `${inputString.substring(0, 20)}...`
    : inputString
);

const parseValue = (str) => {
  if (str === 'true') {
    return true;
  }
  if (str === 'false') {
    return false;
  }
  if (str in keywordValue) {
    return keywordValue[str].key;
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
    return parseList(rest);
  }
  if (first === ')') {
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
  } else if (first === '\'') {
    const [x, ss] = prs(rest);
    return [cons(SF.QUOTE, cons(x, nil)), ss];
  } else {
    const regex = /\s|\(|\)|"|;|$/m;
    const match = str.match(regex);
    const index = match === null ? str.length : match.index;
    return [parseValue(str.substring(0, index)), str.substring(index)];
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
  if (input in valueKeyword) {
    return valueKeyword[input];
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
