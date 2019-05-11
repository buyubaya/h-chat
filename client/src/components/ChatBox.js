import React, { Component } from 'react';
import { Button, Input, Icon } from 'antd';
import * as moment from 'moment';
import * as _ from 'lodash';
import classnames from 'classnames';


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

    handleMsgChange = e => {
        this.handleMsgTyping();
        this.handleMsgTypingStop();
        this.setState({ msgText: e.target.value });
    }

    handleMsgEnter = () => {
        const { msgText } = this.state;
        const { onMessageSend } = this.props;

        if (msgText && msgText.trim()) {
            this.setState({ msgText: '' });
            onMessageSend && onMessageSend(msgText);
        }
    }

    render() {
        const { msgText, isMessageSending } = this.state;
        const { senderId, messageList, userTypingList, title, onHide, chatBoxWrapperClassName, chatBoxWrapperStyle } = this.props;

        return (
            <div style={chatBoxWrapperStyle} className={classnames('chatbox-wrapper', chatBoxWrapperClassName)}>
                <div className='chatbox'>
                    <div className='chat-header'>
                        <Icon type='message' className='icon-message' />
                        {title ? title : 'Message'}
                        <Icon type='close' className='icon-close' onClick={onHide} />
                    </div>
                    <div className='chat-body' ref={el => this.chatBody = el}>
                        <ul className='message-list'>
                            {
                                messageList && messageList.map((item, index) =>
                                    <li className='message-row' key={index}>
                                        <div className={`msg ${item.senderId === senderId ? 'v1' : 'v2'}`}>
                                            <span className='partner'>{item.senderName}</span>
                                            {item.content}
                                            <span className='time'>{moment(item.createdAt*1).format('HH:mm')}</span>
                                        </div>
                                    </li>
                                )
                            }
                            <li className='message-row pending'>
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
                    </div>
                    
                    <div className='sendbox'>
                        <Input
                            ref={el => this.msgInput = el}
                            className='msg-input'
                            placeholder='Your text...'
                            onChange={this.handleMsgChange}
                            onPressEnter={this.handleMsgEnter}
                            disabled={isMessageSending}
                            value={msgText}
                        />
                        {/* <Icon className='icon-message-enter' type='smile' theme='twoTone' twoToneColor='#E91E63' /> */}
                    </div>
                </div>
            </div>
        )
    }
}


export default ChatBox;
