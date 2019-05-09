import React, { Component } from 'react';
import * as moment from 'moment';
import * as _ from 'lodash';
// APOLLO
import { Query, Mutation, Subscription, graphql, compose } from 'react-apollo';
import {
    COMMENT_QUERY,
    ADD_COMMENT_MUTATION,
    COMMENTS_SUBSCRIPTION,

    USER_STATUS_QUERY,
    USER_STATUS_MUTATION,
    USER_STATUS_SUBSCRIPTION
} from '../apollo/chatGroup/qms';
import ChatBox from './ChatBox';


class ChatRoom extends Component {
    unsubscribe = null;

    componentDidMount(){
        // MESSAGE
        const { userId, roomId } = this.props;
        const { commentQuery } = this.props;
        const msgSubscribeToMore = commentQuery && commentQuery.subscribeToMore;

        // USER STATUS
        const { userStatusQuery } = this.props;
        const userStatusSubscribeToMore = userStatusQuery && userStatusQuery.subscribeToMore;

        this.unsubscribe = [
            msgSubscribeToMore && msgSubscribeToMore({
                document: COMMENTS_SUBSCRIPTION,
                variables: { groupId: roomId },
                updateQuery: (prev, { subscriptionData }) => {
                    if(!subscriptionData){
                        return prev;
                    }
                    
                    const newItem = subscriptionData.data.commentAdded;
                    return Object.assign({}, prev, {
                        comment: [ ...prev.comment, newItem ]
                    });
                }
            }),
            userStatusSubscribeToMore && userStatusSubscribeToMore({
                document: USER_STATUS_SUBSCRIPTION,
                variables: { userId, groupId: roomId },
                updateQuery: (prev, { subscriptionData }) => {
                    if(!subscriptionData){
                        return prev;
                    }
                    
                    const newItem = subscriptionData.data.userStatusUpdated;
                    const checkExist = prev.userStatus.filter(item => item.userId === newItem.userId);
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
                            userStatus: prev.userStatus.filter(item => item.userId !== newItem.userId)
                        });
                    }
                }
            })
        ];
    }

    componentWillUnmount(){
        this.unsubscribe();
    }

    handleMessageSend = (msgText) => {
        const { userId, userName, roomId } = this.props;
        const { addComment } = this.props;
        
        addComment && addComment({ variables: { 
            userId, 
            userName, 
            groupId: roomId, 
            content: msgText
        } });
    }

    handleMessageTyping = () => {
        const { userId, userName, roomId } = this.props;
        const { updateUserStatus } = this.props;
        updateUserStatus && updateUserStatus({
            variables: {
                userId, userName, groupId: roomId, isTyping: true
            }
        });
    }

    handleMessageTypingStop = (msgText) => {
        const { userId, userName, roomId } = this.props;
        const { updateUserStatus } = this.props;
        updateUserStatus && updateUserStatus({
            variables: {
                userId, userName, groupId: roomId, isTyping: false
            }
        });
    }

    render() {
        const { userId, userName, roomId } = this.props;
        const messageList = this.props.commentQuery && this.props.commentQuery.comment;
        let userTypingList = this.props.userStatusQuery && this.props.userStatusQuery.userStatus;
        userTypingList = userTypingList ? userTypingList.map(item => item.userName) : [];

        return (
            <ChatBox 
                userId={userId}
                userName={userName}
                roomId={roomId}
                messageList={messageList}
                onMessageSend={this.handleMessageSend}
                onMessagegTyping={this.handleMessageTyping}
                onMessagegTypingStop={this.handleMessageTypingStop}
                userTypingList={userTypingList}
            />
        )
    }
}


export default compose(
    graphql(COMMENT_QUERY, { 
        name: 'commentQuery',
        options: ({ roomId }) => ({
            variables: { roomId }
        })
    }),
    graphql(ADD_COMMENT_MUTATION, { name: 'addComment' }),
    graphql(USER_STATUS_QUERY, { 
        name: 'userStatusQuery',
        options: ({ roomId }) => ({
            variables: { roomId }
        }) 
    }),
    graphql(USER_STATUS_MUTATION, { name: 'updateUserStatus' })
)(ChatRoom);