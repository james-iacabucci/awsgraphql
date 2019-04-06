import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import Amplify from 'aws-amplify'
import config from './aws-exports'

Amplify.configure({
  ...config, 
  'aws_appsync_authenticationType' : 'AMAZON_COGNITO_USER_POOLS'
})

ReactDOM.render(<App />, document.getElementById('root'));

serviceWorker.register();
