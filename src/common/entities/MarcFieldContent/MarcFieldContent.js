// returns an array of subfields in the same order as in content string
// '$a valueA1 $a value A2 $b valueB' -> [{ '$a': 'valueA1' }, { '$a': 'valueA2' }, { '$b': 'valueB' }]

export const getContentSubfieldValueArr = (content = '') => {
  return content.split(/\$/)
    .filter(str => str.length > 0)
    .reduce((acc, str) => {
      if (!str) {
        return acc;
      }

      const key = `$${str[0]}`;
      const value = str.substring(2).trim();

      return [...acc, { code: key, value }];
    }, []);
};

const reduceArr = (arr) => {
  return arr.reduce((acc, cur) => {
    const { code, value } = cur;
    const reducedValues = acc[code];

    if (reducedValues) {
      return {
        ...acc,
        [code]: [...reducedValues, value],
      };
    }

    return {
      ...acc,
      [code]: [value],
    };
  }, {});
};

export class MarcFieldContent {
  constructor(content) {
    this.content = content || '';

    this.subfieldsArr = getContentSubfieldValueArr(this.content);

    // Proxy allows to define generic property getters
    return new Proxy(this, this);
  }

  map(callback) {
    return this.subfieldsArr.map(callback);
  }

  reduce(...args) {
    return this.subfieldsArr.reduce(...args);
  }

  forEach(callback) {
    return this.subfieldsArr.forEach(callback);
  }

  join() {
    return this.subfieldsArr.reduce((acc, cur) => {
      return `${acc} ${cur.code} ${cur.value}`;
    }, '').trim();
  }

  append(code, value) {
    this.subfieldsArr.push({ code, value });

    return this; // return this to be able to chain together method calls
  }

  prepend(code, value) {
    this.subfieldsArr.unshift({ code, value });

    return this;
  }

  removeByCode(code) {
    this.subfieldsArr = this.subfieldsArr.filter(subfield => subfield.code !== code);

    return this;
  }

  findAllByCode(code) {
    return this.subfieldsArr.filter(subfield => subfield.code === code);
  }

  get(target, property) {
    // should be able to get array of subfields by calling marcFieldContent['$a']
    if (property.match(/\$\w$/)) {
      return reduceArr(target.findAllByCode(property))[property];
    }

    return target[property];
  }
}
