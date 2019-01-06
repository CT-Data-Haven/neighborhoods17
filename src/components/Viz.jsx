import React from 'react';
import { Tab } from 'semantic-ui-react';

import VizStage from './VizStage';

import '../styles/Viz.css';

const width = 500;
const height = 420;

const Viz = (props) => {
  const panes = [
    {
      menuItem: {
        key: 'pane-map',
        icon: 'globe',
        content: 'Show map'
      },
      render: () => (
        <Tab.Pane key='pane-map'>
          <VizStage type='map'
            {...props}
            width={width}
            height={height}
            onClick={props.handleShape}
            colorscale={props.mapColors}
          />
      </Tab.Pane>
      )
    }, {
      menuItem: {
        key: 'pane-bar',
        icon: 'bar chart',
        content: 'Show chart'
      },
      render: () => (
        <Tab.Pane key='pane-bar'>
          <VizStage type='bar'
            {...props}
            width={width}
            height={height}
            onClick={props.handleBar}
            colorscale={props.barColors}
          />
      </Tab.Pane>
      )
    }
  ];

  return (
    <div className='Viz'>
      <Tab menu={{
        secondary: true,
        pointing: true,
        color: 'blue'
      }}
      panes={panes} />
    </div>
  );
};

export default Viz;
