import React from 'react';
import * as topojson from 'topojson-client';
import { Map, TileLayer, GeoJSON, LayersControl, LayerGroup } from 'react-leaflet';
import * as turf from '@turf/turf';
import * as _ from 'lodash';
import { cleanVal } from './utils.js';
import Legend from './Legend';

import '../styles/MapContainer.css';

const { Overlay } = LayersControl;

const cityStyle = {
	fillColor: 'transparent',
	color: '#333',
	weight: 1.5,
	pointerEvents: 'none'
};

export default class MapContainer extends React.Component {
	getBounds(geo) {
    let b = topojson.bbox(geo);
    return [[ b[1], b[0] ], [ b[3], b[2] ]];
  };

  getStyle = (feature) => {
    let name = feature.properties.name;
    let fillColor = this.props.mapData[name] ? this.props.colorscale(this.props.mapData[name].value) : '#ccc';
    return {
      fillColor,
      color: '#555',
      weight: 0.5,
      opacity: 1,
      fillOpacity: 0.75
    };
  };

  onEachFeature = (feature, layer) => {
    let name = feature.properties.name;
    layer.on('click', this.props.onClick)
      .on('mouseover', this.addHilite)
      .on('mouseout', this.removeHilite);
    layer.bindTooltip(() => {
			let val = this.props.mapData[name] ? this.props.mapData[name].value : null;
			return `${name}: ${cleanVal(val, this.props.fmt)}`;
    }, { direction: 'top', offset: [0, -20], className: 'custom-tip' });
  };

  addHilite = (e) => {
    e.target.setStyle({
      fillOpacity: 0.95,
      weight: 1
    });
  };

  removeHilite = (e) => {
    e.target.setStyle({
      fillOpacity: 0.75,
      weight: 0.5
    });
  };

	render() {
		let layers = _.chain(this.props.shapes)
			.map((d, i) => {
				let shp = topojson.feature(d, d.objects.city);
				// make mesh & merge to outline towns
				let mesh = topojson.mesh(d, d.objects.city, (a, b) => a.properties.town !== b.properties.town);
				let merge = topojson.merge(d, d.objects.city.geometries);
				return (
					<Overlay
						name={i}
						key={`maplayer-${i}`}
						checked={this.props.city === i}>
						<LayerGroup>
							<GeoJSON
								data={shp}
								key={(feature) => feature.properties.name}
								onEachFeature={(feature, layer) => this.onEachFeature(feature, layer)}
								style={this.getStyle}
							/>
							<GeoJSON
								data={mesh}
								style={cityStyle}
								interactive={false}
							/>
							<GeoJSON
								data={merge}
								style={cityStyle}
								interactive={false}
							/>
						</LayerGroup>
					</Overlay>
				);
			})
			.value();

		return (
			<div className='MapContainer'>
        <Map
					bounds={this.getBounds(this.props.shapes[this.props.city])}
          zoomSnap={0.25}
          zoomDelta={0.25}
          scrollWheelZoom={false}>
          <TileLayer
  					url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}.{ext}"
  					attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  					subdomains='abcd'
  					minZoom={11}
  					maxZoom={15}
  					ext='png'
  					opacity={0.4} />
					<LayersControl>{layers}</LayersControl>
				</Map>

				<Legend colorscale={this.props.colorscale} format={this.props.fmt} />
      </div>
		);
	}
};
