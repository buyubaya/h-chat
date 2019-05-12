import React, { Component } from 'react';
import { Button, Input, Modal, Badge, Icon } from 'antd';
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


class ChatPrivatePage extends Component {
    state = {
        userId: null,
        userName: null
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
                userName: guest_session.userName
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
                        userName: guest.userName
                    },
                    () => {
                        sessionStorage.setItem('chat_guest_user', JSON.stringify(guest));
                    }
                );
            });
    }

    render() {
        const { userId, userName } = this.state;
        const sender = { userId, userName };
        const sendTo = { groupId: 'ADMIN' };
        const listenTo = { roomId: ['ROOM_1', 'ROOM_2'] };

        if(!userId || !userName){
            return null;
        }

        return (
            <div>
                <ChatRoom 
                    title='HELLO'
                    sender={sender}
                    roomId={`ROOM_ADMIN`}
                    sendTo={sendTo}
                    listenTo={listenTo}
                />
            </div>
        );
    }
}


export default compose(
    graphql(JOIN_ROOM_MUTATION, { name: 'joinRoom' })
)(ChatPrivatePage);