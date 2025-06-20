document.addEventListener("DOMContentLoaded", function () {
    const commentForm = document.querySelector('.comment-editor');
    const parentId = commentForm.dataset.parentId;
    const articleId = commentForm.dataset.articleId;

    commentForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Preventing automatic form submission

        const commentContent = commentForm.querySelector("textarea").value;

        if (!commentContent.trim()) {
            alert("comment can't be empty");
            return;
        }

        try {
            const response = await fetch(`/articles/${articleId}/comments/new`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: commentContent,
                    parentId: parentId,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                alert("Comment posted successfully");
                location.reload(); // // Refresh page to display new comments
            } else {
                alert("comment failed: " + result.err);
            }

        } catch (error) {
            console.error("comment failed", error);
        }
    });
});
