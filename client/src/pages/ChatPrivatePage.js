import React, { Component } from 'react';
import { Button, Input, Modal } from 'antd';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Subscription, compose, graphql } from 'react-apollo';
import {
    JOIN_ROOM_MUTATION
} from '../apollo/home/qms';
import {
    INVITE_TO_ROOM_MUTATION,
    ROOM_INVITED_SUBSCRIPTION, COMMENTS_SUBSCRIPTION
} from '../apollo/chatGroup/qms';
// COMPONENTS
import ChatRoom from '../components/ChatRoom';
import UserList from '../components/home/UserList';


class ChatPrivatePage extends Component {
    state = {
        userId: null,
        userName: null,
        isChatting: false,
        chattingRoom: []
    };

    componentWillMount() {
        const { joinRoom } = this.props;
        const userName = 'GUEST_' + moment(Date.now()).format('HH:mm:ss');

        joinRoom && joinRoom({ variables: { userName } })
            .then(res => {
                this.setState({
                    userId: _.get(res, 'data.joinRoom.userId'),
                    userName: _.get(res, 'data.joinRoom.userName')
                });
            });
    }

    handleUserClick = (user) => {
        const { userId, userName } = this.state;
        const roomId = 'ROOM_' + Date.now();
        const { inviteToRoom } = this.props;

        inviteToRoom && inviteToRoom({
            variables: {
                senderId: userId,
                senderName: userName,
                receiverId: user.userId,
                roomId
            }
        })
            .then(res => {
                console.log('RES', res);
                this.setState(state => ({ chattingRoom: [...state.chattingRoom, roomId] }));
            });
    }

    render() {
        const { userId, userName, chattingRoom } = this.state;

        if(!userId || !userName){
            return null;
        }

        return (
            <div>
                <Subscription
                    subscription={ROOM_INVITED_SUBSCRIPTION}
                    variables={{ receiverId: userId }}
                >
                    {({ data }) => {
                        const roomInvited = _.get(data, 'roomInvited');

                        if (!roomInvited) {
                            return null;
                        }

                        const roomId = _.get(data, 'roomInvited.roomId');
                        return (
                            <ChatRoom
                                userId={userId}
                                userName={userName}
                                roomId={roomId}
                            />
                        );
                    }}
                </Subscription>

                <UserList
                    onMessageClick={this.handleUserClick}
                />
                {
                    chattingRoom.length > 0 && chattingRoom.map(item => {
                        return(
                            <ChatRoom
                                key={item}
                                userId={userId}
                                userName={userName}
                                roomId={item}
                            />
                        );
                    })
                }
            </div>
        );
    }
}


export default compose(
    graphql(JOIN_ROOM_MUTATION, { name: 'joinRoom' }),
    graphql(INVITE_TO_ROOM_MUTATION, { name: 'inviteToRoom' })
)(ChatPrivatePage);