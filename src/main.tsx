import React from 'react';
import ReactDOM from 'react-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';

import { Map } from './components';

ReactDOM.render(
  <React.StrictMode>
    <div className="container pt-3">
      <Map />
    </div>
  </React.StrictMode>,
  document.getElementById('root'),
)
