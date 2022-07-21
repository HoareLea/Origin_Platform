require('dotenv').config();

module.exports = {    
    "accessMatrix": {
        "graphql": {
            "path": "/",
            "methods": [
                "GET",
                "POST",
                "PATCH",
                "PUT",
                "DELETE"
            ],
            "groups": [
                {
                    "role": "super-admin",
                    "uuid": process.env.SUPER_ADMIN_GROUP_ID
                }               
            ]
        }
    }
};