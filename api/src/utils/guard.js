const jwt_decode = require('jwt-decode');
const config = require('../authConfig');

const routeGuard = async (req, res, next) => {

    // Get the user token from the headers.
    const token = req.headers.authorization;

    if (!token) return res.status(401).json({ error: "Authorization token not found. You must be logged in." })

    const decoded = jwt_decode(token)  

    if (!decoded.groups) {

        return res.status(403).json({ error: 'No group claim found!' });

    } else {
        const groups = decoded.groups;

        if (req.path.includes(config.accessMatrix.graphql.path)) {
            if (config.accessMatrix.graphql.methods.includes(req.method)) {

                let intersection = config.accessMatrix.graphql.groups
                    .filter(group => groups.includes(group.uuid));

                if (intersection.length < 1) {
                    return res.status(403).json({ error: 'User does not have the group' });
                }
                else {
                    //add user & roles
                    req.user = decoded;
                    req.user.roles = intersection;
                    //prioritise autho clearance
                    let auth = intersection.map(x=>x.role)
                    if(auth.includes("Admin"))req.user.auth="Admin"
                    else req.user.auth="Member"
                }
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