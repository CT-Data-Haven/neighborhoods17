import React from 'react';
import { Header } from 'semantic-ui-react';
import { componentFromProp } from 'recompose';

import BarChart from './BarChart';
import MapContainer from './MapContainer';

import '../styles/VizStage.css';

const ChartComponent = componentFromProp('component');

const chartHash = { bar: BarChart, map: MapContainer };

const VizHeader = ({ displayIndicator, year }) => (
  <Header as='h2'>{displayIndicator} by neighborhood, {year}</Header>
);

const VizStage = (props) => (
    <div className="VizStage">
      <VizHeader {...props} />
      <ChartComponent component={chartHash[props.type]} {...props} />
    </div>
);

export default VizStage;
