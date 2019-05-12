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

// MESSAGE
export const MESSAGE_QUERY = gql`
    query message($roomId: String){
        message(roomId: $roomId) {
            messageId
            sender {
                userId
                userName
            }
            receiver {
                userId
            }
            content
            createdAt
        }
    }
`;

export const SEND_MESSAGE_MUTATION = gql`
    mutation sendMessage(
        $sender: Sender
        $receiver: Receiver,
        $roomId: String,
        $groupId: String,
        $content: String!
    )
    {
        sendMessage(
            sender: $sender, 
            receiver: $receiver,
            roomId: $roomId,
            groupId: $groupId,
            content: $content
        )
        {
            sender {
                userId
                userName
            }
            receiver {
                userId
            }
            roomId
            groupId
            content
            createdAt
            error
        }
    }
`;

export const MESSAGE_SUBSCRIPTION = gql`
    subscription newMessage($userId: [String], $roomId: [String], $groupId: [String]) {
        newMessage(userId: $userId, roomId: $roomId, groupId: $groupId) {
            messageId
            sender {
                userId
                userName
            }
            receiver {
                userId
                userName
            }
            roomId
            groupId
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
