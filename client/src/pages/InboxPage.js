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
import { Tabs, Badge, List, Icon } from 'antd';
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
                    
                    if(newItem.senderId === userId){
                        return prev;
                    }

                    return Object.assign({}, prev, {
                        message: [ ...prev.message, newItem ]
                    });
                }
            })
        ];
    }

    _isChatExisted(userId, chatList){
        let x = false;

        chatList.forEach(item => {
            if(item.receiverId === userId){
                x = true;
            }
        });

        return x;
    }

    handleMessageClick = (msg) => {
        const { chatList } = this.state;
        const newRoom = {
            receiverId: msg.senderId,
            receiverName: msg.senderName,
            roomId: `ROOM_${msg.senderId}`
        };

        if(!this._isChatExisted(msg.senderId, chatList)){
            this.setState(state => ({ chatList: [...state.chatList, newRoom] }));
        }
    }

    render() {
        const { userId, userName, chatList, chatListVisible } = this.state;
        const messageList = this.props.messageQuery && this.props.messageQuery.message;

        return (
            <div>
                <h1>INBOX</h1>
                <div className='cta-contact-bottom'>
                    <Badge 
                        count={messageList ? messageList.length : 0}
                        onClick={() => {
                            this.setState(state => ({ chatListVisible: !state.chatListVisible }));
                        }}
                        style={{ backgroundColor: '#52c41a' }}
                    >
                        <Icon type='message' className='icon-message' />
                    </Badge>
                </div>

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
                    chatList && chatList.length > 0 &&
                    <Tabs tabPosition={this.state.tabPosition}>
                        {
                            chatList.map(item =>
                                <Tabs.TabPane
                                    key={item.roomId} 
                                    tab={<span><Icon type='message' className='icon-message' />{item.receiverName}</span>}
                                >
                                    <ChatRoom
                                        title={item.receiverName}
                                        senderId={userId}
                                        senderName={userName}
                                        roomId={item.roomId}
                                    />
                                </Tabs.TabPane>
                            )
                        }
                    </Tabs>
                }
            </div>
        )
    }
}


export default compose(
    graphql(MESSAGE_QUERY, { name: 'messageQuery' }),
    graphql(SEND_MESSAGE_MUTATION, { name: 'sendMessage' })
)(InboxPage);
