import React from 'react';
import { Grid, Header, Icon } from 'semantic-ui-react';
import { scaleThreshold, scaleOrdinal } from 'd3-scale';
import { schemeGnBu } from 'd3-scale-chromatic';
import { ckmeans } from 'simple-statistics';
import * as _ from 'lodash';

import Filters from './components/Filters';
import Viz from './components/Viz';
import Profile from './components/Profile';
import DataTable from './components/DataTable';
import Intro from './components/Intro';
import Footer from './components/Footer';

import './App.css';

import cities from './data/routes.js';
import metaLong from './data/nhood_meta.json';
// import dataLong from './data/nhood_data.json';
import initData from './data/nhood_data_wide.json';

const shapes = {
  new_haven: require('./shapes/new_haven_topo.json'),
  bridgeport: require('./shapes/bridgeport_topo.json'),
  hartford: require('./shapes/hartford_topo.json'),
  stamford: require('./shapes/stamford_topo.json')
};

const nBrks = 5;
const palette = schemeGnBu[nBrks];
const barscheme = [ '#3fa0e0', '#8f8f8f', '#8f8f8f', '#8f8f8f' ];
const year = 2017;

const meta = _.groupBy(metaLong, 'topic');
// const initData = _.groupBy(firstData, 'city');
const citiesIdx = _.keyBy(cities, 'id');

// FUNCTIONS
const firstNeighborhood = (city) => (
  _.chain(initData[city][0].data)
    .filter({ geoType: '1_neighborhood'})
    .map('name')
    .first()
    .value()
);

const fetchIndicators = (topic) => (
  // _.filter(meta[topic], { type: 'map' })
  _.chain(meta[topic])
    .toArray()
    .filter({ type: 'map' })
    .value()
);

const firstIndicator = (topic) => (
  fetchIndicators(topic)[0].indicator
);

const reset = {
  city: cities[0].id,
  nhood: firstNeighborhood(cities[0].id),
  topic: _.keys(meta)[0],
  indicator: firstIndicator(_.keys(meta)[0])
};

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      topicData: [],
      fetch: [],
      isAscending: true,
      sortCol: 'name',
      ...reset
    };
  }

  componentDidMount() {
    let { city, topic, indicator } = this.state;
    let opts = { city, topic, indicator };
    this.update({ ...opts });
  }

  update(opts) {
    let fetch = this.fetchData(opts);

    this.setState({
      indicator: opts.indicator,
      fetch,
      // topicData
    });
  }

  fetchData({ city, topic }) {
    return _.find(initData[city], { topic: topic });
  }

  // takes fetch
  toTopic(fetched, topic) {
    let out = _.map(fetched, (d, i) => {
        let metaVals = _.chain(meta[topic]).find({ indicator: d.indicator }).omit([ 'order', 'suborder' ]).value();
        return ({ ...metaVals, ...d });
      });
    return out;
  }

  // takes fetch
  toIndicator(fetched, indicator) {
    return _.chain(fetched.data)
      .flatMap((d, i) => ({
        name: d.name,
        geoType: d.geoType,
        value: d[indicator]
      }))
      .sortBy('value')
      .value();
  }

  // takes indicatorData
  toMap(byIndicator) {
    return _.chain(byIndicator)
      .filter({ geoType: '1_neighborhood' })
      .keyBy('name')
      .value();
  }


  ///////// scales
  makeMapScale(data) {
    let vals = _.map(data, 'value').sort((a, b) => a - b);
    if (!vals.length) {
      return scaleThreshold().domain([0, 1]).range(['#ccc']);
    } else {
      let brks = ckmeans(vals, nBrks).map((d) => d[0]).slice(1);
      return scaleThreshold()
        .domain(brks)
        .range(palette);
    }
  }

  makeBarScale(data) {
    let geos = _.map(data, 'geoType').sort();
    return scaleOrdinal()
      .domain(geos)
      .range(barscheme);
  }

  ////////// event handlers
  handleSelect = (e, { name, value }) => {
    if (name === 'city') {
      this.setState({
        nhood: firstNeighborhood(value),
        city: value
      });
    }
    let indicator = name === 'topic' ? fetchIndicators(value)[0].indicator : this.state.indicator;
    let { city, topic } = this.state;
    let opts = { city, topic, indicator };

    this.update({ ...opts, [name]: value });

    this.setState({
      [name]: value
    });
  };

  handleShape = (e) => {
    let name = e.target.feature.properties.name;
    this.setState({
      nhood: name
    });
  };

  handleBar = ({ column }) => {
    let name = column.name;
    this.setState({
      nhood: name
    });
  };

  handleRowClick = (name) => {
    this.setState({
      nhood: name
    });
  };

  handleTableSort = (column) => () => {
    let isAscending = _.isNull(this.state.isAscending) ? true : !this.state.isAscending;
    this.setState({
      sortCol: column,
      isAscending
    });
  };

  render() {
    let indicators = fetchIndicators(this.state.topic);
    let displayIndicator = _.find(indicators, { indicator: this.state.indicator }).displayIndicator;
    let topicMeta = meta[this.state.topic];
    // all indicators
    let table = _.chain(this.state.fetch.data)
      .map((d, i) => _.omit(d, 'geoType', 'town'))
      .sortBy(this.state.sortCol)
      .value();
    let profile = _.find(table, { name: this.state.nhood });
    // one indicator
    let indicatorData = this.toIndicator(this.state.fetch, this.state.indicator);
    let mapData = this.toMap(indicatorData);

    let mapColors = this.makeMapScale(mapData);
    let barColors = this.makeBarScale(indicatorData);

    // get format of current indicator
    let fmt = _.find(topicMeta, { indicator: this.state.indicator }).format;

    return (
      <div className="App">
        <Grid container stackable>
          <Grid.Row>
            <Header as='h1'><Icon name='home' /> Neighborhood Profile: {citiesIdx[this.state.city].title}</Header>
          </Grid.Row>
          <Grid.Row>
            <Intro />
          </Grid.Row>

          <Grid.Row>
            <Grid.Column>
              <Filters
                topic={this.state.topic}
                indicator={this.state.indicator}
                city={this.state.city}
                meta={meta}
                indicators={indicators}
                cities={cities}
                onChange={this.handleSelect} />
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column width={10}>
              <Viz
                indicator={this.state.indicator}
                displayIndicator={displayIndicator}
                indicatorData={indicatorData}
                mapData={mapData}
                shapes={shapes}
                city={this.state.city}
                nhood={this.state.nhood}
                mapColors={mapColors}
                barColors={barColors}
                handleShape={this.handleShape}
                handleBar={this.handleBar}
                fmt={fmt}
                year={year} />
            </Grid.Column>
            <Grid.Column width={6}>
              <Profile
                data={profile}
                topicMeta={_.keyBy(topicMeta, 'indicator')}
                displayTopic={topicMeta[0].displayTopic}
              />
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column>
              <DataTable
                data={this.state.isAscending ? table : table.reverse()}
                meta={topicMeta}
                nhood={this.state.nhood}
                handleClick={this.handleRowClick}
                handleSort={this.handleTableSort}
                isAscending={this.state.isAscending}
                sortCol={this.state.sortCol}
              />
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Footer city={this.state.city} />
          </Grid.Row>
        </Grid>

      </div>
    );
  }
}
