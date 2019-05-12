const gql = require('apollo-server-express').gql;


const typeDefs = gql`
    type Query {
        user: [User]
        message(roomId: String): [Message]
        userStatus(roomId: String!): [UserStatus]
        # room(receiverId: String!): [RoomInvited]
    }

    type Mutation {
        # createChatRoom: ChatRoom
        joinRoom(userId: String, userName: String!, isNew: Boolean!): User
        sendMessage(senderId: String!, senderName: String!, receiverId: String, roomId: String, content: String!): Message
        removeAllUsers: Boolean
        removeUserById(userId: String): Boolean
        login(userId: String!, password: String!): LoginResponse
        updateUserStatus(senderId: String!, senderName: String!, roomId: String, isTyping: Boolean): UserStatus
        # inviteToRoom(senderId: String!, senderName: String!, receiverId: String!, roomId: String!): RoomInvited
    }

    type Subscription {
        userUpdated: User
        newMessage(roomId: String, receiverId: String): Message
        userStatusUpdated(senderId: String, roomId: String, isTyping: Boolean): UserStatus
        # roomInvited(receiverId: String!): RoomInvited
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

    type Message {
        messageId: String!
        senderId: String!
        senderName: String!
        receiverId: String
        roomId: String
        content: String!
        createdAt: String!
        error: String
    }

    type UserStatus {
        senderId: String!
        senderName: String!
        roomId: String
        isTyping: Boolean
        createdAt: String!
    }

    # type ChatRoom {
    #     groupId: ID!
    #     createdAt: String
    # }

    # type RoomInvited {
    #     senderId: String!
    #     senderName: String!
    #     receiverId: String!
    #     roomId: String!
    #     createdAt: String
    # }
`;


module.exports = typeDefs;