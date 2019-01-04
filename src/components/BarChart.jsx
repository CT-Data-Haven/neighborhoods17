import React from 'react';
import { ResponsiveOrdinalFrame } from 'semiotic';
import { sort, trunc, cleanVal } from './utils.js';

import '../styles/BarChart.css';

const hilite = '#e350a8';

const tooltip = (d, fmt) => (
  <div className='tooltip-content'>
    <p><strong>{d.name}: </strong>{cleanVal(d.value, fmt)}</p>
  </div>
);

// add hilite to color scale
const colorNhood = (d, nhood, scale) => (
  d.name === nhood ? hilite : scale(d.geoType)
);

const BarChart = (props) => {
  let axis = {
    tickFormat: (d) => cleanVal(d, props.fmt),
    ticks: 6,
    padding: 4
  };
  return (
    <div className='BarChart'>
      <ResponsiveOrdinalFrame
        data={props.indicatorData}
        size={[ props.width, props.height ]}
        responsiveWidth={true}
        responsiveHeight={false}
        oAccessor={(d) => trunc(d.name)}
        rAccessor={'value'}
        type={'bar'}
        projection={'horizontal'}
        rExtent={[ 0, undefined ]}
        margin={{ left: 120, top: 8, right: 20, bottom: 30 }}
        axis={axis}
        sortO={sort}
        style={(d) => ({
          opacity: 0.8,
          color: null,
          fill: colorNhood(d, props.nhood, props.colorscale)
        })}
        oPadding={6}
        oLabel={true}
        tooltipContent={(d) => tooltip(d.pieces[0], props.fmt)}
        hoverAnnotation={true}
        customClickBehavior={props.handleBar}
      />
    </div>
  )
};

  export default BarChart;
