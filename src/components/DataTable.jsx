import React from 'react';
import { Table } from 'semantic-ui-react';
import * as _ from 'lodash';
import { cleanVal } from './utils.js';

import '../styles/DataTable.css';

const DataTable = (props) => {
  let header, rows;
  if (props.data) {
    let direction = props.isAscending ? 'ascending' : 'descending';

    // need to handle names differently since not in meta
    let firstHeader = { indicator: 'name', displayIndicator: 'Name' };
    let otherHeaders = props.meta.map((d, i) => _.pick(d, [ 'indicator', 'displayIndicator' ]));
    header = [ firstHeader, ...otherHeaders ].map((d, i) => (
      <Table.HeaderCell
        key={`tableheader-${d.indicator}`}
        onClick={props.handleSort(d.indicator)}
        sorted={d.indicator === props.sortCol ? direction : null}
      >
        {d.displayIndicator}</Table.HeaderCell>
      )
    );

    rows = props.data.map((d, i) => (
      <Table.Row key={`tablerow-${d.name}`}
        onClick={() => props.handleClick(d.name)}
        active={props.nhood === d.name}
        className={props.nhood === d.name ? 'hilite' : null}>
        { _.map(d, (v, j) => {
          let align = _.isNumber(v) ? 'right' : 'left';
          let fmt = j === 'name' ? null : _.find(props.meta, { indicator: j }).format;
          return (
            <Table.Cell
              key={`tablecell-${d.name}-${j}`}
              textAlign={align}>{cleanVal(v, fmt)}</Table.Cell>
          );
        }) }
      </Table.Row>
    ));
  } else {
    header = null;
    rows = null;
  }

  return (
		<div className='DataTable'>
      <Table compact fixed unstackable selectable sortable celled size='small'>
        <Table.Header>
          <Table.Row>{header}</Table.Row>
        </Table.Header>
        <Table.Body>{rows}</Table.Body>
      </Table>
    </div>
	);
};

export default DataTable;
