import React from 'react';
import { Header, Table } from 'semantic-ui-react';
import * as _ from 'lodash';
import { cleanVal } from './utils.js';

import '../styles/Profile.css';

const Profile = (props) => {
  let rows, name;
  if (props.data) {
    name = props.data.name;
    rows = _.chain(props.data)
      .omit('name')
      .map((d, i) => {
        let meta = props.topicMeta[i];
        let fmt = meta.format;
        return (
          <Table.Row key={`profile-${i}`}>
            <Table.Cell textAlign='left'>{meta.displayIndicator}</Table.Cell>
            <Table.Cell textAlign='right'>{cleanVal(d, fmt)}</Table.Cell>
          </Table.Row>
        );
      })
      .value();
  } else {
    name = null;
    rows = (<Table.Row warning><Table.Cell>No data available</Table.Cell></Table.Row>);
  }

  return (
    <div className='Profile'>
      <Header as='h3' attached='top'>{props.displayTopic} - {name}</Header>
      <Table definition attached compact unstackable size='small'>
        <Table.Body>{ rows }</Table.Body>
      </Table>
    </div>
  );
};

export default Profile;
