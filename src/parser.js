import { cons, limitOutput, nil } from './helpers';
import { keywordValue, SFStor, Symb } from './forms';

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

const parseValue = (str) => {
  if (str === 'true') {
    return true;
  }
  if (str === 'false') {
    return false;
  }
  if (str in keywordValue) {
    return keywordValue[str];
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
      return prs(rest.substring(pos + 1));
      // return [rest.substring(0, pos), rest.substring(pos)];
    }
    throw new Error('closing ";"  is absent: ', limitOutput(str));
  } else if (first === '\'') {
    const [x, ss] = prs(rest);
    return [cons(SFStor.QUOTE, cons(x, nil)), ss];
  } else {
    const regex = /\s|\(|\)|"|;|$/m;
    const match = str.match(regex);
    const index = match === null ? str.length : match.index;
    return [parseValue(str.substring(0, index)), str.substring(index)];
  }
};

export const parse = (inputString) => {
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
