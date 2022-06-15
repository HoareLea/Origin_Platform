"use strict";

var _require = require('@graphql-tools/merge'),
    mergeTypeDefs = _require.mergeTypeDefs;

var _require2 = require('@graphql-tools/load-files'),
    loadFilesSync = _require2.loadFilesSync;

var path = require("path");
/**
 * Load graphql schemas form schema/Origin_Schema directory recursively
 */


function getTypeDefs() {
  var schemaRoot = process.env.SCHEMA_ROOT || "";
  var allSchemaDirs = schemaRoot.split(";").map(function (s) {
    var schemaDir = path.join(__dirname, '../../schema/' + s);
    console.log("Loading GraphQL types from: " + schemaDir);
    return schemaDir;
  });
  var typesArray = loadFilesSync(allSchemaDirs, {
    recursive: true,
    extensions: ['graphql']
  });
  return mergeTypeDefs(typesArray);
}

module.exports = getTypeDefs;