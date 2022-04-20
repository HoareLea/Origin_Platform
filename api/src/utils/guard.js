const jwt_decode = require('jwt-decode');
const config = require('../authConfig');
const {setSentryUser} = require('./sentry');

const routeGuard = async (req, res, next) => {

    // Get the user token from the headers.
    const token = req.headers.authorization;

    if (!token) return res.status(401).json({ error: "Authorization token not found. You must be logged in." })

    const decoded = jwt_decode(token)
    // add user to sentry
    setSentryUser(decoded.preferred_username, decoded.oid);

    if (!decoded.groups) {
        return res.status(403).json({ error: 'No group claim found!' });
    } else {
        const groups = decoded.groups;

        // Get access control - compare with config
        if (req.path.includes(config.accessMatrix.graphql.path)) {
            if (config.accessMatrix.graphql.methods.includes(req.method)) {
                req.user = decoded;

                // Group ids to match with allowed groups
                let intersection = config.accessMatrix.graphql.groups
                    .filter(group => groups.includes(group.uuid));

                const roles = intersection.map(x => x.role);

                req.user.roles = roles;
            } else {
                return res.status(403).json({ error: 'Method not allowed' });
            }
        } else {
            return res.status(403).json({ error: 'Unrecognized path' });
        }
    }

    next();
}

module.exports = routeGuard;