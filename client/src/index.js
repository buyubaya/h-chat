import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.scss';
import { ApolloProvider } from 'react-apollo';
import client from './apollo/client';


ReactDOM.render(
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>,
    document.getElementById('app')
);


if (module.hot) {
    module.hot.accept();
}