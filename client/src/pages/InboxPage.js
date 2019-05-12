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
                variables: { receiverId: 'admin' },
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
                        const { roomList, messageOrder } = state;
                        
                        if(!this._isRoomInRoomList(newItem.roomId, messageOrder)){
                            return(
                                {
                                    // roomList: [
                                    //     {
                                    //         title: newItem.senderName,
                                    //         roomId: newItem.roomId,
                                    //         senderId: state.userId,
                                    //         senderName: state.userName,
                                    //         initialMessageList: [newItem]
                                    //     },
                                    //     ...state.roomList
                                    // ],
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
                                                title={newItem.senderName}
                                                roomId={newItem.roomId}
                                                senderId={state.userId}
                                                senderName={state.userName}
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
                    // if(!this._isRoomInRoomList(newItem.roomId, roomList)){
                    //     console.log('AAAAA', newItem.roomId, roomList);
                        
                    // }
                    // else {
                    //     console.log('RL EXIST', this.state.roomList);
                    //     this.setState(state => ({
                    //         messageOrder: [newItem.roomId, ...state.messageOrder.filter(item => item !== newItem.roomId)]
                    //     }));

                    //     return Object.assign({}, prev, {
                    //         message: [ ...prev.message, newItem ]
                    //     });
                    // }

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

    // handleMessageClick = (userMsg) => {
    //     const roomId = `ROOM_${userMsg.senderId}`;
        
    //     this.setState(state => ({
    //         roomList: 
    //         this._isRoomInRoomList(userMsg.senderId, state.roomList) 
    //         ? 
    //         [
    //             ...state.roomList, 
    //             {
    //                 title: userMsg.senderName,
    //                 roomId,
    //                 senderId: state.userId,
    //                 senderName: state.userName
    //             }
    //         ] 
    //         : 
    //         state.roomList,
    //         currentRoomId: roomId
    //     }));
    // }

    handleTabClick = (key, e) => {
        this.setState(state => ({
            currentRoomId: key,
            unreadMessageCount: {
                ...state.unreadMessageCount,
                [key]: 0
            }
        }));
    }

    // handleTabClose = (e, roomInfo) => {
    //     e.stopPropagation();
    //     this.setState(state => ({
    //         roomList: state.roomList.filter(item => item.roomId !== roomInfo.roomId),
    //         currentRoomId: 'all'
    //     }));
    // }

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
                                                    <Icon type='user' className='icon-message' />{item.senderName}
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
                            {/* {
                                roomList && roomList.map(item => {
                                    return(
                                        <Tabs.TabPane 
                                            key={item.roomId}
                                            tab={
                                                <span>
                                                    <Icon type='user' className='icon-message' />{item.title}
                                                    <Badge 
                                                        className='icon-message-count'
                                                        count={unreadMessageCount[item.roomId]}
                                                        style={{ backgroundColor: '#52c41a' }}
                                                    />
                                                </span>
                                            }
                                            forceRender={true}
                                        >
                                            <ChatRoom
                                                chatBoxWrapperClassName='big-chatbox'
                                                {...item}
                                                onMessageReceive={this.handleNewRoomMessage}
                                            />
                                        </Tabs.TabPane>
                                    );
                                })
                            } */}
                            {
                                Array(10).fill(null).map((item, index) =>
                                    <Tabs.TabPane 
                                        key={index}
                                        tab={
                                            <span>
                                                <Icon type='user' className='icon-message' />
                                            </span>
                                        }
                                    >
                                        HELLO
                                    </Tabs.TabPane>    
                                )
                            }
                        </Tabs>
                    </Layout.Content>
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
