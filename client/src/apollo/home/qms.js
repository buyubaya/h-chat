import gql from 'graphql-tag';


export const ADD_COMMENT_MUTATION = gql`
    mutation addComment($userId: String!, $userName: String!, $replyId: String, $content: String!) {
        addComment(userId: $userId, userName: $userName, replyId: $replyId, content: $content) {
            userId
            userName
            replyId
            content
            createdAt
            error
        }
    }
`;

export const COMMENTS_SUBSCRIPTION = gql`
    subscription {
        commentAdded {
            commentId
            userId
            userName
            replyId
            content
            createdAt
            error
        }
    }
`;

export const REMOVE_USER_MUTATION = gql`
    mutation removeUserById($userId: String!) {
        removeUserById(userId: $userId)
    }
`;