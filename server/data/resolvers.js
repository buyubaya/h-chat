const jwt = require('jsonwebtoken');
const apolloServer = require('apollo-server');
const PubSub = apolloServer.PubSub;
const withFilter = apolloServer.withFilter;
// FIREBASE
const { base, ref, getData } = require('../firebase/firebase');
// CONSTANTS
const USER_UPDATED = 'USER_UPDATED';
const NEW_MESSAGE = 'NEW_MESSAGE';
const USER_STATUS_UPDATED = 'USER_STATUS';
const pubsub = new PubSub();


const resolvers = {
    Query: {
        message: () => {
            return [];
        },
        userStatus: () => {
            return [];
        }
    },
    Mutation: {
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

        sendMessage: async (_, { sender, receiverId, roomId, groupId, content }) => {
            const newMessage = {
                sender: {
                    userId: sender ? sender.userId : '',
                    userName: sender ? sender.userName : ''
                },
                receiverId: receiverId || [],
                roomId: roomId || '',
                groupId: groupId || '',
                content: content || '', 
                createdAt: Date.now()
            };
            
            let MESSAGE;
            if(newMessage.content && newMessage.content.trim()){
                // ADD TO FIREBASE
                const newRef = await ref('comments').push(newMessage);
                MESSAGE = {
                    messageId: newRef.key,
                    ...newMessage
                };
            }
            else {
                MESSAGE = { error: 'Invalid Comment' };
            }
            
            // PUBLISH SUBSCRIPTION
            pubsub.publish(NEW_MESSAGE, { newMessage: MESSAGE });

            return MESSAGE;
        },

        updateUserStatus: (_, { senderId, senderName, roomId, isTyping }) => {
            const createdAt = Date.now();
            const userStatusUpdated = {
                senderId,
                senderName,
                roomId,
                isTyping: isTyping ? true : false,
                createdAt
            };

            pubsub.publish(USER_STATUS_UPDATED, { userStatusUpdated });
            return userStatusUpdated;
        }
    },
    Subscription: {
        newMessage: {
            subscribe: withFilter(
                () => pubsub.asyncIterator([NEW_MESSAGE]),
                (payload, variables={}, context, info) => {
                    if(!variables){
                        return false;
                    }

                    const { userId, roomId, groupId, receiverId } = variables;

                    if(payload){
                        const isUserIdValid = userId && userId.includes(payload.newMessage.sender.userId);
                        const isRoomIdValid = roomId && roomId.includes(payload.newMessage.roomId);
                        const isGroupIdValid = groupId && groupId.includes(payload.newMessage.groupId);
                        const isReceiverValid = payload.newMessage.receiverId.includes(receiverId);

                        return isUserIdValid || isRoomIdValid || isGroupIdValid || isReceiverValid;
                    }
                    
                    return false;
                }
            )
        },

        userStatusUpdated: {
            subscribe: withFilter(
                () => pubsub.asyncIterator([USER_STATUS_UPDATED]),
                (payload, variables) => {
                    if(!variables){
                        return false;
                    }

                    const { senderId, receiverId, roomId } = variables;
                    
                    if(roomId === 'ROOM_admin'){
                        return false;
                    }
                    if(payload && roomId && receiverId){
                        return payload.newMessage.roomId === roomId || payload.newMessage.receiverId === receiverId;
                    }
                    if(payload && roomId){
                        return payload.userStatusUpdated.senderId !== senderId &&payload.userStatusUpdated.roomId === roomId;
                    }
                    if(payload && receiverId){
                        return payload.userStatusUpdated.senderId !== senderId && payload.userStatusUpdated.receiverId === receiverId;
                    }
                    if(!roomId && !receiverId){
                        return false;
                    }
                    
                    return true;
                }
            )
        }
    }
};


module.exports = resolvers;