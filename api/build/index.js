"use strict";

var _graphqlSchema = require("./graphql-schema");

var graphqlschema = _interopRequireWildcard(_graphqlSchema);

var _apolloServerExpress = require("apollo-server-express");

var _apolloServerCore = require("apollo-server-core");

var _http = require("http");

var _http2 = _interopRequireDefault(_http);

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _dotenv = require("dotenv");

var _dotenv2 = _interopRequireDefault(_dotenv);

require("babel-polyfill");

var _graphql = require("graphql");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
/**
 * Apollo server express based on docs
 * https://www.apollographql.com/docs/apollo-server/integrations/middleware/#apollo-server-express
 */

var jwt_decode = require('jwt-decode');

var morgan = require('morgan');
var passport = require('passport');
var BearerStrategy = require('passport-azure-ad').BearerStrategy;
var cors = require('cors');

var config = require('./authConfig');
var routeGuard = require('./utils/guard');

var neo4j = require("neo4j-driver");

var _require = require("@neo4j/graphql"),
    Neo4jGraphQL = _require.Neo4jGraphQL;

// List of all custom resolvers


var resolvers = require("./utils/resolvers");

// Set environment variables from ../.env
_dotenv2.default.config();

// Specify port and path for GraphQL endpoint
//this is the internal listen port for the server
//when used in a docker container, or, the external port
//when not used in a container
var port = process.env.GRAPHQL_LISTEN_PORT || 4001;
var path = "/graphql";

// Token validation options for azureAD
var options = {
  identityMetadata: "https://" + process.env.AZURE_METADATA_AUTHORITY + "/" + process.env.AZURE_CREDENTIALS_TENANTID + "/" + process.env.AZURE_METADATA_VERSION + "/" + process.env.AZURE_METADATA_DISCOVERY,
  issuer: "https://" + process.env.AZURE_METADATA_AUTHORITY + "/" + process.env.AZURE_CREDENTIALS_TENANTID + "/" + process.env.AZURE_METADATA_VERSION,
  clientID: process.env.AZURE_CREDENTIALS_CLIENTID,
  audience: process.env.AZURE_CREDENTIALS_AUDIENCE, // audience is this application
  validateIssuer: process.env.AZURE_SETTINGS_VALIDATE_ISSUER,
  passReqToCallback: process.env.AZURE_SETTINGS_PASS_REQUEST_TO_CALLBACK,
  loggingLevel: process.env.AZURE_SETTINGS_LOGGING_LEVEL
};

var bearerStrategy = new BearerStrategy(options, function (token, done) {
  // Send user info using the second argument
  done(null, {}, token);
});

// Create express app
var app = (0, _express2.default)();
var httpServer = _http2.default.createServer(app);

app.use(morgan('dev'));
app.use(_express2.default.json());
app.use(cors());

// Add passport azure AD middleware 
app.use(passport.initialize());
passport.use(bearerStrategy);

// Validate token, check for role and serve
app.use(path, function (req, res, next) {
  var token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Authorization token not found. You must be logged in." });
  var decoded = jwt_decode(token);
  if (process.env.ALLOWED_APPS.split(',').includes(decoded.oid) && decoded.idtyp != "app") {
    passport.authenticate('oauth-bearer', { session: false });
  }
  next();
}, routeGuard);

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
    var jwt = req.user;

    // optionally block the user according to roles/permissions
    var roles = jwt.roles;

    // Add the user to the context
    return { jwt: jwt, driver: driver };
  },
  typeDefs: typeDefs,
  schema: schema,
  plugins: [(0, _apolloServerCore.ApolloServerPluginDrainHttpServer)({ httpServer: httpServer })]
});

var startServer = function () {
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
            server.applyMiddleware({ app: app });

            _context.next = 5;
            return new Promise(function (resolve) {
              return httpServer.listen({ port: port, path: path }, resolve);
            });

          case 5:
            console.log("\uD83D\uDE80 Server listening at http://localhost:" + port + path);

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function startServer() {
    return _ref2.apply(this, arguments);
  };
}();

startServer();

app.use('/schema', function (req, res) {
  var intro = (0, _graphql.getIntrospectionQuery)(schema);
  res.send(JSON.stringify(schema));
});

module.exports = app;