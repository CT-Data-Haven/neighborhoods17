import React from 'react';
import { Grid, Divider, Header, Icon, Tab } from 'semantic-ui-react';
import { scaleThreshold, scaleOrdinal } from 'd3-scale';
import { schemeGnBu } from 'd3-scale-chromatic';
import { ckmeans } from 'simple-statistics';
import * as topojson from 'topojson-client';
import * as _ from 'lodash';

import Filters from './components/Filters';
import Viz from './components/Viz';
import Profile from './components/Profile';
import DataTable from './components/DataTable';
import Intro from './components/Intro';

import './App.css';

import cities from './data/routes.js';
import metaLong from './data/nhood_meta.json';
import dataLong from './data/nhood_data.json';

const shpAll = require('./shapes/topo_all.json');
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
const initData = _.groupBy(dataLong, 'city');
const citiesIdx = _.keyBy(cities, 'id');

// FUNCTIONS
const firstNeighborhood = (city) => (
  _.chain(initData[city])
    .map('data')
    .first()
    .find({ geoType: '1_neighborhood' })
    .value().name
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
    return _.filter(initData[city], { topic: topic });
  }

  // takes fetch
  toTopic(fetched, topic) {
    return _.map(fetched, (d, i) => {
        let metaVals = _.chain(meta[topic]).find({ indicator: d.indicator }).omit([ 'order', 'suborder' ]).value();
        return ({ ...metaVals, ...d });
      });
  }

  // takes topicData
  toIndicator(byTopic, indicator) {
    return _.chain(byTopic)
      .filter({ indicator: indicator })
      .flatMap('data')
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

  // takes topicData
  // redo: wide data, keys are indicators
  toTable(byTopic) {
    console.log(byTopic);
    let out = _.chain(byTopic)
      .flatMap((d, i) => {
        let metaVals = _.omit(d, 'data');
        return d.data.map((v) => ({ ...metaVals, ...v }));
      })
      .groupBy('name')
      .value();
    return out;
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

    // lots of different shapes of data
    // all indicators
    let topicData = this.toTopic(this.state.fetch, this.state.topic);
    let table = this.toTable(topicData);
    let profile = table[this.state.nhood];
    // one indicator
    let indicatorData = this.toIndicator(topicData, this.state.indicator);
    let mapData = this.toMap(indicatorData);

    let mapColors = this.makeMapScale(mapData);
    let barColors = this.makeBarScale(indicatorData);

    // get format of current indicator
    let fmt = _.find(meta[this.state.topic], { indicator: this.state.indicator }).format;

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
                nhood={this.state.nhood}
                topic={meta[this.state.topic][0].displayTopic}
              />
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column>
              <DataTable
                data={table}
                nhood={this.state.nhood}
                handleClick={this.handleRowClick}
                handleSort={this.handleTableSort}
              />
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            {/*<Footer />*/}
          </Grid.Row>
        </Grid>

      </div>
    );
  }
}
