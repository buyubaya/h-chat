import gql from 'graphql-tag';


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

export const ADD_MESSAGE_MUTATION = gql`
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

// export const CREATE_CHAT_ROOM_MUTATION = gql`
//     mutation {
//         createChatRoom {
//             groupId
//         }
//     }
// `;

// export const SEND_MESSAGE_MUTATION = gql`
//     mutation sendMessage(
//         $senderId: String!,
//         $senderName: String!,
//         $receiverId: String!,
//         $roomId: String!,
//         $content: String!
//     ) 
//     {
//         createChatRoom(
//             senderId: $senderId,
//             senderName: $senderName,
//             receiverId: $receiverId,
//             roomId: $roomId,
//             content: $content
//         ) 
//         {
//             sender{
//                 userId
//                 userName
//             }
//             receiver {
//                 userId
//             }
//             groupId
//             content
//         }
//     }
// `;

// // export const MESSAGE_RECEIVED_SUBSCRIPTION = gql`
// //     subscription messageReceived($receiverId: String!){
// //         messageReceived(receiverId: $receiverId){
// //             sender{
// //                 userId
// //                 userName
// //             }
// //             receiver {
// //                 userId
// //             }
// //             groupId
// //             content
// //         }
// //     }
// // `;

// export const INVITE_TO_ROOM_MUTATION = gql`
//     mutation inviteToRoom(
//         $senderId: String!, 
//         $senderName: String!, 
//         $receiverId: String!,
//         $roomId: String!
//     )
//     {
//         inviteToRoom(
//             senderId: $senderId, 
//             senderName: $senderName,
//             receiverId: $receiverId,
//             roomId: $roomId
//         )
//         {
//             senderId
//             senderName
//             receiverId
//             roomId
//             createdAt
//         }
//     }
// `;

// export const ROOM_QUERY = gql`
//     query room($receiverId: String!){
//         room(receiverId: $receiverId){
//             senderId
//             senderName
//             receiverId
//             roomId
//             createdAt
//         }
//     }
// `;

// export const ROOM_INVITED_SUBSCRIPTION = gql`
//     subscription roomInvited($receiverId: String!){
//         roomInvited(receiverId: $receiverId){
//             senderId
//             senderName
//             receiverId
//             roomId
//             createdAt
//         }
//     }
// `;