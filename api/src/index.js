
/**
 * Apollo server express based on docs
 * https://www.apollographql.com/docs/apollo-server/integrations/middleware/#apollo-server-express
 */

const getTypeDefs = require("./graphql-schema");
const { ApolloServer } = require("apollo-server-express");
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const http = require('http');
const express = require("express");
require("babel-polyfill");
require('dotenv').config();
const { getIntrospectionQuery } = require("graphql");
const { initializeSentry } = require("./utils/sentry");

// Initialize sentry at top level
initializeSentry();

const morgan = require('morgan');
const passport = require('passport');
const BearerStrategy = require('passport-azure-ad').BearerStrategy;
const cors = require('cors');

const routeGuard = require('./utils/guard');

const neo4j = require("neo4j-driver");
const { Neo4jGraphQL } = require("@neo4j/graphql");

// List of all custom resolvers and callbacks
const resolvers = require("./utils/resolvers");
const callbacks = require("./utils/services");

// Specify port and path for GraphQL endpoint
//this is the internal listen port for the server
//when used in a docker container, or, the external port
//when not used in a container
const port = process.env.GRAPHQL_LISTEN_PORT || 4001;
const path = "/graphql";

// Token validation options for azureAD
const options = {
  identityMetadata: `https://${process.env.AZURE_METADATA_AUTHORITY}/${process.env.AZURE_CREDENTIALS_TENANTID}/${process.env.AZURE_METADATA_VERSION}/${process.env.AZURE_METADATA_DISCOVERY}`,
  issuer: `https://${process.env.AZURE_METADATA_AUTHORITY}/${process.env.AZURE_CREDENTIALS_TENANTID}/${process.env.AZURE_METADATA_VERSION}`,
  clientID: process.env.AZURE_CREDENTIALS_CLIENTID,
  audience: process.env.AZURE_CREDENTIALS_AUDIENCE, // audience is this application
  validateIssuer: process.env.AZURE_SETTINGS_VALIDATE_ISSUER,
  passReqToCallback: process.env.AZURE_SETTINGS_PASS_REQUEST_TO_CALLBACK,
  loggingLevel: process.env.AZURE_SETTINGS_LOGGING_LEVEL,
};

const bearerStrategy = new BearerStrategy(options, (token, done) => {
  // Send user info using the second argument
  done(null, {}, token);
});

// Create express app
const app = express();
const httpServer = http.createServer(app);

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

// Add passport azure AD middleware 
app.use(passport.initialize());
passport.use(bearerStrategy);

// Validate token, check for role and serve
app.use(path,
  passport.authenticate('oauth-bearer', { session: false }),
  routeGuard,
);

/*
  * Create an executable GraphQL schema object from GraphQL type definitions
  * including autogenerated queries and mutations.  
  */
const typeDefs = getTypeDefs();

/*
* Create a Neo4j driver instance to connect to the database
* using credentials specified as environment variables
* with fallback to defaults
*/
const driver = neo4j.driver(
  process.env.NEO4J_URI || "bolt://localhost:7687",
  neo4j.auth.basic(
    process.env.NEO4J_USER || "neo4j",
    process.env.NEO4J_PASSWORD || "neo4j"
  )
);

const neo4jGraphQL = new Neo4jGraphQL({
  typeDefs,
  ...process.env.API_TARGET === 'ORIGIN' && {
    resolvers,
  },
  driver,
  config: {
    callbacks
  }
});

let server;
const startServer = async () => {
  // const schema = neo4jGraphQL.schema;
  const schema = await neo4jGraphQL.getSchema();

  /*
   * Create a new ApolloServer instance, serving the GraphQL schema
   * injecting the Neo4j driver instance into the context object
   * so it is available in the  generated resolvers
   * to connect to the database.
   */
  server = new ApolloServer({
    context: ({ req }) => {
      // Try to retrieve a user from the request token
      const jwt = (req) ? req.user : {};

      // Add the user to the context
      return { jwt, driver };
    },

    typeDefs,
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  /*
  * Optionally, apply Express middleware for authentication, etc
  * This also also allows us to specify a path for the GraphQL endpoint
  */
  server.applyMiddleware({ app });

  await new Promise(resolve => httpServer.listen({ port: port, path: path }, resolve));
  console.log(`🚀 Server listening at http://localhost:${port}${path}`);
}

startServer();

app.use('/schema', async (req, res) => {
  const introspectionQuery = getIntrospectionQuery({});
  const data = await server.executeOperation({ query: introspectionQuery });
  res.send(data);
})

app.use('/accesscontrol',
  passport.authenticate('oauth-bearer', { session: false }),
  routeGuard,
  (req, res) => {
    res.send(req.user.roles);
  }
);

module.exports = app;
