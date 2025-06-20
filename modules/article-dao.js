const database = require("./database.js");
const fs = require("fs").promises;
const path = require("path");
const { buildCommentTree } = require("../utils/textHelper.js");

/*
Article dao, only work with article database, does not process business logic.
For retrieve all articles, create new article, publish article, select an article then show content
*/

// Get all articles from database, for show up on the home page.
async function retrieveAllArticles() {
    const db = await database.getConnection();

    try{
        const articles = await db.query(
            `SELECT 
                    a.id, a.title, a.content, a.image_url, a.created_time, u.username AS author, avt.file_path AS authorAvatar,
                    (SELECT COUNT(*) FROM web_final_project_article_likes WHERE article_id = a.id) AS likes,
                    (SELECT COUNT(*) FROM web_final_project_comments WHERE article_id = a.id) AS comments
             FROM web_final_project_articles AS a
                    LEFT JOIN web_final_project_users AS u ON a.user_id = u.id
                    LEFT JOIN web_final_project_avatars AS avt ON u.avatar_id = avt.id
             ORDER BY a.created_time DESC`
        );

        if (!articles.length) {
            console.log("No articles found.");
        }

        // Convert likes and comments to normal number
        articles.forEach(article => {
            article.likes = Number(article.likes);
            article.comments = Number(article.comments);
        });

        return articles;

    } catch (err) {
        console.error(err);
    } finally {
        await db.release();
    }


}

// Get an article by article id from database,
// when user click an article, show the content.
async function retrieveArticleById(articleId) {
    const db = await database.getConnection();
    try {
        const article = await db.query(
            `SELECT 
                    a.id, a.title, a.content, a.image_url, a.created_time, a.user_id, u.username AS author, avt.file_path AS authorAvatar
             FROM web_final_project_articles AS a
                    LEFT JOIN web_final_project_users AS u ON a.user_id = u.id
                    LEFT JOIN web_final_project_avatars AS avt ON u.avatar_id = avt.id
             WHERE a.id = ?`,[articleId]
        );
        return article[0];
    } catch (err) {
        console.error(err);
    } finally {
        await db.release();
    }

}

// Get all article by a userId,
// for show up on the user published list
async function retrieveArticlesByUser(userId) {
    const db = await database.getConnection();

    try {
        const articles = await db.query(
            "SELECT * FROM web_final_project_articles WHERE user_id = ?", [userId]
        );
        return articles;
    } catch (err) {
        console.error(err);
    } finally {
        await db.release();
    }

}

// Creat a new article and save it to database
// For user choose to create an article and click publish it,
async function createArticle(article) {
    const db = await database.getConnection();

    try {
        const result = await db.query(
            "INSERT INTO web_final_project_articles(user_id, title, content, image_url, created_time) VALUES (?, ?, ?, ?, NOW())",
            [article.userId, article.title, article.content, article.imageUrl]
        );

        article.id = result.insertId;
        return article;
    } catch (err) {
        console.log("Error creating article:", err);
        throw err;
    } finally {
        await db.release();
    }
}


// Update article
// For user open their article list and choose to edit an article
async function updateArticle(article) {
    const db = await database.getConnection();

    try {
        const result = await db.query(
            `UPDATE web_final_project_articles 
             SET title = ?, content = ?, image_url = ? 
             WHERE id = ? AND user_id = ?`,
            [article.title, article.content, article.imageUrl, article.id, article.userId]
        );

        return result.affectedRows;
    } catch (err) {
        console.log("Error updating article:", err);
        throw err;
    } finally {
        await db.release();
    }
}


// Delete article with a given id from database,
// For user choose to delete the article from their published list.
async function deleteArticle(articleId) {
    const db = await database.getConnection();

    try {
        // Get image URL first
        const image = await db.query(
          "SELECT image_url FROM web_final_project_articles WHERE id = ?",[articleId]
        );

        if (image.length > 0 && image[0].image_url != null) {
            const imagePath = path.join(__dirname, "..", "public", image[0].image_url);

            try {
                // Delete the image file
                await fs.unlink(imagePath);
            } catch (error) {
                console.error("Failed to delete image file:", error);
            }
        }

        // Delete article from database
        const result = await db.query(
            "DELETE FROM web_final_project_articles WHERE id = ?",[articleId]
        );

        return result.affectedRows;

    } catch (err) {
        console.log("Error deleting article:", err);
        throw err;
    }finally {
         await db.release();
    }
}





// Comment dao are here
// Retrieve all comments belongs to an article.
async function retrieveCommentsByArticleId(articleId, userId, articleUserId) {
    const db = await database.getConnection();

    try {
        const comments = await db.query(
            `SELECT 
                   c.id, c.content, c.article_id, c.user_id, c.created_time, c.parent_comment_id AS parentId,
                    u.username, avt.file_path AS userAvatar
                FROM web_final_project_comments AS c 
                LEFT JOIN web_final_project_users AS u ON c.user_id = u.id
                LEFT JOIN web_final_project_avatars AS avt ON u.avatar_id = avt.id
                WHERE c.article_id = ?
                ORDER BY c.created_time ASC`,
            [articleId]
        );

        return buildCommentTree(comments, userId, articleUserId); // Return the processed three-layer comment tree
    } catch (err) {
        console.error(err);
    } finally {
        await db.release();
    }

}

// Retrieve a comment by id.
async function retrieveCommentById(id) {
    const db = await database.getConnection();

    try {
        const comment = await db.query(
            "SELECT * FROM web_final_project_comments WHERE id = ?", [id]
        );

        return comment[0];
    } catch (err) {
        console.error(err);
    } finally {
        await db.release();
    }

}

// Create comment
async function createComment(comment) {
    const db = await database.getConnection();

    try{
        const result = await db.query(
            "INSERT INTO web_final_project_comments (content, article_id, user_id, parent_comment_id, created_time) VALUES (?, ?, ?, ?, NOW()) ",
            [comment.content, comment.articleId, comment.userId, comment.parentId]
        );
        return result.affectedRows;
    } catch (err) {
        console.log("Error creating comment:", err);
        throw err;
    } finally {
        await db.release();
    }

}

// Delete comment by id
async function deleteComment(id) {
    const db = await database.getConnection();

    try {
        const result = await db.query(
            "DELETE FROM web_final_project_comments WHERE id = ?", [id]
        );
        return result.affectedRows;
    } catch (err) {
        console.log("Error deleting comment:", err);
    } finally {
        await db.release();
    }

}





// Likes dao from here
// Retrieve all likes by an article id
async function retrieveLikesByArticleId(articleId) {
    const db = await database.getConnection();

    try {
        const likes = await db.query(
            "SELECT * FROM web_final_project_article_likes WHERE article_id = ?", [articleId]
        );
        return likes;
    } catch (err) {
        console.log(err);
    } finally {
        await db.release();
    }

}

// Retrieve a like by id
async function retrieveLikeById(id) {
    const db = await database.getConnection();

    try {
        const like = await db.query(
            "SELECT * FROM web_final_project_article_likes WHERE id = ?", [id]
        );
        return like[0];
    } catch (err) {
        console.log(err);
    } finally {
        await db.release();
    }

}

// Retrieve a like by userId and articleId
async function retrieveLikeByUserAndArticle(articleId, userId) {
    const db = await database.getConnection();

    try {
        const like = await db.query(
            "SELECT * FROM web_final_project_article_likes WHERE article_id = ? AND user_id = ?", [articleId, userId]
        );
        return like[0];
    } catch (err) {
        console.log(err);
    } finally {
        await db.release();
    }

}

// Create like
async function createLike(like) {
    const db = await database.getConnection();

    try {
        const result = await db.query(
            "INSERT INTO web_final_project_article_likes (article_id, user_id) VALUES (?, ?)", [like.articleId, like.userId]
        );

        return result.affectedRows;

    } catch (err) {
        console.log("Error creating like:", err);
        throw err;
    } finally {
        await db.release();
    }
}

// Delete likes by id
async function deleteLike(id) {
    const db = await database.getConnection();

    try {
        const result = await db.query(
            "DELETE FROM web_final_project_article_likes WHERE id = ?", [id]
        );
        return result.affectedRows;
    } catch (err) {
        console.log(err);
    } finally {
        await db.release();
    }

}





// Export functions.
module.exports = {
    retrieveAllArticles,
    retrieveArticleById,
    retrieveArticlesByUser,
    createArticle,
    updateArticle,
    deleteArticle,
    retrieveCommentsByArticleId,
    retrieveCommentById,
    createComment,
    deleteComment,
    retrieveLikesByArticleId,
    retrieveLikeById,
    retrieveLikeByUserAndArticle,
    createLike,
    deleteLike
};
