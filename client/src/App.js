import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import ChatGroupPage from './pages/ChatGroupPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';


export default class App extends Component {
    render() {
        return (
            <Router>
                <Switch>
                    <Route path='/chat-group' exact component={ChatGroupPage} />
                    <Route path='/login' exact component={LoginPage} />
                    <Route path='/' exact component={HomePage} />
                </Switch>
            </Router>
        )
    }
};