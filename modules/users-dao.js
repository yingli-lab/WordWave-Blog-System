const database = require("./database.js");
const bcrypt = require("bcrypt");

/*
* This is User Dao, only works with users and avatars database.
* For create user, retrieve user, edit user, delete user.
* */

// Create user
async function createUser(user) {
    const db = await database.getConnection();

    try {
        //  hashed and salted the password for security.
        const hashedPassword = await bcrypt.hash(user.password, 10);

        const result = await db.query(
            "INSERT INTO web_final_project_users (username, first_name, last_name, password, birth_date, description, avatar_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [user.username, user.firstName, user.lastName, hashedPassword, user.birthday || null, user.description, user.avatar]
        );

        user.id = result.insertId;
        return user;
    } catch (err) {
        console.log("Error creating user:", err);
    } finally {
        await db.release();
    }

};

// Retrieve user by id
async function retrieveUserById(userId) {
    const db = await database.getConnection();

    try {
        const user = await db.query(
            `SELECT u.*, avt.file_path AS avatarUrl 
                    FROM web_final_project_users AS u
                    LEFT JOIN web_final_project_avatars AS avt ON u.avatar_id = avt.id
                    WHERE u.id = ?`, [userId]
        );

        return user[0];
    } catch (err) {
        console.error(err);
    } finally {
        await db.release();
    }

};

// Retrieve user by credential
async function retrieveUserWithCredentials(username, password) {
    const db = await database.getConnection();

    try {
        const user = await db.query(
            `SELECT u.*, avt.file_path AS avatarUrl 
                    FROM web_final_project_users AS u
                    LEFT JOIN web_final_project_avatars AS avt ON u.avatar_id = avt.id
                    WHERE u.username = ?`,
            [username]
        );

        if (!user || user.length === 0) {
            console.log("No user found.");
            return null;
        }

        // compare password with bcrypt
        const isPasswordValid = await bcrypt.compare(password, user[0].password);

        if (isPasswordValid) {
            return user[0];
        } else {
            console.log("password wrong");
            return null;
        }

    } catch (err) {
        console.error(err);
    } finally {
        await db.release();
    }

};

// Retrieve user by username
async function retrieveUserByUsername(username) {
    const db = await database.getConnection();

    try {
        const user = await db.query(
            "SELECT * FROM web_final_project_users WHERE username = ?", [username]
        );

        return user[0];
    } catch (err) {
        console.error(err);
    } finally {
        await db.release();
    }

}

// Update the given user profile
async function updateUser(user) {
    const db = await database.getConnection();

    try {
        // Get current user first
        const currentUser = await retrieveUserById(user.id);
        if (!currentUser) {
            console.log("No user found.");
            return null;
        }

        // Use old password by default
        let hashedPassword = currentUser.password;

        // Check if the user provide a new password
        // and the new password is different from the old password.
        if (user.password && !(await bcrypt.compare(user.password, currentUser.password))) {
            hashedPassword = await bcrypt.hash(user.password, 10);
        }

        const result = await db.query(
            "UPDATE web_final_project_users SET username = ?,  password = ?, first_name = ?, last_name = ?, birth_date = ?, description = ?, avatar_id = ? WHERE id = ?",
            [user.username, hashedPassword, user.firstName, user.lastName, user.birthday, user.description, user.avatar, currentUser.id]
        );

        return result.affectedRows;

    } catch (err) {
        console.error(err);
    } finally {
        await db.release();
    }

};

// Delete the given user
async function deleteUser(userId) {
    const db = await database.getConnection();

    try {
        const result = await db.query("DELETE FROM web_final_project_users WHERE id = ?", [userId]);
        return result.affectedRows;
    } catch (err) {
    console.error(err);
    } finally {
        await db.release();
    }
}




// Avatar process here
// Retrieve all avatars
async function retrieveAllAvatars() {
    const db = await database.getConnection();

    try {
        const avatars = await db.query(
            "SELECT * FROM web_final_project_avatars"
        );

        return avatars;
    } catch (err) {
        console.error(err);
    } finally {
        await db.release();
    }

};

// Get avatar by id.
async function getAvatarByID(avatarId) {
    const db = await database.getConnection();

    try {
        const avatar = await db.query(
            "SELECT * FROM web_final_project_avatars WHERE id = ?", [avatarId]
        );
        return avatar[0];
    } catch (err) {
        console.error(err);
    } finally {
        await db.release();
    }

};




// Export modules
module.exports = {
    createUser,
    retrieveUserById,
    retrieveUserWithCredentials,
    retrieveUserByUsername,
    updateUser,
    deleteUser,
    retrieveAllAvatars,
    getAvatarByID
}