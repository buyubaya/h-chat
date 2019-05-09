const jwt = require('jsonwebtoken');
const apolloServer = require('apollo-server');
const PubSub = apolloServer.PubSub;
const withFilter = apolloServer.withFilter;
// FIREBASE
const { base, ref, getData } = require('../firebase/firebase');
// CONSTANTS
const USER_ADDED = 'USER_ADDED';
const USER_REMOVED = 'USER_REMOVED';
const COMMENT_ADDED = 'COMMENT_ADDED';
const USER_STATUS_UPDATED = 'USER_STATUS';
const MESSAGE_RECEIVED = 'MESSAGE_RECEIVED';
const pubsub = new PubSub();


const resolvers = {
    Query: {
        user: async () => {
            let userList = await getData('users');
            userList = userList.map(item => {
                return({
                    userId: item.id,
                    userName: item.userName,
                    createdAt: item.createdAt   
                });
            });

            return userList.reverse();
        },
        comment: () => {
            return [];
        },
        userStatus: () => {
            return [];
        }
    },
    Mutation: {
        createChatRoom: async () => {
            const createdAt = Date.now();
            const newRef = await ref('rooms').push({ createdAt });

            // PUBLISH ROOM SUBSCRPTION
            const room = { 
                groupId: newRef.key, 
                createdAt
            };
            
            return room;
        },
        joinRoom: async (_, { userName }) => {
            const createdAt = Date.now();
            const newRef = await ref('users').push({ userName, createdAt });

            // PUBLISH USER SUBSCRPTION
            const userAdded = { 
                userId: newRef.key, 
                userName,
                createdAt
            };
            pubsub.publish(USER_ADDED, { userAdded });
            
            return userAdded;
        },

        addComment: async (_, { userId, userName, replyId, groupId, content }) => {
            const commentAdded = {
                userId,
                userName, 
                replyId: replyId || '',
                groupId: groupId || '', 
                content, 
                createdAt: Date.now()
            };
            
            let commentResponse;
            if(content && content.trim()){
                // ADD TO FIREBASE
                const newRef = await ref('comments').push(commentAdded);
                // PUBLISH COMMENT SUBSCRIPTION
                commentResponse = {
                    commentId: newRef.key,
                    ...commentAdded
                };
                pubsub.publish(COMMENT_ADDED, { commentAdded: commentResponse });
            }
            else {
                commentResponse = { error: 'Invalid Comment' };
            }

            return commentResponse;
        },

        removeAllUsers: async () => {
            try {
                await ref('users').remove();
                return true;
            }
            catch(error) {
                return false;
            }
        },
        removeUserById: async (_, { userId }) => {
            try {
                await ref('users').child(userId).remove();
                pubsub.publish(USER_REMOVED, { userRemoved: { userId, createdAt: Date.now() } });

                // CHECK CURRENT USER LIST
                const currentUserList = await getData('users');
                if(currentUserList.length < 1){
                    await ref('comments').remove();
                }

                return true;
            }
            catch(error){
                return false;
            }
        },

        login: async (_, { userId, password }) => {
            if(userId === 'admin' && password === 'P@ssword123'){
                // JWT
                const token = jwt.sign({ userId, password }, 'Chat Secret', { expiresIn: 60 });
                return { token };
            }
            else {
                return { error: 'Invalid Username or Password' };
            }

            // try{
            //     const decoded = await jwt.verify(token, 'Chat Secret');
            //     if(decoded.userId === 'admin' && decoded.password === 'P@ssword123'){
            //         return { token };
            //     }
            // }
            // catch(err){
            //     return { error: 'Invalid Username or Password' };
            // }
        },

        updateUserStatus: (_, { userId, userName, groupId, isTyping }) => {
            const createdAt = Date.now();

            pubsub.publish(USER_STATUS_UPDATED, { 
                userStatusUpdated: { 
                    userId,
                    userName,
                    createdAt,
                    groupId,
                    isTyping: isTyping ? true : false 
                } 
            });
            return { userId, userName, createdAt, groupId, isTyping: isTyping ? true : false };
        },

        sendMessage: (_, { senderId, senderName, groupId, receiverId, content }) => {
            const sender = {
                userId: senderId,
                userName: senderName
            };
            const receiver = {
                userId: receiverId
            };
            const messageRecceived = {
                sender,
                receiver,
                groupId,
                content
            };

            // PUBLISH SUBSCRIPTION
            pubsub.publish(MESSAGE_RECEIVED, { messageRecceived });

            return messageRecceived;
        }
    },
    Subscription: {
        commentAdded: {
            subscribe: withFilter(
                () => pubsub.asyncIterator([COMMENT_ADDED]),
                (payload, variables, context, info) => {
                    const groupId = variables && variables.groupId;
                    const replyId = variables && variables.replyId;
                    console.log('SUB', payload, replyId);
                    if(payload && groupId){
                        return payload.commentAdded.groupId === groupId;
                    }
                    if(payload && replyId){
                        return payload.commentAdded.replyId === replyId;
                    }
                    return true;
                }
            )
        },
        userAdded: {
            subscribe: () => pubsub.asyncIterator([USER_ADDED])
        },
        userRemoved: {
            subscribe: () => pubsub.asyncIterator([USER_REMOVED])
        },

        userStatusUpdated: {
            subscribe: withFilter(
                () => pubsub.asyncIterator([USER_STATUS_UPDATED]),
                (payload, variables) => {
                    const userId = variables && variables.userId;
                    const groupId = variables && variables.groupId;
                    const replyId = variables && variables.replyId;
                    console.log('STATUS', payload, variables);
                    if(payload && groupId){
                        return payload.userStatusUpdated.userId !== userId &&payload.userStatusUpdated.groupId === groupId;
                    }
                    if(payload && replyId){
                        return payload.userStatusUpdated.userId !== userId && payload.userStatusUpdated.replyId === replyId;
                    }
                    return true;
                }
            )
        },

        messageReceived: {
            subscribe: withFilter(
                () => pubsub.asyncIterator([MESSAGE_RECEIVED]),
                (payload, variables) => {
                    const receiverId = variables && variables.receiverId;
                    console.log('SUB', payload, receiverId);
                    if(payload && receiverId){
                        return payload.messageRecceived.receiver.userId !== receiverId;
                    }

                    return true;
                }
            )
        }
    }
};


module.exports = resolvers;