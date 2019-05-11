import React, { Component } from 'react';
import * as moment from 'moment';
import * as _ from 'lodash';
// APOLLO
import { Query, Mutation, Subscription, graphql, compose } from 'react-apollo';
import {
    MESSAGE_QUERY,
    SEND_MESSAGE_MUTATION,
    MESSAGE_SUBSCRIPTION,

    USER_STATUS_QUERY,
    USER_STATUS_MUTATION,
    USER_STATUS_SUBSCRIPTION
} from '../apollo/qms';
import ChatBox from './ChatBox';


class ChatRoom extends Component {
    unsubscribe = null;

    componentDidMount(){
        // MESSAGE
        const { senderId, roomId } = this.props;
        const { messageQuery } = this.props;
        const msgSubscribeToMore = messageQuery && messageQuery.subscribeToMore;

        // USER STATUS
        const { userStatusQuery } = this.props;
        const userStatusSubscribeToMore = userStatusQuery && userStatusQuery.subscribeToMore;

        this.unsubscribe = [
            msgSubscribeToMore && msgSubscribeToMore({
                document: MESSAGE_SUBSCRIPTION,
                variables: { roomId },
                updateQuery: (prev, { subscriptionData }) => {
                    if(!subscriptionData){
                        return prev;
                    }
                    
                    const newItem = subscriptionData.data.newMessage;
                    const { onMessageReceive } = this.props;
                    onMessageReceive && onMessageReceive(newItem);

                    return Object.assign({}, prev, {
                        message: [ ...prev.message, newItem ]
                    });
                }
            }),
            userStatusSubscribeToMore && userStatusSubscribeToMore({
                document: USER_STATUS_SUBSCRIPTION,
                variables: { senderId, roomId },
                updateQuery: (prev, { subscriptionData }) => {
                    if(!subscriptionData){
                        return prev;
                    }
                    
                    const newItem = subscriptionData.data.userStatusUpdated;
                    const checkExist = prev.userStatus.filter(item => item.senderId === newItem.senderId);
                    if(newItem.isTyping){
                        if(checkExist.length < 1){
                            return Object.assign({}, prev, {
                                userStatus: [ newItem, ...prev.userStatus ]
                            });
                        }
                        return prev;
                    }
                    else {
                        return Object.assign({}, prev, {
                            userStatus: prev.userStatus.filter(item => item.senderId !== newItem.senderId)
                        });
                    }
                }
            })
        ];
    }

    componentWillUnmount(){
        this.unsubscribe.forEach(item => {
            item();
        });
    }

    handleMessageSend = (msgText) => {
        const { senderId, senderName, roomId } = this.props;
        const { sendMessage } = this.props;
        
        sendMessage && sendMessage({ variables: { 
            senderId, 
            senderName, 
            roomId, 
            content: msgText
        } });
    }

    handleMessageTyping = () => {
        const { senderId, senderName, roomId } = this.props;
        const { updateUserStatus } = this.props;

        updateUserStatus && updateUserStatus({
            variables: {
                senderId, senderName, roomId, isTyping: true
            }
        });
    }

    handleMessageTypingStop = (msgText) => {
        const { senderId, senderName, roomId } = this.props;
        const { updateUserStatus } = this.props;
        
        updateUserStatus && updateUserStatus({
            variables: {
                senderId, senderName, roomId, isTyping: false
            }
        });
    }

    render() {
        const { senderId, senderName, roomId, title, onHide, chatBoxWrapperClassName, chatBoxWrapperStyle } = this.props;
        const messageList = this.props.messageQuery && this.props.messageQuery.message;
        let userTypingList = this.props.userStatusQuery && this.props.userStatusQuery.userStatus;
        userTypingList = userTypingList ? userTypingList.map(item => item.senderName) : [];

        return (
            <ChatBox 
                title={title}
                senderId={senderId}
                senderName={senderName}
                roomId={roomId}
                messageList={messageList}
                onMessageSend={this.handleMessageSend}
                onMessagegTyping={this.handleMessageTyping}
                onMessagegTypingStop={this.handleMessageTypingStop}
                userTypingList={userTypingList}
                onHide={onHide}
                chatBoxWrapperClassName={chatBoxWrapperClassName}
                chatBoxWrapperStyle={chatBoxWrapperStyle}
            />
        )
    }
}


export default compose(
    graphql(MESSAGE_QUERY, { 
        name: 'messageQuery',
        options: ({ roomId }) => ({
            variables: { roomId }
        })
    }),
    graphql(SEND_MESSAGE_MUTATION, { name: 'sendMessage' }),
    graphql(USER_STATUS_QUERY, { 
        name: 'userStatusQuery',
        options: ({ roomId }) => ({
            variables: { roomId }
        }) 
    }),
    graphql(USER_STATUS_MUTATION, { name: 'updateUserStatus' })
)(ChatRoom);