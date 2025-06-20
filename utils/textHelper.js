// utils/textHelper.js

// Cleaning HTML and Rich Text
function cleanHtml(html) {
    let text = html.replace(/<[^>]*>/g, '');  // Remove HTML tags

    // Handle common rich text symbols
    text = text
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    return text;
}

// Create article excerpts
function createExcerpt(content) {
    // Clean up the content first
    let cleanContent = cleanHtml(content);

    // If the content length greater than > 150, it will be truncated and added...
    if (cleanContent.length > 150) {
        return cleanContent.substring(0, 150) + '...';
    }

    return cleanContent;
}

// Organize the tree relationship of comments
// Note:
// This is not my original idea.
// I made it by take the professor's suggestions, and searched other blog system.
function buildCommentTree(comments, userId, articleUserId) {
    let commentMap = new Map(); // Use map to process comments
    let rootComments = []; // Set rootComment array first

    comments.forEach(comment => {
        comment.replies = []; // Give each comment a replies array for store the children comment
        // Only the author of the article or comment can delete
        comment.canDelete = userId && (comment.user_id === userId || articleUserId === userId);
        commentMap.set(comment.id, comment); // Put the comment into the map
    })

    comments.forEach(comment => {
        if (comment.parentId === null) {
            rootComments.push(comment); // If comment hava no parentID, it is a rootComment
        } else { // If they hava parent
            let parentComment = commentMap.get(comment.parentId); // Get the parent
            if (parentComment) {
                parentComment.replies.push(comment); // Set a children to the parent
            }
        }
    })

    return rootComments;
}



module.exports = {
    cleanHtml,
    createExcerpt,
    buildCommentTree
};