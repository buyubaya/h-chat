import React, { Component } from 'react';
import * as moment from 'moment';
import * as _ from 'lodash';
// APOLLO
import { Query, Mutation, Subscription, graphql, compose } from 'react-apollo';
import {
    MESSAGE_QUERY,
    SEND_MESSAGE_MUTATION,
    MESSAGE_SUBSCRIPTION
} from '../apollo/qms';
import { Layout, Menu, Tabs, Badge, List, Icon } from 'antd';
import ChatRoom from '../components/ChatRoom';


class InboxPage extends Component {
    unsubscribe = null;

    state = {
        userId: 'admin',
        userName: 'ADMINISTRATOR',
        roomList: [],
        currentRoomId: 'ALL',
        unreadMessageCount: {},
        messageOrder: [],
        roomRendering: {}
    };

    componentDidMount(){
        // MESSAGE
        const { userId } = this.state;
        const { messageQuery } = this.props;
        const msgSubscribeToMore = messageQuery && messageQuery.subscribeToMore;

        this.unsubscribe = [
            msgSubscribeToMore && msgSubscribeToMore({
                document: MESSAGE_SUBSCRIPTION,
                variables: { receiver: { groupId: 'ADMIN' } },
                updateQuery: (prev, { subscriptionData }) => {
                    if(!subscriptionData){
                        return prev;
                    }
                    
                    const newItem = subscriptionData.data.newMessage;
                    
                    // NOT RECEIVE SELF-MESSAGE
                    if(newItem.sender.userId === userId){
                        return prev;
                    }
                    
                    // CHECK USER EXIST IN PREV AND UPDATE MESSAGE LIST
                    // if(prev.message.filter(item => item.senderId === newItem.senderId).length > 0){
                    //     return Object.assign({}, prev, {
                    //         message: [
                    //             newItem,
                    //             ...prev.message.filter(item => item.senderId !== newItem.senderId)
                    //         ]
                    //     });
                    // }

                    // CHECK ROOM EXIST IN ROOMLIST
                    this.setState(state => {
                        const { userId, userName, messageOrder } = state;
                        const newMsgRoomId = newItem && newItem.sender && newItem.sender.roomId;
                        const sender = { userId, userName, roomId: newMsgRoomId };
                        
                        if(!this._isRoomInRoomList(newMsgRoomId, messageOrder)){
                            const sendTo = {
                                receiver: {
                                    roomId: [newMsgRoomId]
                                }
                            };
                            const listenTo = {
                                sender: {
                                    roomId: [newMsgRoomId]
                                },
                                receiver: {
                                    roomId: [newMsgRoomId]
                                }
                            };

                            return(
                                {
                                    unreadMessageCount: {
                                        ...state.unreadMessageCount,
                                        [newMsgRoomId]: 1
                                    },
                                    messageOrder: [newItem, ...state.messageOrder],
                                    roomRendering: {
                                        ...state.roomRendering,
                                        [newMsgRoomId]: (
                                            <ChatRoom
                                                title={newItem.sender.userName}
                                                roomId={newMsgRoomId}
                                                sender={sender}
                                                sendTo={sendTo}
                                                listenTo={listenTo}
                                                initialMessageList={[newItem]}
                                                onMessageReceive={this.handleNewRoomMessage}
                                                chatBoxWrapperClassName='big-chatbox'
                                            />
                                        )
                                    }
                                }
                            );
                        }
                        
                        // SORT MESSAGE BY LATEST
                        return {
                            ...state,
                            messageOrder: [newItem, ...state.messageOrder.filter(item => item.sender.roomId !== newMsgRoomId)]
                        };
                    });

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

    _isRoomInRoomList(roomId, roomList=[]){
        let x = false;

        if(roomId === 'ROOM_admin'){
           return true;
        }

        roomList.forEach(item => {
            if(item.sender.roomId === roomId){
                x = true;
                return;
            }
        });
        
        return x;
    }

    handleTabClick = (key, e) => {
        this.setState(state => ({
            currentRoomId: key,
            unreadMessageCount: {
                ...state.unreadMessageCount,
                [key]: 0
            }
        }));
    }

    handleNewRoomMessage = (msg) => {
        const roomId = msg.sender.roomId;
        
        this.setState(state => {
            return({
                unreadMessageCount: {
                    ...state.unreadMessageCount,
                    [roomId]: state.currentRoomId === roomId ? 0 : state.unreadMessageCount[roomId] + 1
                }
            });
        });
    }

    render() {
        const { 
            userId, 
            userName, 
            roomList, 
            unreadMessageCount, 
            currentRoomId, 
            messageOrder, 
            roomRendering 
        } = this.state;
        // const messageList = this.props.messageQuery && this.props.messageQuery.message;
        
        return (
            <div className='inbox-page'>
                <Layout>
                    <Layout.Content>
                        <Tabs 
                            className='admin-room-tabs'
                            activeKey={currentRoomId}
                            onTabClick={this.handleTabClick}
                            tabPosition={'left'}
                        >
                            <Tabs.TabPane 
                                key={'ALL'}
                                tab={
                                    <span>
                                        <Icon type='message' className='icon-message' />
                                        All Chats
                                        <Badge 
                                            className='icon-message-count'
                                            count={0}
                                            style={{ backgroundColor: '#52c41a' }}
                                        />
                                    </span>
                                }
                            >
                                <ChatRoom
                                    chatBoxWrapperClassName='big-chatbox'
                                    title='All Chats'
                                    roomId='ROOM_ALL'
                                    sender={{ userId, userName }}
                                />
                            </Tabs.TabPane>
                            {
                                messageOrder && messageOrder.map(item => {
                                    const roomId = item.sender.roomId;

                                    return(
                                        <Tabs.TabPane 
                                            key={roomId}
                                            tab={
                                                <span>
                                                    <Icon type='user' className='icon-message' />{item.sender.userName}
                                                    <Badge 
                                                        className='icon-message-count'
                                                        count={unreadMessageCount[roomId]}
                                                        style={{ backgroundColor: '#52c41a' }}
                                                    />
                                                </span>
                                            }
                                            forceRender={true}
                                        >
                                            {roomRendering[roomId]}
                                        </Tabs.TabPane>
                                    );
                                })
                            }
                        </Tabs>
                    </Layout.Content>
                </Layout>
            </div>
        );
    }
}


export default compose(
    graphql(MESSAGE_QUERY, { name: 'messageQuery' }),
    graphql(SEND_MESSAGE_MUTATION, { name: 'sendMessage' })
)(InboxPage);
