import React, { Component } from 'react';
import { List, Modal } from 'antd';
// APOLLO
import { Query, Mutation, Subscription, graphql, compose } from 'react-apollo';
import {
    USER_QUERY,
    USER_SUBSCRIPTION,
    REMOVE_USER_SUBSCRIPTION
} from '../apollo/qms';



class UserList extends Component {
    state = {
        userList: [],
        isFirst: true,
        modalVisible: false
    };

    componentWillMount(){
        // MESSAGE
        const { userQuery } = this.props;
        const userSubscribeToMore = userQuery && userQuery.subscribeToMore;

        this.unsubscribe = [
            userSubscribeToMore && userSubscribeToMore({
                document: USER_SUBSCRIPTION,
                updateQuery: (prev, { subscriptionData }) => {
                    if(!subscriptionData){
                        return prev;
                    }
                    
                    const newItem = subscriptionData.data.userUpdated;
                    return Object.assign({}, prev, {
                        user: [ ...prev.user, newItem ]
                    });
                }
            })
        ];
    }

    componentWillUnmount(){
        this.unsubscribe();
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