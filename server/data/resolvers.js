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
// FUNCTIONS
function isTwoArrayHasCommon(a1, a2){
    let x = false;
    a1 && a1.forEach(item => {
        if(a2){
            if(a2.includes(item)){
                x = true;
                return;
            }
        }
        return false;
    });
    return x;
}


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
                newRef.remove();
            }     

            // PUBLISH USER SUBSCRPTION
            pubsub.publish(USER_UPDATED, { userUpdated });
            
            return userUpdated;
        },

        sendMessage: async (_, { sender, receiver, content }) => {
            const newMessage = {
                sender: {
                    userId: (sender && sender.userId) ? sender.userId : '',
                    userName: (sender && sender.userName) ? sender.userName : '',
                    roomId: (sender && sender.roomId) ? sender.roomId : '',
                    groupId: (sender && sender.groupId) ? sender.groupId : ''
                },
                receiver: {
                    userId: (receiver && receiver.userId) ? receiver.userId : [],
                    roomId: (receiver && receiver.roomId) ? receiver.roomId : [],
                    groupId: (receiver && receiver.groupId) ? receiver.groupId : []
                },
                content: content || '', 
                createdAt: Date.now()
            };
            
            let MESSAGE;
            if(newMessage.content && newMessage.content.trim()){
                // ADD TO FIREBASE
                const newRef = await ref('messages').push(newMessage);
                MESSAGE = {
                    messageId: newRef.key,
                    ...newMessage
                };
                newRef.remove();
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

                    const fromUserId = variables && variables.sender && variables.sender.userId;
                    const fromRoomId = variables && variables.sender && variables.sender.roomId;
                    const fromGroupId = variables && variables.sender && variables.sender.groupId;

                    const toUserId = variables && variables.receiver && variables.receiver.userId;
                    const toRoomId = variables && variables.receiver && variables.receiver.roomId;
                    const toGroupId = variables && variables.receiver && variables.receiver.groupId;

                    if(payload){
                        const isFromUserIdValid = fromUserId && fromUserId.includes(payload.newMessage.sender.userId);
                        const isFromRoomIdValid = fromRoomId && fromRoomId.includes(payload.newMessage.sender.roomId);
                        const isFromGroupIdValid = fromGroupId && fromGroupId.includes(payload.newMessage.sender.groupId);

                        const isToUserIdValid = variables && variables.receiver && isTwoArrayHasCommon(payload.newMessage.receiver.userId, toUserId);
                        const isToRoomIdValid = variables && variables.receiver && isTwoArrayHasCommon(payload.newMessage.receiver.roomId, toRoomId);
                        const isToGroupIdValid = variables && variables.receiver && isTwoArrayHasCommon(payload.newMessage.receiver.groupId, toGroupId);

                        return isFromUserIdValid || isFromRoomIdValid || isFromGroupIdValid || isToUserIdValid || isToRoomIdValid || isToGroupIdValid;
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