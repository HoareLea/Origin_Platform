'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getTypeDefs = getTypeDefs;

var _merge = require('@graphql-tools/merge');

var _loadFiles = require('@graphql-tools/load-files');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Load graphql schemas form schema/Origin_Schema directory recursively
 */
function getTypeDefs() {
    var schemaDir = _path2.default.join(__dirname, '../../schema/' + process.env.SCHEMA_ROOT);
    console.log("Loading GraphQL types from: " + schemaDir);
    var allSchemaDirs = schemaDir.split(";");

    var typesArray = (0, _loadFiles.loadFilesSync)(allSchemaDirs, { recursive: true, extensions: ['graphql'] });

    return (0, _merge.mergeTypeDefs)(typesArray);
}