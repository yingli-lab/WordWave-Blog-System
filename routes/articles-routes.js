// Set up
const express = require('express');
const router = express.Router();

// Setup DAO
const articleDao = require('../modules/article-dao.js');

// Setup middleware
const middleware = require('../middleware/auth.js');

// Setup utility
const { createExcerpt } = require('../utils/textHelper.js');

// Setup fs
const fs = require('fs');

// Setup multer, for files will temporarily save in the "temp" folder.
const path = require("path");
const multer = require("multer");
const upload = multer({
    dest: path.join(__dirname, "temp")
});

// Setup jimp
const { Jimp, AUTO} = require('jimp');








// Router start from here
// Handle get request "/",
// render the article list, user can read this page without log in.
router.get("/", async function (req, res) {
    try {
        const articles = await articleDao.retrieveAllArticles();

        // Process each article and add excerpt
        let processedArticles = articles.map(function(article) {
            return {
                id: article.id,
                title: article.title,
                content: article.content,
                image_url: article.image_url,
                created_time: article.created_time,
                author: article.author,
                authorAvatar: article.authorAvatar,
                likes: article.likes,
                comments: article.comments,
                excerpt: createExcerpt(article.content) // Generate an excerpt
            };
        });

        res.render("home", {
            articles: processedArticles
        });

    } catch (err) {
        res.status(500).json({err: err.message});
    }
});

// Handle get request from "/my-articles"
// Show articles which belongs to a user
router.get("/my", middleware.verifyAuthenticated, async function (req, res) {
    const userId = req.session.user.id;

    try {
        const articles = await articleDao.retrieveArticlesByUser(userId);

        // Process each article and add excerpt
        let processedArticles = articles.map(function(article) {
            return {
                id: article.id,
                user_id: article.user_id,
                title: article.title,
                content: article.content,
                image_url: article.image_url,
                created_time: article.created_time,
                excerpt: createExcerpt(article.content) // Generate an excerpt
            };
        });

        res.render("article/my-articles", {
            articles: processedArticles,
        });
    } catch (err) {
        res.status(500).json({err: err.message});
    }
});

// Handle get request from "/create"
// Show the editor to user to create new article.
router.get("/create", middleware.verifyAuthenticated, async function (req, res) {

    res.render("article/editor", );
})

// Handle get request "/article/:id",
// show article details, include comment, likes.
router.get("/:id", async function (req, res) {
    const articleId = req.params.id;
    const user = req.session.user; // Get current user
    const userId = user ? user.id : null; // Get userId, if not login return null

    try {
        const article = await articleDao.retrieveArticleById(articleId);

        if (!article || article.length === 0) {
            res.status(404).json({err: "Article not found"});
            return;
        }

        const comments = await articleDao.retrieveCommentsByArticleId(articleId, userId, article.user_id);
        const likes = await articleDao.retrieveLikesByArticleId(articleId);

        res.render("article/detail",{
            article,
            comments,
            likes,
            user
        });

    } catch (err) {
        console.error("Error retrieving article:", err);
        res.status(500).json({err: err.message});
    }
});

// Handle get request from "edit/article"
// It will render the editor with user previous published article data.
router.get("/edit/:id", middleware.verifyAuthenticated, async function (req, res) {
    const articleId = req.params.id;
    const userId = req.session.user.id;

    try {
        const article = await articleDao.retrieveArticleById(articleId);

        if (!article || article.user_id !== userId) {
            return res.status(403).json({ err: "You are not allowed to edit this article" });
        }

        res.render("article/editor", { article: article });
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});


// Handle put request from "article/edit"
// It will send updated article data to the dao.
router.put("/update/:id", middleware.verifyAuthenticated, async function (req, res) {

    const articleId = req.params.id;
    const userId = req.session.user.id;

    const article = {
        id: articleId,
        userId: userId,
        title: req.body.title,
        content: req.body.content,
        imageUrl: req.body.image
    };

    if (!article.title || !article.content) {
        return res.status(400).json({ err: "Title and content cannot be empty" });
    }

    try {
        const updatedRows = await articleDao.updateArticle(article);

        if (!updatedRows || updatedRows.length === 0) {
            res.status(404).json({err: "Failed to update this article"});
        }

        return res.status(200).json({
            message: "Article updated successfully",
            articleId: articleId
        });

    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});






// Handle post request for create comment
router.post("/:id/comments/new", middleware.verifyAuthenticated, async function (req, res) {
    const articleId = req.params.id;
    const userId = req.session.user.id;

    const content = req.body.content;
    const parentId = req.body.parentId;

    if (!userId || !content) {
        res.status(404).json({err: "comment cannot be null"});
        return;
    }

    const comment = {
        content: content,
        articleId: articleId,
        userId: userId,
        parentId: parentId || null,
    }

    try {
        await articleDao.createComment(comment);
        res.status(201).json({message: "Comment successfully created"});
    } catch (err) {
        res.status(500).json({err: err.message});
    }
})

// Handle delete request for delete comment
router.delete("/:id/comments/:commentId", middleware.verifyAuthenticated, async function (req, res) {
    const articleId = req.params.id;
    const commentId = req.params.commentId;
    const userId = req.session.user.id;

    try {
        const article = await articleDao.retrieveArticleById(articleId);
        const comment =  await articleDao.retrieveCommentById(commentId);

        // Check if the comment is existing.
        if (!comment) {
            return res.status(403).json({ err: "Comment not found" });
        }

        // Check if the comment belonging to the given user
        if (article.user_id === userId || comment.user_id === userId) {
            await articleDao.deleteComment(commentId);
            return res.json({message: "Comment successfully deleted"});
        } else {
            res.status(403).json({err: "You cannot delete a comment"});
            return;
        }

    } catch (err) {
        console.error("Error deleting comment:", err);
        res.status(500).json({err: err.message});
    }
})





// Handle the post request for add likes and remove likes to the article
router.post("/:id/likes", middleware.verifyAuthenticated, async function (req, res) {
    const articleId = req.params.id;
    const userId = req.session.user.id;

    try {
        const article = await articleDao.retrieveArticleById(articleId); // Get exist article
        const existLike = await articleDao.retrieveLikeByUserAndArticle(articleId, userId); // Get exist like

        if (!article || article.length === 0) { // Check if article existed
            return res.status(404).json({err: "Article not found"});
        }

        const like = {
            articleId: articleId,
            userId: userId,
        }

        if (existLike) { // If user already liked article, they can't like it.
            await articleDao.deleteLike(existLike.id);
        } else {
            await articleDao.createLike(like);
        }

        const likes = await articleDao.retrieveLikesByArticleId(articleId);
        res.status(200).json({
            likesCount: likes.length
        })


    } catch (err) {
        res.status(500).json({err: err.message});
    }

})




// Handle post request "/create/uploadImage"
// For user creating an article and uploadImage.
router.post("/create/uploadImage", upload.single("imageFile"), async function(req, res) {

    const fileInfo = req.file;

    try {
        // Move file from temp directory to public directory.
        const oldFileName = fileInfo.path;
        const newFileName = `./public/images/articles/${fileInfo.originalname}`
        fs.renameSync(oldFileName, newFileName);

        // Edit file, resize it and save.
        const image = await Jimp.read(newFileName);
        image.resize({w: 800});
        await image.write(`./public/images/articles/${fileInfo.originalname}`);
        res.json({ imageUrl: `/images/articles/${fileInfo.originalname}`}); // return the image url

    } catch (err) {
        res.status(500).json({err: err.message});
    }

});

// Handle post request from "/create".
// For user choose to create an article and click publish button
router.post("/create/new-article", middleware.verifyAuthenticated, async function (req, res) {

    const article = {
        userId: req.session.user.id,
        title:  req.body.title,
        content: req.body.content,
        imageUrl: req.body.image
    }

    if (!article.title) {
        return res.status(400).json({err: "Title cannot be empty"});
    }

    if (!article.content) {
        return res.status(400).json({err: "Content cannot be empty"});
    }

    if (!article.imageUrl) {
        return res.status(400).json({err: "Image is required"});
    }

    try {
        await articleDao.createArticle(article);
        res.status(201).json({ message: "Article created successfully" });
    } catch (err) {
        res.status(500).json({err: err.message});
    }
});

// Handle delete request from "my/delete/:id"
// For user can delete articles which they published before.
router.delete("/my/delete/:id", middleware.verifyAuthenticated, async function (req, res) {
    const articleId = req.params.id;

    try {
        await articleDao.deleteArticle(articleId);
        res.status(200).json({message: "Article deleted successfully"});
    } catch (err) {
        res.status(500).json({err: err.message});
    }
});







// Export modules.
module.exports = router;