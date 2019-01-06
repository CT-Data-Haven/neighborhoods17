import React from 'react';
import { Form } from 'semantic-ui-react';
import * as _ from 'lodash';

import '../styles/Filters.css';

const Filters = (props) => {
  const topics = _.chain(props.meta)
    .values()
    .map(_.toArray)
    .flattenDeep()
    .map((d, i) => _.pick(d, [ 'topic', 'displayTopic' ]))
    .uniqBy('topic')
    .value()
    .map((d) => ({
      key: d.topic,
      value: d.topic,
      text: d.displayTopic
    }));

  const indicators = props.indicators.map((d, i) => ({
    key: d.indicator,
    value: d.indicator,
    text: d.displayIndicator
  }));

  const cities = props.cities.map((d, i) => ({
    key: d.id,
    value: d.id,
    text: d.title
  }));

  return (
    <div className='Filters'>
      <Form>
        <Form.Group widths='equal'>
          <Form.Select id='citySelect'
            name='city'
            options={cities}
            value={props.city}
            onChange={props.onChange}
          label='City' />
          <Form.Select id='topicSelect'
            name='topic'
            options={topics}
            value={props.topic}
            onChange={props.onChange}
          label='Topic' />
          <Form.Select id='indicatorSelect'
            name='indicator'
            options={indicators}
            value={props.indicator}
            onChange={props.onChange}
          label='Indicator'/>
        </Form.Group>
      </Form>
    </div>
  );
};

export default Filters;
