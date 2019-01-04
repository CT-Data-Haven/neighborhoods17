import React from 'react';
import { Table, Sticky } from 'semantic-ui-react';
import * as _ from 'lodash';
import { cleanVal } from './utils.js';

import '../styles/DataTable.css';

const DataTable = (props) => {
  let header, rows;

  if (_.keys(props.data).length) {
    let direction = props.isAscending ? 'ascending' : 'descending';

    // make header from first data point's unique indicators
    let firstHeader = { indicator: 'name', displayIndicator: 'Name' };
    let otherHeaders = _.chain(props.data)
      .values()
      .first()
      .map((d) => _.pick(d, [ 'indicator', 'displayIndicator' ]))
      .value();
    header = [ firstHeader, ...otherHeaders ].map((d, i) => (
      <Table.HeaderCell
        key={`tableheader-${d.indicator}`}
        onClick={props.handleSort}>{d.displayIndicator}</Table.HeaderCell>
    ));

    // console.log(_.sortBy(props.data, props.sortCol));

    rows = _.map(props.data, (d, i) => {
      let namecell = <Table.Cell key={`tablename-${i}`} textAlign='left'>{i}</Table.Cell>;
      let valcells = d.map((v, j) => (
        <Table.Cell key={`tablecell-${i}-${j}`} textAlign='right'>{cleanVal(v.value, v.format)}</Table.Cell>
      ));
      let cells = [namecell, ...valcells];
      return (
        <Table.Row key={`tablerow-${i}`}
          onClick={() => props.handleClick(i)}
          className={props.nhood === i ? 'hilite' : null}>{cells}</Table.Row>
      );
    });
  } else {
    header = null;
    rows = null;
  }

	return (
		<div className='DataTable'>
      <Table compact unstackable selectable sortable celled color='blue' size='small'>
        <Table.Header>
          <Table.Row>{header}</Table.Row>
        </Table.Header>
        <Table.Body>{rows}</Table.Body>
      </Table>
    </div>
	);
};

export default DataTable;
