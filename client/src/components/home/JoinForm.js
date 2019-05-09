import React, { Component } from 'react';
// APOLLO
import { Query, Mutation, Subscription, graphql, compose } from 'react-apollo';
// ANTD
import {
    Comment, Avatar, Form, Button, List, Input, Alert, message, Icon, Card
} from 'antd';
// GRAPHQL
import { JOIN_ROOM_MUTATION } from '../../apollo/home/qms';


export default class JoinForm extends Component {
    state = {
        userName: null
    };

    render() {
        const { userName } = this.state;

        return (
            <Mutation mutation={JOIN_ROOM_MUTATION}>
                {(joinRoom, { data, error, loading }) => {
                    return (
                        <Card title='Chat with Us' style={{ width: 400, maxWidth: '100%', textAlign: 'center', margin:  '0 auto' }}>
                            <Form layout='inline'>
                                <Form.Item>
                                    <Input 
                                        placeholder="Your Name"
                                        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                        onChange={e => this.setState({ userName: e.target.value })} 
                                    />
                                </Form.Item>
                                <Form.Item>
                                    <Button 
                                        type='primary'
                                        loading={loading}
                                        onClick={() => {
                                            if(userName && userName.trim()){
                                                joinRoom({ variables: { userName } })
                                                .then(res => {
                                                    this.props.onJoinRoom && this.props.onJoinRoom(res);
                                                })
                                                .catch(err => message.error('Invalid Name'));
                                            }
                                            else {
                                                message.error('Invalid Name');
                                            }
                                        }}
                                    >
                                        Join Room
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
