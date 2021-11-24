import { typeDefs } from "./graphql-schema";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import http from 'http';
import express from "express";
import dotenv from "dotenv";
import "babel-polyfill";
import UnitFloatScalarType from "./units/UnitFloatScalarType"


const neo4j = require("neo4j-driver");
const { Neo4jGraphQL } = require("@neo4j/graphql");

// Set environment variables from ../.env
dotenv.config();

// Create express app
const app = express();
const httpServer = http.createServer(app);

// List all custom resolvers
const resolvers = {
  UnitFloat: new UnitFloatScalarType("UnitFloat"),
  Meters: new UnitFloatScalarType("Meters", "m"),
  SquareMeters: new UnitFloatScalarType("SquareMeters", "m2"),
  CubicMilliMeters: new UnitFloatScalarType("CubicMilliMeters", "mm3"),
  CubicMeters: new UnitFloatScalarType("CubicMeters", "m3"),
  Amperes: new UnitFloatScalarType("Amperes", "A"),
  Kiloamperes: new UnitFloatScalarType("Kiloamperes", "kA"),
  Milliamperes: new UnitFloatScalarType("Milliamperes", "mA"),
  Watts: new UnitFloatScalarType("Watts", "W"),
  VoltAmperes: new UnitFloatScalarType("VoltAmperes", "VA"),
  LitersPerSecond: new UnitFloatScalarType("LitersPerSecond", "l_per_s")
};

/*
 * Create an executable GraphQL schema object from GraphQL type definitions
 * including autogenerated queries and mutations.
 * Optionally a config object can be included to specify which types to include
 * in generated queries and/or mutations.  
 */
const neo4jGraphQL = new Neo4jGraphQL({
  typeDefs,
  resolvers, 
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  config: {
    auth: {
      isAuthenticated: true,
      hasRole: true
    }
  }
});

const schema = neo4jGraphQL.schema;

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

/*
// Custom middleware to add a user object to the server requests
const injectUser = async req => {
  try {
    var token = req.headers.authorization;
    var stToken = token.substring(7, token.length);
    var nv = await jwt.verify(stToken, JWT_SECRET);
    req.user = { name:nv.preferred_username, id:nv.oid};
    req.groups = nv.groups;
    console.log(req.user);
  } catch (error) {
    console.error(error);
  }
  req.next();
};

app.use(injectUser);
*/

/*
 * Create a new ApolloServer instance, serving the GraphQL schema
 * injecting the Neo4j driver instance into the context object
 * so it is available in the  generated resolvers
 * to connect to the database.
 */
const startServer = async () => {
  const server = new ApolloServer({
    context: ({ req }) => {
      return {
        driver,
        req,
        headers: req.headers
      };
    },
    schema: schema,
    introspection: true,
    playground: true
  });

  await server.start();

  /*
  * Optionally, apply Express middleware for authentication, etc
  * This also also allows us to specify a path for the GraphQL endpoint
  */
  server.applyMiddleware({ app });

  // Specify port and path for GraphQL endpoint
  const port = process.env.GQL_PORT || 4001;
  const path = "/graphql";
  
  await new Promise(resolve => httpServer.listen({ port: port, path: path }, resolve));
  console.log(`🚀 Server listening at http://localhost:${port}${path}`);
}

startServer();
