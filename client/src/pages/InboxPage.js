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
        currentRoomId: 'all',
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
                variables: { groupId: 'ADMIN' },
                updateQuery: (prev, { subscriptionData }) => {
                    if(!subscriptionData){
                        return prev;
                    }
                    
                    const newItem = subscriptionData.data.newMessage;
                    
                    // NOT RECEIVE SELF-MESSAGE
                    if(newItem.senderId === userId){
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
                        const sender = { userId, userName };
                        console.log('MSG', newItem, messageOrder);
                        if(!this._isRoomInRoomList(newItem.roomId, messageOrder)){
                            return(
                                {
                                    unreadMessageCount: {
                                        ...state.unreadMessageCount,
                                        [newItem.roomId]: 1
                                    },
                                    messageOrder: [newItem, ...state.messageOrder.filter(item => item.roomId !== newItem.roomId)],
                                    roomRendering: {
                                        ...state.roomRendering,
                                        [newItem.roomId]: (
                                            <ChatRoom
                                                chatBoxWrapperClassName='big-chatbox'
                                                title={newItem.sender.userName}
                                                roomId={newItem.roomId}
                                                sender={sender}
                                                initialMessageList={[newItem]}
                                                onMessageReceive={this.handleNewRoomMessage}
                                            />
                                        )
                                    }
                                }
                            );
                        }
                        
                        return {
                            ...state,
                            messageOrder: [...state.messageOrder]
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
        if(roomId === 'ROOM_admin'){
           return true;
        }

        roomList.forEach(item => {
            if(item.roomId === roomId){
                return true;
            }
        });
        
        return false;
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
        this.setState(state => {            
            return({
                unreadMessageCount: {
                    ...state.unreadMessageCount,
                    [msg.roomId]: state.currentRoomId === msg.roomId ? 0 : state.unreadMessageCount[msg.roomId] + 1
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
                                key={'all'}
                                tab={
                                    <span>
                                        <Icon type='message' className='icon-message' />
                                        All Chats
                                        <Badge 
                                            className='icon-message-count'
                                            count={10}
                                            style={{ backgroundColor: '#52c41a' }}
                                        />
                                    </span>
                                }
                            >
                                <ChatRoom
                                    chatBoxWrapperClassName='big-chatbox'
                                    title='Message'
                                    senderId='admin'
                                    senderName='ADMINISTRATOR'
                                    roomId='ROOM_admin'
                                />
                            </Tabs.TabPane>
                            {
                                messageOrder && messageOrder.map(item => {
                                    return(
                                        <Tabs.TabPane 
                                            key={item.roomId}
                                            tab={
                                                <span>
                                                    <Icon type='user' className='icon-message' />{item.sender.userName}
                                                    <Badge 
                                                        className='icon-message-count'
                                                        count={unreadMessageCount[item.roomId]}
                                                        style={{ backgroundColor: '#52c41a' }}
                                                    />
                                                </span>
                                            }
                                            forceRender={true}
                                        >
                                            {roomRendering[item.roomId]}
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
