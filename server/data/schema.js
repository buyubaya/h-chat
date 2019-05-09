const gql = require('apollo-server-express').gql;


const typeDefs = gql`
    type Query {
        user: [User]
        comment: [CommentResponse]
        userStatus: [UserStatus]
    }

    type User {
        userId: String!
        userName: String!
        createdAt: String!
    }

    type Mutation {
        joinRoom(userName: String!): User
        addComment(userId: String!, userName: String!, replyId: String, groupId: String, content: String!): CommentResponse
        removeAllUsers: Boolean
        removeUserById(userId: String): Boolean
        login(userId: String!, password: String!): LoginResponse
        updateUserStatus(userId: String!, userName: String!, groupId: String, isTyping: Boolean): UserStatus
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

    type Subscription {
        userAdded: User
        userRemoved: User
        commentAdded(groupId: String, replyId: String): CommentResponse
        userStatusUpdated(userId: String, groupId: String, isTyping: Boolean): UserStatus
    }

    type UserStatus {
        userId: String!
        userName: String!
        createdAt: String!
        groupId: String
        isTyping: Boolean
    }
`;


module.exports = typeDefs;