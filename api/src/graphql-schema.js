// import { fileLoader, mergeTypes } from 'merge-graphql-schemas';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import { mergeTypeDefs } from '@graphql-toolkit/schema-merging';
import { loadFilesSync } from '@graphql-tools/load-files';
import path from "path";

/**
 * Load graphql schemas form schema/types directory
 */
// const schemaDir = path.join(__dirname, '../../schema/types');
// const typesArray = fileLoader(schemaDir);
// export const typeDefs = mergeTypes(typesArray, { all: true }).toString("utf-8");

/**
 * Load graphql schemas form schema/types directory
 */
 const schemaDir = path.join(__dirname, '../../schema/types');
 // console.log(schemaDir)
 const typesArray = loadFilesSync(schemaDir);
 // console.log(typesArray);
 export const typeDefs = mergeTypes(typesArray, { all: true }).toString("utf-8");


