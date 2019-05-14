export const SEND_MESSAGE_MUTATION = `
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

{
    "sender": {
      "userId": "11111",
        "userName": "NAME 01111111"
    },
    "receiver": {
      "userId": "admin",
      "userName": "ADMIN"
    },
    "roomId": "R1",
    "groupId": "G1",
    "content": "12345"
}
`;

export const NEW_MESSAGE_SUBSCRIPTION = `
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
