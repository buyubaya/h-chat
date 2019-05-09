import React, { Component } from 'react';
import { List, Modal } from 'antd';
// APOLLO
import { Query, Mutation, Subscription, graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
// GRAPHQL
const USER_QUERY = gql`
    query {
        user {
            userId
            userName
            createdAt
        }
    }
`;
const USER_SUBSCRIPTION = gql`
    subscription {
        userAdded {
            userId
            userName
            createdAt
        }
    }
`;
const REMOVE_USER_SUBSCRIPTION = gql`
    subscription {
        userRemoved {
            userId
            createdAt
        }
    }
`;


class UserList extends Component {
    state = {
        userList: [],
        isFirst: true,
        modalVisible: false
    };

    componentWillReceiveProps(newProps, newState){
        // CURRENT USER
        const { userQuery } = newProps;
        let currentUserList;
        if(userQuery && userQuery.user){
            currentUserList = userQuery.user;
        }
        
        // ADD USER
        const { userList } = this.state;
        const { userSubscription } = newProps;
        const userAdded = userSubscription && userSubscription.userAdded;
        let userWillBeAdded;
        if(userAdded){
            const userId = userAdded.userId;
            const newUser = {...userAdded};

            if (
                userList.length < 1 ||
                (userList.length > 0 && userList[0]['userId'] !== userId)
            ) {
                userWillBeAdded = newUser;
            }
        }

        // REMOVE USER
        const { removeUserSubscription } = newProps;
        const userRemoved = removeUserSubscription && removeUserSubscription.userRemoved;
        let userWillBeRemoved;
        if(userRemoved){
            userWillBeRemoved = userRemoved;
        }

        // UPDATE USER LIST
        const { isFirst } = this.state;
        if(isFirst && currentUserList){
            this.setState({ userList: currentUserList, isFirst: false });
        }
        else {
            this.setState(state => {
                let newUserList;
                if(userWillBeRemoved){
                    newUserList = state.userList.filter(item => item.userId !== userWillBeRemoved.userId);
                }
                if(userWillBeAdded){
                    newUserList = [userWillBeAdded, ...state.userList];
                }

                return({
                    userList: newUserList ? newUserList : state.userList
                });
            });
        }
    }

    componentWillUnmount(){
        this.setState({
            userList: [],
            isFirst: true
        });
    }

    handleMessageClick = (user) => {
        // this.setState({ modalVisible: true });
        this.props.onMessageClick && this.props.onMessageClick(user);
    }

    render() {
        const { userList } = this.state;

        return (
            <div className='user-list-area'>
                <List 
                    dataSource={userList}
                    renderItem={item => {
                        return(
                            <List.Item actions={[<a onClick={() => this.handleMessageClick(item)}>Message</a>]}>
                                {item.userName}
                            </List.Item>
                        );
                    }}
                />
                <Modal
                    visible={this.state.modalVisible}
                    onCancel={() => this.setState({ modalVisible: false })}
                    footer={null}
                    closable={false}
                >
                    HELLO {}
                </Modal>
            </div>
        )
    }
}


export default compose(
    graphql(USER_QUERY, { 
        name: 'userQuery', 
        options: props => ({
            fetchPolicy: 'no-cache'
        })
    }),
    graphql(USER_SUBSCRIPTION, { name: 'userSubscription' }),
    graphql(REMOVE_USER_SUBSCRIPTION, { name: 'removeUserSubscription' })
)(UserList);