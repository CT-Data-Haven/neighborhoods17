import React from 'react';

const Download = (props) => {
  return (
    <p>
      <strong>
        <a href={`https://github.com/CT-Data-Haven/2017acs/blob/master/to_distribute/${props.city}_acs_basic_neighborhood_2017.csv`}>View this data</a>
      </strong> or right-click ('Save as...')
      <strong>
        <a href={`https://raw.githubusercontent.com/CT-Data-Haven/2017acs/master/to_distribute/${props.city}_acs_basic_neighborhood_2017.csv`}> here </a>
      </strong> to download
    </p>
  );
};

export default Download;
