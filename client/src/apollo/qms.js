import gql from 'graphql-tag';


// ROOM
export const JOIN_ROOM_MUTATION = gql`
    mutation joinRoom($userId: String, $userName: String!, $isNew: Boolean!) {
        joinRoom(userId: $userId, userName: $userName, isNew: $isNew) {
            userId
            userName
            createdAt
        }
    }
`;

// USER
export const USER_QUERY = gql`
    query {
        user {
            userId
            userName
            createdAt
        }
    }
`;

export const USER_SUBSCRIPTION = gql`
    subscription {
        userUpdated {
            userId
            userName
            createdAt
        }
    }
`;

// MESSAGE
export const MESSAGE_QUERY = gql`
    query message($roomId: String){
        message(roomId: $roomId) {
            messageId
            senderId
            senderName
            content
            createdAt
        }
    }
`;

export const SEND_MESSAGE_MUTATION = gql`
    mutation sendMessage(
        $senderId: String!, 
        $senderName: String!, 
        $receiverId: String,
        $roomId: String, 
        $content: String!
    )
    {
        sendMessage(
            senderId: $senderId, 
            senderName: $senderName,
            receiverId: $receiverId,
            roomId: $roomId, 
            content: $content
        )
        {
            senderId
            senderName
            receiverId
            roomId
            content
            createdAt
            error
        }
    }
`;

export const MESSAGE_SUBSCRIPTION = gql`
    subscription newMessage($roomId: String, $receiverId: String){
        newMessage(roomId: $roomId, receiverId: $receiverId) {
            messageId
            senderId
            senderName
            receiverId
            roomId
            content
            createdAt
            error
        }
    }
`;

// USER STATUS
export const USER_STATUS_QUERY = gql`
    query userStatus($roomId: String!){
        userStatus(roomId: $roomId) {
            senderId
            senderName
            roomId
            isTyping
        }
    }
`;

export const USER_STATUS_MUTATION = gql`
    mutation updateUserStatus(
        $senderId: String!, 
        $senderName: String!, 
        $roomId: String, 
        $isTyping: Boolean
    ){
        updateUserStatus(
            senderId: $senderId, 
            senderName: $senderName, 
            roomId: $roomId, 
            isTyping: $isTyping
        ) {
            senderId
            senderName
            roomId
            isTyping
        }
    }
`;

export const USER_STATUS_SUBSCRIPTION = gql`
    subscription userStatusUpdated($senderId: String, $roomId: String){
        userStatusUpdated(senderId: $senderId, roomId: $roomId) {
            senderId
            senderName
            roomId
            isTyping
        }
    }
`;
