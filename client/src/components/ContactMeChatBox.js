import React, { Component } from 'react';
import { Badge, Icon } from 'antd';
import ChatRoom from './ChatRoom';


class ContactMeChatBox extends Component {
    state = {
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
        const { chatBoxVisible } = this.state;
        const { senderId } = this.props;
        
        if(!chatBoxVisible && msg.senderId !== senderId){
            this.setState(state => ({ messageCount: state.messageCount + 1, chatBoxTitle: msg.senderName }));
        }
        if(chatBoxVisible && msg.senderId !== senderId){
            this.setState(state => ({ messageCount: 0, chatBoxTitle: msg.senderName }));
        }
        if(chatBoxVisible && msg.senderId === senderId){
            this.setState(state => ({ messageCount: 0 }));
        }
    }

    render() {
        const { chatBoxTitle, chatBoxVisible, messageCount } = this.state;
        const { senderId, senderName } = this.props;

        return (
            <div>
                {
                    !chatBoxVisible &&
                    <div className='cta-contact-bottom'>
                        <Badge 
                            count={messageCount}
                            onClick={() => {
                                this.setState(state => ({ chatBoxVisible: !state.chatBoxVisible }));
                            }}
                            style={{ backgroundColor: '#52c41a' }}
                        >
                            <Icon type='message' className='icon-message' />
                        </Badge>
                    </div>
                }
                <ChatRoom
                    title={chatBoxTitle}
                    senderId={senderId}
                    senderName={senderName}
                    roomId={`ROOM_${senderId}`}
                    onHide={this.handleChatBoxHide}
                    onMessageReceive={this.handleNewMessage}
                    chatBoxWrapperClassName={'contact-me-chatbox'}
                    chatBoxWrapperStyle={!chatBoxVisible ? { width: 0, height: 0 } : null}
                />
            </div>
        );
    }
}


export default ContactMeChatBox;
