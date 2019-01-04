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

import './App.css';

import cities from './data/routes.js';
import metaLong from './data/nhood_meta.json';
import dataLong from './data/nhood_data.json';

// all cities in one topojson
const shpAll = require('./shapes/topo_all.json');
const shapes = {
  new_haven: require('./shapes/new_haven_topo.json'),
  bridgeport: require('./shapes/bridgeport_topo.json'),
  hartford: require('./shapes/hartford_topo.json'),
  stamford: require('./shapes/stamford_topo.json')
};

const nBrks = 5;
const palette = schemeGnBu[nBrks];
const barscheme = [ '#32a7f5', '#8f8f8f', '#8f8f8f', '#8f8f8f' ];
const year = 2017;

// metadata: object indexed by topic
// initData: object indexed by city in order to pull data for one city easily, e.g. initData['new_haven']
const meta = _.chain(metaLong)
  .groupBy('topic')
  // .mapValues((d) => _.keyBy(d, 'indicator'))
  .value();
const initData = _.groupBy(dataLong, 'city');
const citiesIdx = _.keyBy(cities, 'id');
console.log(_.filter(dataLong, { topic: 'age' }));

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
      topic: reset.topic,
      indicator: reset.indicator,
      city: reset.city,
      nhood: reset.nhood,
      topicData: [],
      tableData: [],
      indicatorData: [],
      mapData: [],
      mapColors: null,
      barColors: null
    };
  }

  componentDidMount() {
    let { city, topic, indicator } = this.state;
    let opts = { city, topic, indicator };
    this.update({ ...opts });
  }

  fetchData({ city, topic }) {
    // will be filtered for indicator
    // console.log(initData[city]);
    return _.filter(initData[city], { topic: topic });
  }

  update(opts) {
    let fetch = this.fetchData(opts);
    // console.log(fetch);
    // let topicData = this.toTopic(fetch, opts.topic);
    // let indicatorData = _.sortBy(topicData[opts.indicator], 'value');
    // let mapData = this.toMap(indicatorData);
    let topicData = this.toTopic(fetch, opts.topic);
    let indicatorData = this.toIndicator(topicData, opts.indicator);
    let mapData = this.toMap(indicatorData);
    // console.log('update - topicData', topicData);

    this.setState({
      indicator: opts.indicator,
      indicatorData,
      topicData,
      mapData,
      mapColors: this.makeMapScale(mapData),
      barColors: this.makeBarScale(indicatorData)
    });
  }

  toMap(data) {
    // object of data arrays for neighborhoods only, indexed by name
    return _.chain(data)
      .filter({ geoType: '1_neighborhood' })
      .keyBy('name')
      .value();
  }

  toTopic(data, topic) {
    // array of objects including data array
    let out = _.map(data, (d, i) => {
      console.log(d);
      return _.chain(d)
        .assignIn(_.pick(meta[topic][d.indicator], [ 'displayIndicator', 'format' ]))
        .value();
    });
    // return _.map(data, (d, i) => (
    //   _.chain(d)
    //     // .pick([ 'indicator', 'data' ])
    //     .assignIn(_.omit(meta[topic][d.indicator], [ 'order', 'suborder' ]))
    //     .value()
    // ));
    return out;
  }

  toIndicator(data, indicator) {
    // array of objects for only this indicator
    // console.log('toIndicator', _.chain(data).map('data').flattenDeep().filter({indicator: 'share_ages0_17'}).value());
    return _.chain(data)
      .flatMap('data')
      .filter({ indicator: indicator })
      .sortBy('value')
      .value();
  }

  toTable(data) {
    return _.chain(data)
      .flatMap((d, i) => (
        _.flatMap(d.data, (v) => _.assignIn(v, _.omit(d, 'data')))
      ))
      .groupBy('name')
      .value();
  }

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

  handleBar = (e) => {
    console.log(e);
  };

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


  render() {
    let indicators = fetchIndicators(this.state.topic);
    let displayIndicator = _.find(indicators, { indicator: this.state.indicator }).displayIndicator;

    // experiment
    // let toTable = this.toProfile(this.state.topicData);
    // let toProfile = _.mapValues(toTable, (d, i) => {
    //   return _.find(d, { name: this.state.nhood });
    // });
    // console.log(this.state.topicData);
    // console.log(toTable);
    // console.log(toProfile);
    let table = this.toTable(this.state.topicData);
    let profile = table[this.state.nhood];
    ////////////
    // console.log('indicators', indicators);
    console.log('state', this.state);

    return (
      <div className="App">
        <Grid container stackable>
          <Grid.Row>
            <Header as='h1'><Icon name='home' /> Neighborhood Profile: {citiesIdx[this.state.city].title}</Header>
          </Grid.Row>
          <Grid.Row>
            {/*<Intro />*/}
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
                indicatorData={this.state.indicatorData}
                mapData={this.state.mapData}
                shapes={shapes}
                city={this.state.city}
                mapColors={this.state.mapColors}
                barColors={this.state.barColors}
                handleShape={this.handleShape}
                handleBar={this.handleBar}
                year={year} />
            </Grid.Column>
            <Grid.Column width={6}>
              <Profile
                data={profile}
                nhood={this.state.nhood}
                topic={
                  // meta[this.state.topic][0].displayTopic
                  'dummy'
                }
              />
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column>
              <DataTable
                data={this.state.topicData}
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
