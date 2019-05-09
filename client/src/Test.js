import React from 'react';
import './test.scss';
import Hello from './Hello';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';


class TestComponent extends React.Component {
    render(){
        console.log('TEST');

        return(
            <Router>
                <Switch>
                    <Route path='/' exact component={Hello} />
                    <Route path='/test' exact render={() => <h1>HELLO TEST</h1>} />
                </Switch>
            </Router>
        )
    }
}


export default TestComponent;