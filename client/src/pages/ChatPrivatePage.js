import React, { Component } from 'react';
import { Button, Input, Modal } from 'antd';
import * as moment from 'moment';
import * as _ from 'lodash';
// APOLLO
import { Query, Mutation, Subscription, graphql, compose } from 'react-apollo';
import { JOIN_ROOM_MUTATION } from '../apollo/home/qms';
import {
    COMMENT_QUERY,
    ADD_COMMENT_MUTATION,
    COMMENTS_SUBSCRIPTION,

    USER_STATUS_QUERY,
    USER_STATUS_MUTATION,
    USER_STATUS_SUBSCRIPTION
} from '../apollo/chatGroup/qms';
// COMPONENTS
import ChatBox from '../components/ChatBox';
import UserList from '../components/home/UserList';


class ChatPrivatePage extends Component {
    state = {
        userId: '' + Date.now(),
        userName: null,
        groupId: 'G1',
        replyId: null,
        msgText: null
    };

    componentWillMount(){
        // const { joinRoom } = this.props;
        // const userName = 'GUEST_' + moment(Date.now()).format('HH:mm:ss');
        // // console.log('JOIN', joinRoom, userName);
        // joinRoom && joinRoom({
        //     variables: { userName }
        // })
        // .then(res => {
        //     const userId = res.data && res.data.joinRoom.userId;
        //     this.setState({ userName });
        // });
    }

    componentDidMount(){
        // MESSAGE
        const { userId, groupId } = this.state;
        const { commentQuery } = this.props;
        const msgSubscribeToMore = commentQuery && commentQuery.subscribeToMore;
        msgSubscribeToMore && msgSubscribeToMore({
            document: COMMENTS_SUBSCRIPTION,
            variables: { groupId },
            updateQuery: (prev, { subscriptionData }) => {
                if(!subscriptionData){
                    return prev;
                }
                
                const newItem = subscriptionData.data.commentAdded;
                return Object.assign({}, prev, {
                    comment: [ ...prev.comment, newItem ]
                });
            }
        });

        // USER STATUS
        const { userStatusQuery } = this.props;
        const userStatusSubscribeToMore = userStatusQuery && userStatusQuery.subscribeToMore;
        userStatusSubscribeToMore && userStatusSubscribeToMore({
            document: USER_STATUS_SUBSCRIPTION,
            variables: { userId, groupId },
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
        });
    }

    handleMessageSend = (msgText) => {
        console.log('MSG SEND', msgText);
        const { userId, userName, groupId, replyId } = this.state;
        const { addComment } = this.props;

        addComment && addComment({ variables: { 
            userId, 
            userName, 
            groupId, 
            content: msgText
        } });
    }

    handleMessageTyping = () => {
        console.log('MSG TYPING');
        const { userId, userName, groupId } = this.state;
        const { updateUserStatus } = this.props;
        updateUserStatus && updateUserStatus({
            variables: {
                userId, userName, groupId, isTyping: true
            }
        });
    }

    handleMessageTypingStop = (msgText) => {
        console.log('MSG STOP', msgText);
        const { userId, userName, groupId } = this.state;
        const { updateUserStatus } = this.props;
        updateUserStatus && updateUserStatus({
            variables: {
                userId, userName, groupId, isTyping: false
            }
        });
    }

    handleUserClick = userId => {
        console.log('CHAT WITH', userId);
        // this.setState({ replyId: userId });
    }

    render() {
        const { userId, userName } = this.state;
        const commentList = this.props.commentQuery && this.props.commentQuery.comment;
        let userTypingList = this.props.userStatusQuery && this.props.userStatusQuery.userStatus;
        userTypingList = userTypingList ? userTypingList.map(item => item.userName) : [];
        // console.log('PRIVATE', this.props);

        return (
            <div>
                <ChatBox 
                    userId={userId}
                    userName={userName}
                    messageList={commentList}
                    onMessageSend={this.handleMessageSend}
                    onMessagegTyping={this.handleMessageTyping}
                    onMessagegTypingStop={this.handleMessageTypingStop}
                    userTypingList={userTypingList}
                />

                <UserList 
                    onUserClick={this.handleUserClick}
                />
            </div>
        )
    }
}


export default compose(
    graphql(JOIN_ROOM_MUTATION, { name: 'joinRoom' }),
    graphql(COMMENT_QUERY, { name: 'commentQuery' }),
    graphql(ADD_COMMENT_MUTATION, { name: 'addComment' }),
    graphql(USER_STATUS_QUERY, { name: 'userStatusQuery' }),
    graphql(USER_STATUS_MUTATION, { name: 'updateUserStatus' })
)(ChatPrivatePage);
