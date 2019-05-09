import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Query, Mutation, Subscription, graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
// ANTD
import {
    Comment, Avatar, Form, Button, List, Input, Layout
} from 'antd';
import moment from 'moment';
const { Header, Content, Sider } = Layout;
// COMPONENTS
import UserList from '../components/home/UserList';
import JoinForm from '../components/home/JoinForm';
import ChatBox from '../components/home/ChatBox';
import {
    REMOVE_USER_MUTATION
} from '../apollo/home/qms';


class HomePage extends Component {
    state = {
        userId: '',
        userName: '',
        joinedRoom: false
    };

    componentWillMount() {
        window.addEventListener('unload', this.handleUnLoad);
    }

    componentWillUnMount() {
        window.removeEventListener('unload', this.handleUnLoad);
    }

    handleUnLoad = () => {
        this.removeUserFromRoom();
    }

    removeUserFromRoom = () => {
        const { userId } = this.state;
        const { removeUserMutation } = this.props;
        removeUserMutation && removeUserMutation({ variables: { userId } })
            .then(() => this.setState({
                userName: '',
                joinedRoom: false
            }));
    }

    render() {
        const { userId, userName, joinedRoom } = this.state;
        const user = { userId, userName };

        return (
            <div>
                <h1>CHAT ROOM</h1>
                <div>
                    {
                        !joinedRoom &&
                        <JoinForm onJoinRoom={({ data }) => {
                            const userId = data && data.joinRoom.userId;
                            const userName = data && data.joinRoom.userName;
                            this.setState({ userId, userName, joinedRoom: true });
                        }} />
                    }
                    {
                        joinedRoom &&
                        <div>
                            <Button onClick={this.removeUserFromRoom}>
                                Leave Chat Room
                            </Button>

                            <ChatBox user={user} />
                            <UserList />
                        </div>
                    }
                </div>
            </div>
        );
    }
}


export default compose(
    graphql(REMOVE_USER_MUTATION, { name: 'removeUserMutation' })
)(HomePage);