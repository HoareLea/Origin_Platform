const lastUpdatedUserOidCallback = async (root, auth, context) => {    
    console.log(root);
    console.log(context);
    return context.auth.jwt.oid;
}

const callbacks = {
    lastUpdatedUserOid: lastUpdatedUserOidCallback
};

module.exports = callbacks;
