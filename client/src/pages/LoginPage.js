import React, { Component } from 'react';
import { Form, Input, Icon, Button, Card, message } from 'antd';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
// GRAPHQL
const LOGIN_MUTATION = gql`
    mutation login($userId: String!, $password: String!) {
        login(userId: $userId, password: $password){
            token
            error
        }
    }
`;


export default class LoginPage extends Component {
    state = {
        userId: null,
        password: null
    };

    render() {
        const { userId, password } = this.state;

        return (
            <Mutation mutation={LOGIN_MUTATION}>
                {(login, { data, error, loading }) => {
                    return(
                        <Card title='Login'>
                            <Form className='login-form'>
                                <Form.Item>
                                    <Input 
                                        placeholder='Username'
                                        prefix={<Icon type='user' style={{ color: 'rgba(0,0,0,.25)' }} />}
                                        onChange={e => this.setState({ userId: e.target.value })}
                                        value={userId}
                                    />
                                </Form.Item>
                                <Form.Item>
                                    <Input 
                                        type='password'
                                        placeholder='Password'
                                        prefix={<Icon type='lock' style={{ color: 'rgba(0,0,0,.25)' }} />}
                                        onChange={e => this.setState({ password: e.target.value })}
                                        value={password}
                                    />
                                </Form.Item>
                                <Form.Item>
                                    <Button 
                                        type='primary'
                                        onClick={() => {
                                            this.setState({ userId: null, password: null });
                                            if(userId && userId.trim() && password && password.trim()){
                                                login({ variables: { userId, password } })
                                                .then(loginResponse => {
                                                    const token = loginResponse && loginResponse.data && loginResponse.data.login.token;
                                                    
                                                    if(token){
                                                        message.success('Login Successful');
                                                    }
                                                })
                                                .catch(err => console.log('ERROR', err));
                                            }
                                            else {
                                                message.error('Invalid Username and Password');
                                            }
                                        }}
                                    >
                                        Login
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    );
                }}
            </Mutation>
        )
    }
}
