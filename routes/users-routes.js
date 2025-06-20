// Setup
const express = require('express');
const router = express.Router();

// UsersDao handle all CRUD works with users account data
const usersDao = require("../modules/users-dao.js");

// Setup middleware
const middleware = require('../middleware/auth.js');






// Router start from here
// Handle get request from "/login". when user navigate to the login page, check if they already log in.
// if they do, redirect to the home page, if they not, open the login page.
router.get("/login", function (req, res) {

    if (req.session.user) {
        res.redirect("/");
    } else {
        res.render("user/login", {layout: false}); // Independent page, no templates are used.
    }

})

// Register account
// Handle get request from "/register"
router.get("/register", async function (req, res) {
    try {
        const avatars = await usersDao.retrieveAllAvatars();
        res.render("user/profile", {
            avatars
        });
    } catch (err) {
        console.error("Error loading avatars:", err);
        res.status(500).json({err: err.message});
    }

})

// Handle request from "register/check-username" to check if username is already existed in the database
router.get("/register/check-username", async function (req, res) {
    const username = req.query.username;

    try {
        // Check if someone already use the username in the database.
        const existUser = await usersDao.retrieveUserByUsername(username);

        res.json({
            // if existUser exist return false, if not return true.
            available: !existUser
        });

    } catch (err) {
        console.log("Error checking username",err);
        res.status(500).json({err: err.message});
    }
})

// Handle get request from "/my-profile"
router.get("/my-profile", middleware.verifyAuthenticated, async function (req, res) {

    const userData = await usersDao.retrieveUserById(req.session.user.id);
    const avatars = await usersDao.retrieveAllAvatars();

    if (!userData) {
        return res.status(404).json({err: "cannot find user"});
    }

    const user = {
        id: userData.id,
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        birth_date: new Date(userData.birth_date).toISOString().split("T")[0] || null,
        description: userData.description,
        avatar_id: userData.avatar_id,
        avatarUrl: userData.avatarUrl
    }

    res.render("user/profile", {
        user: user,
        avatars: avatars
    });
})


// Handle get request from "logout", delete the user in the session, redirect to the login page
router.get("/logout", function (req, res) {
    if (req.session.user) {
        delete req.session.user;
    }
    res.redirect("./login?message=logged out");
})




// Handle post request from "/login".
// Check if the name and password valid, if they do, redirect to "/", otherwise redirect to the login.
router.post("/login", async function (req, res) {
    try {
        // Get the username and password first.
        const { username, password } = req.body;
        if (!username || !password) {
            return res.render("user/login",{
                message: "Username and password cannot be empty",
                layout: false // Independent page, no templates are used.
            });
        }

        // Check the username and password.
        const user = await usersDao.retrieveUserWithCredentials(username, password);

        // validation failed
        if (!user) {
            return res.render("user/login",{
                message: "Invalid username or password",
                layout: false
            });
        }

        // validation success
        delete user.password;
        req.session.user = user;
        res.redirect("/");

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({err: err.message});
    }
});










// Handle post request from "/register/set-avatar/:id",
// For setting the avatar when user edit or register profile.
router.post("/register/set-avatar/:id", async function (req, res) {
    const avatarId = req.params.id;

    try {
        const avatar = await usersDao.getAvatarByID(avatarId);

        if (!avatar) {
            return res.status(400).json({err: "Avatar not found"});
        }

        // Returns the success status and avatar information
        return res.json({
            success: true,
            avatar: avatar
        });

    } catch (err) {
        console.log("Error selecting avatar", err);
        res.status(500).json({err: err.message});
    }
})

// Handle post request from "/create"
router.post("/register", async function (req, res) {
    const { username, first_name, last_name, password, birthday, description, avatar_id } = req.body;

    const user = {
        username,
        firstName: first_name,
        lastName: last_name,
        password,
        birthday: birthday || null,
        description,
        avatar: avatar_id,
    };

    try {
        await usersDao.createUser(user);
        res.redirect("./login");
    } catch (err) {
        console.log(err);
        res.status(500).json({err: err.message});
    }

})

// Handle put request from "/update"
router.post("/update", middleware.verifyAuthenticated, async function (req, res) {
    const { username, password, first_name, last_name, birthday, description, avatar_id } = req.body;

    const user = {
        id: req.session.user.id,
        username,
        password: password || null,
        firstName: first_name,
        lastName: last_name,
        birthday: birthday || null,
        description: description || null,
        avatar: avatar_id
    }

    try {
        await usersDao.updateUser(user);
        res.redirect("/");
    } catch (err) {
        console.log(err);
        res.status(500).json({err: err.message});
    }
})

// Handle request from "/delete"
router.delete("/delete", middleware.verifyAuthenticated, async function (req, res) {
    const userId = req.session.user.id;

    try {
        const existUser = await usersDao.retrieveUserById(userId);
        if (!existUser) {
            res.status(404).json({err: "User not found"});
        }

        await usersDao.deleteUser(userId);

        // Destroy session and send success message
        req.session.destroy(err => {
            if (err) {
                console.error("Error destroying session:", err);
                return res.status(500).json({ err: "Failed to destroy session" });
            }
            res.json({ success: true, redirect: "/" });
        });


    } catch (err) {
        console.log(err);
        res.status(500).json({err: err.message});
    }
})

// Handle get request from "/profile"
router.get("/:username", async function (req, res) {

    if (req.session.user) {
        res.render("user/profile");
    } else {
        res.redirect("./login");
    }
})





module.exports = router;