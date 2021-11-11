import { mergeTypeDefs } from '@graphql-tools/merge'
import { loadFilesSync } from '@graphql-tools/load-files'
import path from "path";

/**
 * Load graphql schemas form schema/Origin_Schema directory recursively
 */
const schemaDir = path.join(__dirname, '../../schema/Origin_Schema');
const typesArray = loadFilesSync(schemaDir, { recursive: true, extensions: ['graphql'] })

export const typeDefs = mergeTypeDefs(typesArray);
