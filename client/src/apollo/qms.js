import gql from 'graphql-tag';


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