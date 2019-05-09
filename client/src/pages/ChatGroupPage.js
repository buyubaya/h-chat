import React, { Component } from 'react';
import { Button, Input } from 'antd';
import * as moment from 'moment';
import * as _ from 'lodash';
// APOLLO
import { Query, Mutation, Subscription, graphql, compose } from 'react-apollo';
import {
    COMMENT_QUERY,
    USER_STATUS_QUERY,
    ADD_COMMENT_MUTATION,
    COMMENTS_SUBSCRIPTION,
    USER_STATUS_MUTATION,
    USER_STATUS_SUBSCRIPTION,
    CREATE_CHAT_ROOM_MUTATION

} from '../apollo/chatGroup/qms';


class ChatGroupPage extends Component {
    state = {
        userId: '' + Date.now(),
        userName: 'AAAAA',
        groupId: 'G1',
        msgList: [],
        msgText: null,
        isTyping: false
    };

    componentDidMount(){
        // COMMENT
        const { groupId } = this.state;
        const { commentQuery } = this.props;
        const subscribeToMore = commentQuery && commentQuery.subscribeToMore;
        subscribeToMore && subscribeToMore({
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
        const { userId } = this.state;
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
    
    componentWillReceiveProps(newProps){
        // COMMENT
        const { commentQuery: oldCommentQuery } = this.props;
        const oldCommentList = oldCommentQuery && oldCommentQuery.comment;
        const { commentQuery: newCommentQuery } = newProps;
        const newCommentList = newCommentQuery && newCommentQuery.comment;
        
        if(oldCommentList && newCommentList && oldCommentList.length < newCommentList.length){
            setTimeout(() => {
                this.chatBody.scrollTop = this.chatBody.scrollHeight;
            }, 0);
        }
    }

    handleMsgTextChange = () => {
        const { userId, userName, groupId, isTyping } = this.state;
        if(!isTyping){
            const { updateUserStatus } = this.props;

            this.setState({ isTyping: true });
            updateUserStatus && updateUserStatus({
                variables: {
                    userId, userName, groupId, isTyping: true
                }
            });
        }
    } 

    handleMsgTextUnchange = _.debounce(
        () => {
            const { userId, userName, groupId } = this.state;
            const { updateUserStatus } = this.props;

            this.setState({ isTyping: false });
            updateUserStatus && updateUserStatus({
                variables: {
                    userId, userName, groupId, isTyping: false
                }
            });
        }
    , 1000);

    handleCreateChatRoom = () => {
        const { createChatRoom } = this.props;
        createChatRoom && 
        createChatRoom()
        .then(res => {
            const groupId = _.get(res, 'data.createChatRoom.groupId');
            
            this.setState({
                groupId
            });
        });
    }

    render() {
        const { userId, userName, groupId, msgText } = this.state;
        const { commentQuery, userStatusQuery, updateUserStatus } = this.props;
        const comment = commentQuery && commentQuery.comment;
        let userTypingList = userStatusQuery && userStatusQuery.userStatus;
        userTypingList = userTypingList ? userTypingList.map(item => item.userName) : [];
        
        return (
            <div>
                <Button onClick={this.handleCreateChatRoom}>Crate a Room</Button>
                <div className='chat-area'>
                    <div className='chatbox'>
                        <ul className='chats' ref={el => this.chatBody = el}>
                            {
                                comment && comment.map(item =>
                                    <li key={item.commentId}>
                                        <div className={`msg ${item.userId === userId ? 'v1' : 'v2'}`}>
                                            <span className='partner'>{item.userName}</span>
                                            {item.content}
                                            <span className='time'>{moment(item.createdAt*1).format('HH:mm')}</span>
                                        </div>
                                    </li>
                                )
                            }
                            {
                                userTypingList && userTypingList.length > 0 &&
                                <li className='pending'>
                                    <div className='msg v2'>
                                        <span className='partner'>
                                            {userTypingList.join(',')}
                                        </span>
                                        <div className='dot'></div>
                                        <div className='dot'></div>
                                        <div className='dot'></div>
                                    </div>
                                </li>
                            }
                        </ul>
                        
                        <Mutation mutation={ADD_COMMENT_MUTATION}>
                            {(addComment, { data, error, loading }) => {
                                return (
                                    <div className='sendbox'>
                                        <Input
                                            ref={el => this.msgInput = el}
                                            className='msg-input'
                                            placeholder='Your text...'
                                            onChange={e => {
                                                this.handleMsgTextChange();
                                                this.handleMsgTextUnchange();
                                                this.setState({ msgText: e.target.value });
                                            }}
                                            onPressEnter={() => {
                                                if (msgText && msgText.trim()) {
                                                    addComment({ variables: { userId, userName, groupId, content: msgText } })
                                                    .then(res => {
                                                        updateUserStatus({
                                                            variables: {
                                                                userId, userName, groupId, isTyping: false
                                                            }
                                                        });
                                                        this.setState({ msgText: '' });
                                                        this.msgInput.focus();
                                                    });
                                                }
                                            }}
                                            disabled={loading}
                                            value={msgText}
                                        />
                                    </div>
                                );
                            }}
                        </Mutation>

                    </div>
                </div>
            </div>
        );
    }
}


export default compose(
    graphql(COMMENT_QUERY, { name: 'commentQuery' }),
    graphql(USER_STATUS_QUERY, { name: 'userStatusQuery' }),
    graphql(ADD_COMMENT_MUTATION, { name: 'addComment' }),
    graphql(USER_STATUS_MUTATION, { name: 'updateUserStatus' }),
    graphql(CREATE_CHAT_ROOM_MUTATION, { name: 'createChatRoom' })
)(ChatGroupPage);