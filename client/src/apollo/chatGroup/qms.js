import gql from 'graphql-tag';


export const COMMENT_QUERY = gql`
    query comment($roomId: String!){
        comment(roomId: $roomId) {
            commentId
            userId
            userName
            content
            createdAt
        }
    }
`;

export const USER_STATUS_QUERY = gql`
    query userStatus($roomId: String!){
        userStatus(roomId: $roomId) {
            userId
            userName
            groupId
            isTyping
        }
    }
`;

export const ADD_COMMENT_MUTATION = gql`
    mutation addComment(
        $userId: String!, 
        $userName: String!, 
        $replyId: String,
        $groupId: String, 
        $content: String!
    )
    {
        addComment(
            userId: $userId, 
            userName: $userName,
            replyId: $replyId,
            groupId: $groupId, 
            content: $content
        )
        {
            userId
            userName
            replyId
            groupId
            content
            createdAt
            error
        }
    }
`;

export const COMMENTS_SUBSCRIPTION = gql`
    subscription commentAdded($groupId: String, $replyId: String){
        commentAdded(groupId: $groupId, replyId: $replyId) {
            commentId
            userId
            userName
            replyId
            groupId
            content
            createdAt
            error
        }
    }
`;

export const USER_STATUS_MUTATION = gql`
    mutation updateUserStatus(
        $userId: String!, 
        $userName: String!, 
        $groupId: String, 
        $isTyping: Boolean
    ){
        updateUserStatus(
            userId: $userId, 
            userName: $userName, 
            groupId: $groupId, 
            isTyping: $isTyping
        ) {
            userId
            userName
            groupId
            isTyping
        }
    }
`;

export const USER_STATUS_SUBSCRIPTION = gql`
    subscription userStatusUpdated($userId: String, $groupId: String){
        userStatusUpdated(userId: $userId, groupId: $groupId) {
            userId
            userName
            groupId
            isTyping
        }
    }
`;

export const CREATE_CHAT_ROOM_MUTATION = gql`
    mutation {
        createChatRoom {
            groupId
        }
    }
`;

export const SEND_MESSAGE_MUTATION = gql`
    mutation sendMessage(
        $senderId: String!,
        $senderName: String!,
        $receiverId: String!,
        $groupId: String!,
        $content: String!
    ) 
    {
        createChatRoom(
            senderId: $senderId,
            senderName: $senderName,
            receiverId: $receiverId,
            groupId: $groupId,
            content: $content
        ) 
        {
            sender{
                userId
                userName
            }
            receiver {
                userId
            }
            groupId
            content
        }
    }
`;

export const MESSAGE_RECEIVED_SUBSCRIPTION = gql`
    subscription messageReceived($receiverId: String!){
        messageReceived(receiverId: $receiverId){
            sender{
                userId
                userName
            }
            receiver {
                userId
            }
            groupId
            content
        }
    }
`;

export const INVITE_TO_ROOM_MUTATION = gql`
    mutation inviteToRoom(
        $senderId: String!, 
        $senderName: String!, 
        $receiverId: String!,
        $roomId: String!
    )
    {
        inviteToRoom(
            senderId: $senderId, 
            senderName: $senderName,
            receiverId: $receiverId,
            roomId: $roomId
        )
        {
            senderId
            senderName
            receiverId
            roomId
            createdAt
        }
    }
`;

export const ROOM_INVITED_SUBSCRIPTION = gql`
    subscription roomInvited($receiverId: String!){
        roomInvited(receiverId: $receiverId){
            senderId
            senderName
            receiverId
            roomId
            createdAt
        }
    }
`;