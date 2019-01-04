import { format } from 'd3-format';
import * as _ from 'lodash';

const percent = (d) => (
  format('.0%')(d)
);

const comma = (d) => (
  format(',')(d)
);

const sort = (a, b) => {
  return 1;
};

const trunc = (x) => {
  const maxChar = 20;

  if (x) {
    return x.length > maxChar ? x.substring(0, maxChar) + '...' : x;
  }

};

// const cleanVal = (d, fmt) => (
//   d ? fmt(d) : 'N/A'
// );
const cleanVal = (d, fmt) => {
  if (_.isNull(d)) {
    return 'N/A';
  } else {
    return fmt ? format(fmt)(d) : d;
  }
};

export { percent, comma, sort, trunc, cleanVal };
