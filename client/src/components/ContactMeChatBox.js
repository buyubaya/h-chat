import React, { Component } from 'react';
import classnames from 'classnames';
import { Badge, Icon } from 'antd';
import ChatRoom from './ChatRoom';


class ContactMeChatBox extends Component {
    state = {
        receiverId: 'admin',
        chatBoxTitle: null,
        chatBoxVisible: false,
        messageCount: 0
    }

    handleChatBoxHide = () => {
        this.setState(state => ({ 
            chatBoxVisible: !state.chatBoxVisible,
            messageCount: 0
        }));
    }

    handleNewMessage = msg => {
        const { chatBoxVisible, receiverId } = this.state;
        
        if(!chatBoxVisible){
            this.setState(state => ({ 
                messageCount: state.messageCount + 1, 
                chatBoxTitle: msg.senderName,
                // receiverId: ''
            }));
        }
        if(chatBoxVisible){
            this.setState(state => ({ 
                messageCount: 0, 
                chatBoxTitle: msg.senderId === receiverId ? msg.senderName: state.chatBoxTitle,
                // receiverId: ''
            }));
        }
    }

    handleCtaClick = () => {
        this.setState(state => ({ chatBoxVisible: !state.chatBoxVisible }));
    }

    render() {
        const { receiverId, chatBoxTitle, chatBoxVisible, messageCount } = this.state;
        const { senderId, senderName } = this.props;

        return (
            <div>
                <div 
                    className={classnames('cta-contact-bottom', { 'is-hidden': chatBoxVisible })}
                    onClick={this.handleCtaClick}
                >
                    <Badge 
                        count={messageCount}
                        style={{ backgroundColor: '#52c41a' }}
                    >
                        <Icon type='message' className='icon-message' />
                    </Badge>
                </div>
                <ChatRoom
                    title={chatBoxTitle}
                    senderId={senderId}
                    senderName={senderName}
                    receiverId={receiverId}
                    roomId={`ROOM_${senderId}`}
                    onHide={this.handleChatBoxHide}
                    onMessageReceive={this.handleNewMessage}
                    chatBoxWrapperClassName={classnames('contact-me-chatbox', { 'is-hidden': !chatBoxVisible })}
                />
            </div>
        );
    }
}


export default ContactMeChatBox;
