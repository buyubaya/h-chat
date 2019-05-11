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
import UserList from '../components/home/UserList';
import ContactMeChatBox from '../components/ContactMeChatBox';


class ChatPrivatePage extends Component {
    state = {
        userId: null,
        userName: null,
        isChatting: false,
        chattingRoom: [],
        chatBoxVisible: false
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

    _roomExisted(uid1, uid2, roomList){
        let x = false;
        roomList && roomList.forEach(item => {
            const tmp = item.split('_');
            if(tmp.includes(uid1) && tmp.includes(uid2)){
                x = true;
            }
        });
        return x;
    }

    // handleUserClick = (user) => {
    //     const { userId, userName, chattingRoom } = this.state;
        
    //     if(!this._roomExisted(userId, user.userId, chattingRoom)){
    //         const roomId = [userId, user.userId].join('_');
    //         const { inviteToRoom } = this.props;
    //         // this.setState(state => ({ chattingRoom: [...state.chattingRoom, roomId] }));

    //         inviteToRoom && inviteToRoom({
    //             variables: {
    //                 senderId: userId,
    //                 senderName: userName,
    //                 receiverId: user.userId,
    //                 roomId
    //             }
    //         })
    //         .then(res => {
    //             console.log('RES', res);
    //             this.setState(state => ({ chattingRoom: [...state.chattingRoom, roomId] }));
    //         });
    //     }
    // }

    render() {
        const { userId, userName, chattingRoom, chatBoxVisible } = this.state;

        if(!userId || !userName){
            return null;
        }

        return (
            <div>
                {/* <Subscription
                    subscription={MESSAGE_SUBSCRIPTION}
                    variables={{ receiverId: userId }}
                >
                    {({ data }) => {
                        const newMessage = _.get(data, 'newMessage');

                        if (!newMessage) {
                            return null;
                        }
                        console.log('MSG', newMessage);
                        const roomId = _.get(data, 'newMessage.groupId');
                        return (
                            <ChatRoom
                                userId={userId}
                                userName={userName}
                                roomId={roomId}
                            />
                        );
                    }}
                </Subscription> */}

                {/* <UserList
                    onMessageClick={this.handleUserClick}
                /> */}
                {/* {
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
                } */}
                <ContactMeChatBox 
                    senderId={userId}
                    senderName={userName}
                    messageCount={10}
                />
            </div>
        );
    }
}


export default compose(
    graphql(JOIN_ROOM_MUTATION, { name: 'joinRoom' }),
    // graphql(INVITE_TO_ROOM_MUTATION, { name: 'inviteToRoom' })
)(ChatPrivatePage);