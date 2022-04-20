"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

var graphqlschema = _interopRequireWildcard(require("./graphql-schema"));

var _apolloServerExpress = require("apollo-server-express");

var _apolloServerCore = require("apollo-server-core");

var _http = _interopRequireDefault(require("http"));

var _express = _interopRequireDefault(require("express"));

var _dotenv = _interopRequireDefault(require("dotenv"));

require("babel-polyfill");

var _graphql = require("graphql");

var _sentry = require("./utils/sentry");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// Initialize sentry at top level
(0, _sentry.initializeSentry)();

var morgan = require('morgan');

var passport = require('passport');

var BearerStrategy = require('passport-azure-ad').BearerStrategy;

var cors = require('cors');

var routeGuard = require('./utils/guard');

var neo4j = require("neo4j-driver");

var _require = require("@neo4j/graphql"),
    Neo4jGraphQL = _require.Neo4jGraphQL; // List of all custom resolvers


var resolvers = require("./utils/resolvers"); // Set environment variables from ../.env


_dotenv["default"].config(); // Specify port and path for GraphQL endpoint
//this is the internal listen port for the server
//when used in a docker container, or, the external port
//when not used in a container


var port = process.env.GRAPHQL_LISTEN_PORT || 4001;
var path = "/graphql"; // Token validation options for azureAD

var options = {
  identityMetadata: "https://".concat(process.env.AZURE_METADATA_AUTHORITY, "/").concat(process.env.AZURE_CREDENTIALS_TENANTID, "/").concat(process.env.AZURE_METADATA_VERSION, "/").concat(process.env.AZURE_METADATA_DISCOVERY),
  issuer: "https://".concat(process.env.AZURE_METADATA_AUTHORITY, "/").concat(process.env.AZURE_CREDENTIALS_TENANTID, "/").concat(process.env.AZURE_METADATA_VERSION),
  clientID: process.env.AZURE_CREDENTIALS_CLIENTID,
  audience: process.env.AZURE_CREDENTIALS_AUDIENCE,
  // audience is this application
  validateIssuer: process.env.AZURE_SETTINGS_VALIDATE_ISSUER,
  passReqToCallback: process.env.AZURE_SETTINGS_PASS_REQUEST_TO_CALLBACK,
  loggingLevel: process.env.AZURE_SETTINGS_LOGGING_LEVEL
};
var bearerStrategy = new BearerStrategy(options, function (token, done) {
  // Send user info using the second argument
  done(null, {}, token);
}); // Create express app

var app = (0, _express["default"])();

var httpServer = _http["default"].createServer(app);

app.use(morgan('dev'));
app.use(_express["default"].json());
app.use(cors()); // Add passport azure AD middleware 

app.use(passport.initialize());
passport.use(bearerStrategy); // Validate token, check for role and serve

app.use(path, passport.authenticate('oauth-bearer', {
  session: false
}), routeGuard);
/*
  * Create an executable GraphQL schema object from GraphQL type definitions
  * including autogenerated queries and mutations.  
  */

var typeDefs = graphqlschema.getTypeDefs();
/*
* Create a Neo4j driver instance to connect to the database
* using credentials specified as environment variables
* with fallback to defaults
*/

var driver = neo4j.driver(process.env.NEO4J_URI || "bolt://localhost:7687", neo4j.auth.basic(process.env.NEO4J_USER || "neo4j", process.env.NEO4J_PASSWORD || "neo4j"));
var neo4jGraphQL = new Neo4jGraphQL({
  typeDefs: typeDefs,
  resolvers: resolvers,
  driver: driver
});
var schema = neo4jGraphQL.schema;
/*
 * Create a new ApolloServer instance, serving the GraphQL schema
 * injecting the Neo4j driver instance into the context object
 * so it is available in the  generated resolvers
 * to connect to the database.
 */

var server = new _apolloServerExpress.ApolloServer({
  context: function context(_ref) {
    var req = _ref.req;
    // Try to retrieve a user from the request token
    var jwt = req ? req.user : {}; // Add the user to the context

    return {
      jwt: jwt,
      driver: driver
    };
  },
  typeDefs: typeDefs,
  schema: schema,
  plugins: [(0, _apolloServerCore.ApolloServerPluginDrainHttpServer)({
    httpServer: httpServer
  })]
});

var startServer = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return server.start();

          case 2:
            /*
            * Optionally, apply Express middleware for authentication, etc
            * This also also allows us to specify a path for the GraphQL endpoint
            */
            server.applyMiddleware({
              app: app
            });
            _context.next = 5;
            return new Promise(function (resolve) {
              return httpServer.listen({
                port: port,
                path: path
              }, resolve);
            });

          case 5:
            console.log("\uD83D\uDE80 Server listening at http://localhost:".concat(port).concat(path));

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function startServer() {
    return _ref2.apply(this, arguments);
  };
}();

startServer();
app.use('/schema', /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
    var introspectionQuery, data;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            introspectionQuery = (0, _graphql.getIntrospectionQuery)({});
            _context2.next = 3;
            return server.executeOperation({
              query: introspectionQuery
            });

          case 3:
            data = _context2.sent;
            res.send(data);

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x, _x2) {
    return _ref3.apply(this, arguments);
  };
}());
app.use('/accesscontrol', passport.authenticate('oauth-bearer', {
  session: false
}), routeGuard, function (req, res) {
  res.send(req.user.roles);
});
module.exports = app;