import { mergeTypeDefs } from '@graphql-tools/merge'
import { loadFilesSync } from '@graphql-tools/load-files'
import path from "path";

/**
 * Load graphql schemas form schema/Origin_Schema directory recursively
 */
export function getTypeDefs()
{  
    const schemaRoot = process.env.SCHEMA_ROOT || "";

    const allSchemaDirs = schemaRoot.split(";").map((s) => {
        const schemaDir = path.join(__dirname, '../../schema/' + s);
        console.log("Loading GraphQL types from: " + schemaDir);
        return schemaDir;
    });

    const typesArray = loadFilesSync(allSchemaDirs, { recursive: true, extensions: ['graphql'] })

    return mergeTypeDefs(typesArray);

}


