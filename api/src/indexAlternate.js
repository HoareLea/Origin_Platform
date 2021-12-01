
import  * as graphqlschema from "./graphql-schema";
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import http from 'http';
import express from "express";
import dotenv from "dotenv";
import "babel-polyfill";

const { Neo4jGraphQL } = require("@neo4j/graphql");
const { ApolloServer } = require("apollo-server");
const neo4j = require("neo4j-driver");

// Set environment variables from ../.env

dotenv.config();

const startServer = async () => {
  const typeDefs = graphqlschema.getTypeDefs();
  const driver = neo4j.driver(
    process.env.NEO4J_URI || "bolt://localhost:7687",
    neo4j.auth.basic(
      process.env.NEO4J_USER || "neo4j",
      process.env.NEO4J_PASSWORD || "neo4j"
    )
  );

  const neoSchema = new Neo4jGraphQL({ typeDefs, driver });

  //await neoSchema.assertConstraints({ options: { create: true }});

  const server = new ApolloServer({
    schema: neoSchema.schema,
    context: ({ req }) => ({ req })
  });

  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
  
}

startServer();
