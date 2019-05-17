import React, { Component } from 'react';
import { Button, Input, Modal, Badge, Icon, Card, Divider, Form } from 'antd';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Subscription, compose, graphql } from 'react-apollo';
import {
    JOIN_ROOM_MUTATION
} from '../apollo/qms';
import {
    // ROOM_QUERY,
    // INVITE_TO_ROOM_MUTATION,
    // ROOM_INVITED_SUBSCRIPTION, 
    MESSAGE_SUBSCRIPTION
} from '../apollo/chatGroup/qms';
// COMPONENTS
import ChatRoom from '../components/ChatRoom';
import UserList from '../components/home/UserList';
import ContactMeChatBox from '../components/ContactMeChatBox';


class ChatPrivatePage extends Component {
    state = {
        userId: null,
        userName: 'GUEST_USER',
        roomId: null,
        roomTitle: 'HELLO',
        groupId: 'GUEST_USER',
        sendTo: {
            receiver: {
                roomId: ['ADMIN'],
                groupId: ['ADMIN']
            }
        },
        listenTo: {
            sender: {
                roomId: ['ROOM_GUEST'],
                groupId: ['ADMIN']
            },
            receiver: {
                roomId: ['ROOM_GUEST'],
                groupId: ['GUEST_USER']
            }
        }
    };

    componentWillMount() {
        // CHECK SESSION STORAGE
        let guest_session = sessionStorage.getItem('chat_guest_user');
        let guest_data = {
            userId: null,
            userName: 'GUEST_' + moment(Date.now()).format('HH:mm:ss'),
            isNew: true
        };
        if(guest_session){
            guest_session = JSON.parse(guest_session);
            this.setState({
                userId: guest_session.userId,
                userName: guest_session.userName,
                roomId: `ROOM_${guest_session.userId}`
            });
            guest_data = {
                userId: guest_session.userId,
                userName: guest_session.userName,
                isNew: false
            };
        }

        // JOIN ROOM
        const { joinRoom } = this.props;

        joinRoom && joinRoom({ variables: { ...guest_data } })
            .then(res => {
                const guest = {
                    userId: _.get(res, 'data.joinRoom.userId'),
                    userName: _.get(res, 'data.joinRoom.userName')
                };

                this.setState(
                    {
                        userId: guest.userId,
                        userName: guest.userName,
                        roomId: `ROOM_${guest.userId}`
                    },
                    () => {
                        sessionStorage.setItem('chat_guest_user', JSON.stringify(guest));
                    }
                );
            });
    }

    handleMessageReceive = msg => {
        if(msg.sender.userId !== this.state.userId){
            this.setState({ roomTitle: msg.sender.userName });
        }
    }

    render() {
        const { userId, userName, roomId, roomTitle, groupId, sendTo, listenTo } = this.state;
        const sender = { userId, userName, roomId, groupId };

        if(!userId){
            return null;
        }
        
        return (
            <div className='msg-info-area'>
                <Card>
                    <Form>
                        <table className='msg-info-table'>
                            <thead>
                                <tr>
                                    <th colSpan={2}>User Info</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th>User ID</th>
                                    <th>{userId}</th>
                                </tr>
                                <tr>
                                    <th>User Name</th>
                                    <td>
                                        <Input 
                                            value={userName} 
                                            placeholder='User Name' 
                                            onChange={e => this.setState({ userName: e.target.value })}
                                            onBlur={e => {
                                                e.persist();
                                                const value = e.target.value;
                                                this.setState(state => {
                                                    if(value && value.trim()){
                                                        return({ userName: value });
                                                    }
                                                    return({ userName: 'GUEST_USER' });
                                                });
                                            }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th>User Room ID</th>
                                    <td>
                                        <Input 
                                            value={roomId} 
                                            placeholder='User Room ID' 
                                            onChange={e => this.setState({ roomId: e.target.value })}
                                            onBlur={e => {
                                                e.persist();
                                                const value = e.target.value;
                                                this.setState(state => {
                                                    if(value && value.trim()){
                                                        return({ roomId: value });
                                                    }
                                                    return({ roomId: 'ROOM_GLOBAL' });
                                                });
                                            }}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Form>
                </Card>

                <ChatRoom 
                    title={roomTitle}
                    roomId={roomId}
                    sender={sender}
                    sendTo={sendTo}
                    listenTo={listenTo}
                    onMessageReceive={this.handleMessageReceive}
                />
            </div>
        );
    }
}


export default compose(
    graphql(JOIN_ROOM_MUTATION, { name: 'joinRoom' })
)(ChatPrivatePage);