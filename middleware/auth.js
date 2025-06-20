
// This function will verify that the user is an authenticated user.
function verifyAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/user/login");
    }
}

module.exports = { verifyAuthenticated };