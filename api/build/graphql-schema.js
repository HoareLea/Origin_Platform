"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTypeDefs = getTypeDefs;

var _merge = require("@graphql-tools/merge");

var _loadFiles = require("@graphql-tools/load-files");

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Load graphql schemas form schema/Origin_Schema directory recursively
 */
function getTypeDefs() {
  var schemaRoot = process.env.SCHEMA_ROOT || "";
  var allSchemaDirs = schemaRoot.split(";").map(function (s) {
    var schemaDir = _path["default"].join(__dirname, '../../schema/' + s);

    console.log("Loading GraphQL types from: " + schemaDir);
    return schemaDir;
  });
  var typesArray = (0, _loadFiles.loadFilesSync)(allSchemaDirs, {
    recursive: true,
    extensions: ['graphql']
  });
  return (0, _merge.mergeTypeDefs)(typesArray);
}