import React from 'react';
import { Image, Segment } from 'semantic-ui-react';
import Download from './Download';

import src from '../img/25th-logotype.jpg';

const text = 'Source: DataHaven analysis (2018) of US Census Bureau American Community Survey 2017 5-year estimates.';

const Footer = (props) => (
  <div className='Footer'>
    <Segment secondary basic>
      <p>{text}</p>

      <Download city={props.city} />
      <Image src={src} size='small' as='a' href='http://www.ctdatahaven.org' alt='DataHaven logo'/>
    </Segment>
  </div>
);

export default Footer;
