const jwt = require('jsonwebtoken');
const apolloServer = require('apollo-server');
const PubSub = apolloServer.PubSub;
const withFilter = apolloServer.withFilter;
// FIREBASE
const { base, ref, getData } = require('../firebase/firebase');
// CONSTANTS
const USER_UPDATED = 'USER_UPDATED';
const USER_REMOVED = 'USER_REMOVED';
const COMMENT_ADDED = 'COMMENT_ADDED';
const USER_STATUS_UPDATED = 'USER_STATUS';
const MESSAGE_RECEIVED = 'MESSAGE_RECEIVED';
const ROOM_INVITED = 'ROOM_INVITED';
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

            return userList;
        },
        message: () => {
            return [];
        },
        userStatus: () => {
            return [];
        },
        room: () => {
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
        joinRoom: async (_, { userId, userName, isNew }) => {
            const createdAt = Date.now();
            let userUpdated = {
                userId, 
                userName,
                createdAt
            };
            if(isNew){
                const newRef = await ref('users').push({ userName, createdAt });
                userUpdated = { 
                    userId: newRef.key, 
                    userName,
                    createdAt
                };
            }     

            // PUBLISH USER SUBSCRPTION
            pubsub.publish(USER_UPDATED, { userUpdated });
            
            return userUpdated;
        },

        sendMessage: async (_, { userId, userName, replyId, groupId, content }) => {
            const newMessage = {
                userId,
                userName, 
                replyId: replyId || '',
                groupId: groupId || '', 
                content, 
                createdAt: Date.now()
            };
            
            let MESSAGE;
            if(content && content.trim()){
                // ADD TO FIREBASE
                const newRef = await ref('comments').push(newMessage);
                MESSAGE = {
                    commentId: newRef.key,
                    ...newMessage
                };
            }
            else {
                MESSAGE = { error: 'Invalid Comment' };
            }

            // PUBLISH SUBSCRIPTION
            pubsub.publish(COMMENT_ADDED, { newMessage: MESSAGE });

            return MESSAGE;
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

        inviteToRoom: (_, { senderId, senderName, receiverId, roomId }) => {
            const roomInvited = {
                senderId, 
                senderName, 
                receiverId, 
                roomId,
                createdAt: Date.now()
            };
            
            // PUBLISH SUBSCRIPTION
            pubsub.publish(ROOM_INVITED, { roomInvited });

            return roomInvited;
        }
    },
    Subscription: {
        newMessage: {
            subscribe: withFilter(
                () => pubsub.asyncIterator([COMMENT_ADDED]),
                (payload, variables, context, info) => {
                    const groupId = variables && variables.groupId;
                    const replyId = variables && variables.replyId;
                    
                    if(payload && groupId){
                        return payload.newMessage.groupId === groupId;
                    }
                    if(payload && replyId){
                        return payload.newMessage.replyId === replyId;
                    }
                    return true;
                }
            )
        },

        userUpdated: {
            subscribe: (payload) => pubsub.asyncIterator([USER_UPDATED])
        },

        userStatusUpdated: {
            subscribe: withFilter(
                () => pubsub.asyncIterator([USER_STATUS_UPDATED]),
                (payload, variables) => {
                    const userId = variables && variables.userId;
                    const groupId = variables && variables.groupId;
                    const replyId = variables && variables.replyId;
                    
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

        roomInvited: {
            subscribe: withFilter(
                () => pubsub.asyncIterator([ROOM_INVITED]),
                (payload, variables) => {
                    const receiverId = variables && variables.receiverId;
                    
                    if(payload && receiverId){
                        return payload.roomInvited.receiverId === receiverId;
                    }

                    return true;
                }
            )
        }
    }
};


module.exports = resolvers;