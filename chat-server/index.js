const express = require('express');
const createServer = require('http').createServer;
const ApolloServer = require('apollo-server-express').ApolloServer;

const typeDefs = require('./data/schema');
const resolvers = require('./data/resolvers');

const PORT = process.env.PORT || 4000;

const app = express();

const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    subscriptions: {
        onConnect: (connectionParams, webSocket) => {
            console.log('Websocket CONNECTED', connectionParams);
        },
        onDisconnect: (webSocket) => {
            console.log('Websocket DISCONNECTED');
        }
    }
});
apolloServer.applyMiddleware({ app });

const httpServer = createServer(app);
apolloServer.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: PORT }, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`)
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${apolloServer.subscriptionsPath}`)
});