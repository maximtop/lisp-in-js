const createStorage = (ClassName, keys) => {
  return keys.reduce((acc, key) => {
    return { ...acc, [key]: new ClassName(key) };
  }, {});
};

class Forms {
  constructor(key) {
    this.key = key;
  }

  toString() {
    return this.key;
  }
}

export class BO extends Forms { }

export class BP extends Forms { }

export class SF extends Forms { }

const BOKeys = ['ADD', 'SUB', 'MUL', 'DIV', 'MOD', 'SCONCAT'];
export const BOStor = createStorage(BO, BOKeys);

const BPKeys = ['GT', 'GTE', 'LT', 'LTE', 'EQ', 'NOEQ'];
export const BPStor = createStorage(BP, BPKeys);

const SFKeys = ['DEF', 'SET', 'GET', 'QUOTE', 'TYPEOF', 'CONS', 'CAR', 'CDR', 'COND', 'PRINT', 'READ',
  'EVAL', 'EVALIN', 'LAMBDA', 'MACRO', 'MACROEXPAND'];
export const SFStor = createStorage(SF, SFKeys);

export const keywordValue = {
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

export const valueKeyword = Object.keys(keywordValue).reduce((acc, key) => {
  const objProp = keywordValue[key].key;
  return { ...acc, [objProp]: key };
}, {});

export class Symb {
  constructor(value) {
    this.value = value;
  }

  toString() {
    return this.value;
  }
}
