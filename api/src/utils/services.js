
/**
 * Callback function to run when project is created or updated
 * Updates Last_Updated_User_Oid with user oid from token
 */
const lastUpdatedUserOidCallback = async (root, parent, context) => {    
    console.log(root);
    console.log(context);
    return context.auth.jwt.oid;
}

const callbacks = {
    lastUpdatedUserOid: lastUpdatedUserOidCallback
};

module.exports = callbacks;
