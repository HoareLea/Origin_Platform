const { mergeTypeDefs } = require('@graphql-tools/merge');
const { loadFilesSync } = require('@graphql-tools/load-files');
const path = require("path");

/**
 * Load graphql schemas form schema/Origin_Schema directory recursively
 */
function getTypeDefs() {
    const schemaRoot = process.env.SCHEMA_ROOT || "";

    const allSchemaDirs = schemaRoot.split(";").map((s) => {
        const schemaDir = path.join(__dirname, '../../schema/' + s);
        console.log("Loading GraphQL types from: " + schemaDir);
        return schemaDir;
    });

    const typesArray = loadFilesSync(allSchemaDirs, { recursive: true, extensions: ['graphql'] })

    return mergeTypeDefs(typesArray);

}

module.exports = getTypeDefs;

