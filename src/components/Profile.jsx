import React from 'react';
import { Header, Table } from 'semantic-ui-react';
import * as _ from 'lodash';
import { cleanVal } from './utils.js';

import '../styles/Profile.css';

const Profile = (props) => {
  let rows = _.isEmpty(props.data) ?
    // null :
    <Table.Row warning><Table.Cell>No data available</Table.Cell></Table.Row> :
    props.data.map((d, i) => (
      <Table.Row key={`row-${i}`} className={`list-${d.type}`}>
        <Table.Cell>{d.displayIndicator}</Table.Cell>
        <Table.Cell textAlign='right'>{cleanVal(d.value, d.format)}</Table.Cell>
      </Table.Row>
    )
  );

  return (
    <div className='Profile'>
      <Header as='h3' attached='top'>{props.topic} - {props.nhood}</Header>
      <Table definition attached compact unstackable>
        <Table.Body>{ rows }</Table.Body>
      </Table>
    </div>
  );
};

export default Profile;
