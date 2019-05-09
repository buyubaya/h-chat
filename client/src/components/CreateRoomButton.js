import React, { Component } from 'react';
import { Button, Input } from 'antd';
// APOLLO
import { Query, Mutation, Subscription, graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
// GRAPHQL
const CREATE_CHAT_ROOM_MUTATION = gql`
    mutation {
        createChatRoom {
            groupId
        }
    }
`;


class CreateRoomButton extends Component {
    render() {
        return (
            <Mutation mutation={CREATE_CHAT_ROOM_MUTATION}>
                {(createChatRoom, { data, error, loading }) => {
                    return (
                        <Button
                            onClick={() => {
                                createChatRoom();
                            }}
                        >
                            Create a Room
                        </Button>
                    );
                }}
            </Mutation>
        )
    }
}


export default CreateRoomButton;
