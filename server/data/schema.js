const gql = require('apollo-server-express').gql;


const typeDefs = gql`
    type Query {
        message(roomId: String): [Message]
        userStatus(roomId: String!): [UserStatus]
    }

    type Mutation {
        joinRoom(userId: String, userName: String!, isNew: Boolean!): User
        sendMessage(sender: Sender, receiverId: [String], roomId: String, groupId: String, content: String!): Message
        updateUserStatus(senderId: String!, senderName: String!, roomId: String, isTyping: Boolean): UserStatus
    }

    type Subscription {
        newMessage(userId: [String], roomId: [String], groupId: [String], receiverId: String): Message
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
        sender: SenderOutput
        receiverId: [String]
        roomId: String
        groupId: String
        content: String!
        createdAt: String!
        error: String
    }

    input Sender {
        userId: String
        userName: String
    }

    type SenderOutput {
        userId: String
        userName: String
    }

    input Receiver {
        userId: String
        userName: String
    }

    type ReceiverOutput {
        userId: String
        userName: String
    }
`;


module.exports = typeDefs;