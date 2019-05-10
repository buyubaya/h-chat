import React, { Component } from 'react';
import { Button, Input, Icon } from 'antd';
import * as moment from 'moment';
import * as _ from 'lodash';


class ChatBox extends Component {
    state = {
        msgList: [],
        msgText: null,
        isTyping: false
    };

    componentWillReceiveProps(newProps){
        const { messageList: oldMessageList } = this.props;
        const { messageList: newMessageList } = newProps;

        if(oldMessageList && newMessageList && oldMessageList.length < newMessageList.length){
            setTimeout(() => {
                this.chatBody.scrollTop = this.chatBody.scrollHeight;
            }, 0);
        }
    }

    handleMsgTyping = () => {
        const { isTyping, msgText } = this.state;
        if(!isTyping){
            const { onMessagegTyping } = this.props;

            this.setState({ isTyping: true });
            onMessagegTyping && onMessagegTyping();
        }
    } 

    handleMsgTypingStop = _.debounce(
        () => {
            const { msgText } = this.state;
            const { onMessagegTypingStop } = this.props;
            
            this.setState({ isTyping: false });
            onMessagegTypingStop && onMessagegTypingStop(msgText);
        }
    , 500);

    render() {
        const { msgText, isMessageSending } = this.state;
        const { userId, messageList, userTypingList, onMessageSend, title } = this.props;

        return (
            <div className='chat-area'>
                <div className='chatbox'>
                    <div className='chat-header'>
                        <Icon type='message' className='icon-message' />
                        {title ? title : 'Message'}
                        <Icon type='close' className='icon-close' />
                    </div>
                    <ul className='chats' ref={el => this.chatBody = el}>
                        {
                            messageList && messageList.map((item, index) =>
                                <li key={index}>
                                    <div className={`msg ${item.userId === userId ? 'v1' : 'v2'}`}>
                                        <span className='partner'>{item.userName}</span>
                                        {item.content}
                                        <span className='time'>{moment(item.createdAt*1).format('HH:mm')}</span>
                                    </div>
                                </li>
                            )
                        }
                        <li className='pending'>
                            {
                                userTypingList && userTypingList.length > 0 &&
                                <div className='msg v2'>
                                    <span className='partner'>
                                        {userTypingList.join(',')}
                                    </span>
                                    <div className='dot'></div>
                                    <div className='dot'></div>
                                    <div className='dot'></div>
                                </div>
                            }
                        </li>
                    </ul>
                    
                    <div className='sendbox'>
                        <Input
                            ref={el => this.msgInput = el}
                            className='msg-input'
                            placeholder='Your text...'
                            onChange={e => {
                                this.handleMsgTyping();
                                this.handleMsgTypingStop();
                                this.setState({ msgText: e.target.value });
                            }}
                            onPressEnter={() => {
                                if (msgText && msgText.trim()) {
                                    this.setState({ msgText: '' });
                                    onMessageSend && onMessageSend(msgText);
                                }
                            }}
                            disabled={isMessageSending}
                            value={msgText}
                        />
                    </div>
                </div>
            </div>
        )
    }
}


export default ChatBox;
