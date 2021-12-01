import { mergeTypeDefs } from '@graphql-tools/merge'
import { loadFilesSync } from '@graphql-tools/load-files'
import path from "path";

/**
 * Load graphql schemas form schema/Origin_Schema directory recursively
 */
export function getTypeDefs()
{  
    const schemaDir = path.join(__dirname, '../../schema/' + process.env.SCHEMA_ROOT);
    console.log("Loading GraphQL types from: " + schemaDir);
    const allSchemaDirs = schemaDir.split(";");

    const typesArray = loadFilesSync(allSchemaDirs, { recursive: true, extensions: ['graphql'] })

    return mergeTypeDefs(typesArray);
}


