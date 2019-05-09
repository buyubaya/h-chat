import React, { Component } from 'react';
import { Query, Mutation, Subscription, graphql, compose } from 'react-apollo';
// ANTD
import {
    Comment, Avatar, Form, Button, List, Input
} from 'antd';
import moment from 'moment';
import {
    ADD_COMMENT_MUTATION,
    COMMENTS_SUBSCRIPTION
} from '../../apollo/home/qms';


class ChatBox extends Component {
    state = {
        commentList: [],
        commentText: null
    };

    componentWillReceiveProps(newProps) {
        // UPDATE COMMENT LIST
        let newCommentList;
        const { commentList } = this.state;
        const { commentSubscription } = newProps;
        const commentAdded = commentSubscription && commentSubscription.commentAdded;
        if (commentAdded) {
            const createdAt = commentAdded && commentAdded.createdAt;
            const commentId = commentAdded && commentAdded.commentId;
            const newComment = {
                userId: commentAdded.userId ,
                userName: commentAdded.userName,
                content: commentAdded.content,
                createdAt
            };

            if (
                commentList.length < 1 ||
                (commentList.length > 0 && commentList[0]['commentId'] !== commentId)
            ) {
                newCommentList = state => ([...state.commentList, newComment]);
            }
        }

        this.setState(state => ({ commentList: newCommentList(state) }));
    }

    render() {
        const { commentList, commentText } = this.state;
        const { user } = this.props;
        const userId = user && user.userId;
        const userName = user && user.userName;

        return (
            <div className='chat-area'>
                <div className='chatbox'>
                    {
                        commentList && commentList.length > 0 &&
                        <ul className='chats'>
                            {
                                commentList && commentList.map((item, index) => (
                                    <li key={index}>
                                        <div className={`msg ${item.userId === userId ? 'v1' : 'v2'}`}>
                                            <span className='partner'>{item.userName}</span>
                                            {item.content}
                                            <span className='time'>{moment(item.createdAt*1).format('HH:mm')}</span>
                                        </div>
                                    </li>
                                ))
                            }
                        </ul>
                    }

                    <Mutation mutation={ADD_COMMENT_MUTATION}>
                        {(addComment, { data, loading, error }) => {
                            return (
                                <div className='sendbox'>
                                    <Input
                                        className='msg-input' 
                                        placeholder="Your text..." 
                                        onChange={e => this.setState({ commentText: e.target.value })}
                                        onPressEnter={() => {
                                            if (commentText && commentText.trim()) {
                                                addComment({ variables: { userId, userName, content: commentText } })
                                                    .then(res => {
                                                        this.setState({ commentText: '' });
                                                    });
                                            }
                                        }} 
                                        disabled={loading}
                                        value={commentText}
                                    />
                                </div>
                            );
                        }}
                    </Mutation>
                </div>
            </div>
        );
    }
}


export default compose(
    graphql(COMMENTS_SUBSCRIPTION, { name: 'commentSubscription' })
)(ChatBox);
