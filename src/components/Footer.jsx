import React from 'react';
import { Image, Segment } from 'semantic-ui-react';

import src from '../img/25th-logotype.jpg';

const text = 'Source: DataHaven analysis (2018) of US Census Bureau American Community Survey 2017 5-year estimates.';

const Footer = (props) => (
  <div className='Footer'>
    <Segment secondary basic>
      <p>{text}</p>
      <p><strong><a href={`https://github.com/CT-Data-Haven/2017acs/blob/master/to_distribute/${props.city}_acs_basic_neighborhood_2017.csv`}>Download this data</a></strong></p>
      <Image src={src} size='small' as='a' href='http://www.ctdatahaven.org' />
    </Segment>
  </div>
);

export default Footer;
