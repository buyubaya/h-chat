import React, { Component } from 'react';
import * as moment from 'moment';
import * as _ from 'lodash';
// APOLLO
import { Query, Mutation, Subscription, graphql, compose } from 'react-apollo';
import {
    MESSAGE_QUERY,
    ADD_MESSAGE_MUTATION,
    MESSAGE_SUBSCRIPTION,

    USER_STATUS_QUERY,
    USER_STATUS_MUTATION,
    USER_STATUS_SUBSCRIPTION
} from '../apollo/chatGroup/qms';
import { Badge, List, Icon } from 'antd';
import ChatRoom from '../components/ChatRoom';


class InboxPage extends Component {
    unsubscribe = null;

    state = {
        userId: 'admin',
        userName: 'ADMINISTRATOR',
        chatList: [],
        chatListVisible: false
    };

    componentDidMount(){
        // MESSAGE
        const { userId } = this.state;
        const { messageQuery } = this.props;
        const msgSubscribeToMore = messageQuery && messageQuery.subscribeToMore;

        this.unsubscribe = [
            msgSubscribeToMore && msgSubscribeToMore({
                document: MESSAGE_SUBSCRIPTION,
                updateQuery: (prev, { subscriptionData }) => {
                    if(!subscriptionData){
                        return prev;
                    }
                    
                    const newItem = subscriptionData.data.newMessage;
                    
                    if(newItem.userId === userId){
                        return prev;
                    }

                    return Object.assign({}, prev, {
                        message: [ ...prev.message, newItem ]
                    });
                }
            })
        ];
    }

    componentWillUnmount(){
        this.unsubscribe();
    }

    _isChatExisted(userId, chatList){
        const roomId = `ROOM_${userId}`;
        return chatList.includes(roomId);
    }

    handleMessageClick = (msg) => {
        const { chatList } = this.state;
        const roomId = `ROOM_${msg.userId}`;

        if(!this._isChatExisted(msg.userId, chatList)){
            this.setState(state => ({ chatList: [...state.chatList, roomId] }));
        }
    }

    render() {
        const { userId, userName, chatList, chatListVisible } = this.state;
        const messageList = this.props.messageQuery && this.props.messageQuery.message;

        return (
            <div>
                <h1>INBOX</h1>
                <Badge 
                    count={messageList ? messageList.length : 0}
                    onClick={() => {
                        this.setState(state => ({ chatListVisible: !state.chatListVisible }));
                    }}
                >
                    <Icon type='message' />
                </Badge>

                {
                    chatListVisible &&
                    <List 
                        dataSource={messageList}
                        renderItem={item => {
                            return(
                                <List.Item 
                                    actions={[<a onClick={() => this.handleMessageClick(item)}>Message</a>]}
                                >
                                    {item.content}
                                </List.Item>
                            );
                        }}
                    />
                }
                {
                    chatList && chatList.length > 0 && chatList.map(item =>
                        <ChatRoom
                            key={item}
                            title={item}
                            userId={userId}
                            userName={userName}
                            roomId={item}
                        />
                    )
                }
            </div>
        )
    }
}


export default compose(
    graphql(MESSAGE_QUERY, { name: 'messageQuery' }),
    graphql(ADD_MESSAGE_MUTATION, { name: 'sendMessage' })
)(InboxPage);
