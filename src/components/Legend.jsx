import React from 'react';
import { LegendThreshold } from '@vx/legend';
import { cleanVal } from './utils.js';

import '../styles/Legend.css';

const Legend = (props) => {
  return (
    <div className='Legend'>
      <LegendThreshold
        scale={props.colorscale}
        labelFormat={(label) => label ? cleanVal(label, props.format) : ''}
      />
    </div>
  );
};

export default Legend;
