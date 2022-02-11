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
                    "role": "Admin",
                    "uuid": "1d473abb-02b5-4564-8825-9d9cf85194b2"
                },
                {
                    "role": "Member",
                    "uuid": "bb609a0f-06b1-44ca-b97b-95b02253d498"
                }  
            ]
        }
    }
};