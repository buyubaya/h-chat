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
import { Layout, Menu, Tabs, Badge, List, Icon } from 'antd';
import ChatRoom from '../components/ChatRoom';


class InboxPage extends Component {
    unsubscribe = null;

    state = {
        userId: 'admin',
        userName: 'ADMINISTRATOR',
        roomList: [],
        currentRoomId: 'all'
    };

    componentDidMount(){
        // MESSAGE
        const { userId } = this.state;
        const { messageQuery } = this.props;
        const msgSubscribeToMore = messageQuery && messageQuery.subscribeToMore;

        this.unsubscribe = [
            msgSubscribeToMore && msgSubscribeToMore({
                document: MESSAGE_SUBSCRIPTION,
                variables: { receiverId: 'admin' },
                updateQuery: (prev, { subscriptionData }) => {
                    if(!subscriptionData){
                        return prev;
                    }
                    
                    const newItem = subscriptionData.data.newMessage;
                    
                    if(newItem.senderId === userId){
                        return prev;
                    }

                    // CHECK EXIST
                    if(prev.message.filter(item => item.senderId === newItem.senderId).length > 0){
                        return Object.assign({}, prev, {
                            message: [
                                newItem,
                                ...prev.message.filter(item => item.senderId !== newItem.senderId)
                            ]
                        });
                    }

                    return Object.assign({}, prev, {
                        message: [ ...prev.message, newItem ]
                    });
                }
            })
        ];
    }

    componentWillMount(){
        this.unsubscribe && this.unsubscribe.forEach(item => {
            item();
        });
    }

    _isRoomValid(userId, roomList){
        let x = true;

        roomList.forEach(item => {
            if(item.roomId === `ROOM_${userId}`){
                x = false;
            }
        });
        
        return x;
    }

    handleMessageClick = (userMsg) => {
        const roomId = `ROOM_${userMsg.senderId}`;
        
        this.setState(state => ({
            roomList: 
            this._isRoomValid(userMsg.senderId, state.roomList) 
            ? 
            [
                ...state.roomList, 
                {
                    title: userMsg.senderName,
                    roomId,
                    senderId: state.userId,
                    senderName: state.userName
                }
            ] 
            : 
            state.roomList,
            currentRoomId: roomId
        }));
    }

    handleTabClick = (key, e) => {
        this.setState({ currentRoomId: key });
    }

    handleTabClose = (e, roomInfo) => {
        e.stopPropagation();
        this.setState(state => ({
            roomList: state.roomList.filter(item => item.roomId !== roomInfo.roomId),
            currentRoomId: 'all'
        }));
    }

    render() {
        const { userId, userName, roomList, currentRoomId } = this.state;
        const messageList = this.props.messageQuery && this.props.messageQuery.message;
        
        return (
            <div className='inbox-page'>
                <Layout>
                    <Layout.Sider theme='light'>
                        <Menu mode='inline' className='sider-message-list'>
                            {
                                messageList && messageList.map((item, index) =>
                                    <Menu.Item 
                                        key={index} 
                                        onClick={() => this.handleMessageClick(item)}
                                    >
                                        <Icon type='user' className='icon-user' />
                                        <span className='nav-text'>{item.senderName}</span>
                                    </Menu.Item>
                                )
                            }
                        </Menu>
                    </Layout.Sider>
                    <Layout>
                        <Layout.Content>
                            <Tabs 
                                className='admin-room-tabs'
                                activeKey={currentRoomId}
                                onTabClick={this.handleTabClick}
                                // animated={false}
                            >
                                <Tabs.TabPane 
                                    key={'all'}
                                    tab={
                                        <span>
                                            <Icon type='message' className='icon-message' />
                                            All Chats
                                        </span>
                                    }
                                >
                                    <ChatRoom
                                        chatBoxWrapperClassName='big-chatbox'
                                        title='Message'
                                        roomId='ROOM_admin'
                                        senderId='admin'
                                        senderName='ADMINISTRATOR'
                                    />
                                </Tabs.TabPane>
                                {
                                    roomList && roomList.map(item => {
                                        return(
                                            <Tabs.TabPane 
                                                key={item.roomId}
                                                tab={
                                                    <span>
                                                        <Icon type='message' className='icon-message' />{item.title}
                                                        <Icon type='close' className='icon-close' onClick={(e) => this.handleTabClose(e, item)} />
                                                    </span>
                                                }
                                            >
                                                <ChatRoom
                                                    chatBoxWrapperClassName='big-chatbox'
                                                    {...item}
                                                />
                                            </Tabs.TabPane>
                                        );
                                    })
                                }
                                
                            </Tabs>
                        </Layout.Content>
                    </Layout>
                </Layout>

                {/* <div className='cta-contact-bottom'>
                    <Badge 
                        count={messageList ? messageList.length : 0}
                        onClick={() => {
                            this.setState(state => ({ chatListVisible: !state.chatListVisible }));
                        }}
                        style={{ backgroundColor: '#52c41a' }}
                    >
                        <Icon type='message' className='icon-message' />
                    </Badge>
                </div> */}
            </div>
        )
    }
}


export default compose(
    graphql(MESSAGE_QUERY, { name: 'messageQuery' }),
    graphql(SEND_MESSAGE_MUTATION, { name: 'sendMessage' })
)(InboxPage);
