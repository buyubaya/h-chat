const gql = require('apollo-server-express').gql;


const typeDefs = gql`
    type Query {
        message(roomId: String): [Message]
        userStatus(roomId: String!): [UserStatus]
    }

    type Mutation {
        joinRoom(userId: String, userName: String!, isNew: Boolean!): User
        sendMessage(sender: MessageFromInput, receiver: MessageToInput, content: String!): Message
        updateUserStatus(senderId: String!, senderName: String!, roomId: String, isTyping: Boolean): UserStatus
    }

    type Subscription {
        newMessage(sender: MessageFromSubscriptionInput, receiver: MessageToSubscriptionInput): Message
        userStatusUpdated(senderId: String, roomId: String, isTyping: Boolean): UserStatus
    }

    type User {
        userId: String!
        userName: String!
        createdAt: String!
    }

    type UserStatus {
        senderId: String!
        senderName: String!
        roomId: String
        isTyping: Boolean
        createdAt: String!
    }

    # SEND MESSAGE
    type Message {
        messageId: String!
        sender: MessageFromOutput
        receiver: MessageToOutput
        content: String!
        createdAt: String!
        error: String
    }

    input MessageFromInput {
        userId: String
        userName: String
    }

    type MessageFromOutput {
        userId: String
        userName: String
    }

    input MessageToInput {
        userId: [String]
        roomId: [String]
        groupId: [String]
    }

    type MessageToOutput {
        userId: [String]
        roomId: [String]
        groupId: [String]
    }

    input MessageFromSubscriptionInput {
        userId: [String]
    }

    input MessageToSubscriptionInput {
        userId: [String]
        roomId: [String]
        groupId: [String]
    }
`;


module.exports = typeDefs;