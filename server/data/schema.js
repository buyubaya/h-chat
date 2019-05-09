const gql = require('apollo-server-express').gql;


const typeDefs = gql`
    type Query {
        user: [User]
        comment: [CommentResponse]
        userStatus: [UserStatus]
    }

    type Mutation {
        createChatRoom: ChatRoom
        joinRoom(userName: String!): User
        addComment(userId: String!, userName: String!, replyId: String, groupId: String, content: String!): CommentResponse
        removeAllUsers: Boolean
        removeUserById(userId: String): Boolean
        login(userId: String!, password: String!): LoginResponse
        updateUserStatus(userId: String!, userName: String!, groupId: String, isTyping: Boolean): UserStatus
        sendMessage(senderId: String!, senderName: String!, groupId: String!, receiverId: String!, content: String!): MessageReceived
    }

    type Subscription {
        userAdded: User
        userRemoved: User
        commentAdded(groupId: String, replyId: String): CommentResponse
        userStatusUpdated(userId: String, groupId: String, isTyping: Boolean): UserStatus
        messageReceived(receiverId: String!): MessageReceived
    }

    type User {
        userId: String!
        userName: String!
        createdAt: String!
    }

    type LoginResponse {
        token: String
        error: String
    }

    type CommentResponse {
        commentId: String!
        userId: String!
        userName: String!
        replyId: String
        groupId: String
        content: String!
        createdAt: String!
        error: String
    }

    type UserStatus {
        userId: String!
        userName: String!
        createdAt: String!
        groupId: String
        isTyping: Boolean
    }

    type ChatRoom {
        groupId: ID!
        createdAt: String
    }

    type Sender {
        userId: String!
        userName: String!
    }

    type Receiver {
        userId: String!
    }

    type MessageReceived {
        sender: Sender!
        receiver: Receiver!
        groupId: String!
        content: String!
    }
`;


module.exports = typeDefs;