import gql from 'graphql-tag';


export const COMMENT_QUERY = gql`
    query {
        comment {
            commentId
            userId
            userName
            content
            createdAt
        }
    }
`;

export const USER_STATUS_QUERY = gql`
    query {
        userStatus {
            userId
            userName
            groupId
            isTyping
        }
    }
`;

export const ADD_COMMENT_MUTATION = gql`
    mutation addComment($userId: String!, $userName: String!, $groupId: String, $content: String!) {
        addComment(userId: $userId, userName: $userName, groupId: $groupId, content: $content) {
            userId
            userName
            groupId
            content
            createdAt
            error
        }
    }
`;

export const COMMENTS_SUBSCRIPTION = gql`
    subscription commentAdded($groupId: String){
        commentAdded(groupId: $groupId) {
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