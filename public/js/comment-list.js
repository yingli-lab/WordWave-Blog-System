document.addEventListener("DOMContentLoaded", function () {

    const replyButtons = document.querySelectorAll(".reply-btn");
    const cancelButtons = document.querySelectorAll(".cancel-btn");
    const commentEditor = document.querySelectorAll(".comment-editor");
    const deleteButtons = document.querySelectorAll(".delete-comment-btn");

    // Click reply button show up the reply editor box
    replyButtons.forEach(button => {
        button.addEventListener("click", function () {
            const commentBox = this.closest(".comment-box");
            const replyBoxContainer = commentBox.querySelector(".reply-box-container");

            const articleId = this.dataset.articleId;
            const parentId = this.dataset.replyTo;

            console.log(`Article ID: ${articleId}, Parent ID: ${parentId}`);

            replyBoxContainer.dataset.articleId = articleId;
            replyBoxContainer.dataset.parentId = parentId;

            // Show reply box
            replyBoxContainer.style.display = "block";
        });
    });


    // Click cancel hide the reply editor box
    cancelButtons.forEach(button => {
        button.addEventListener("click", function () {
            const replyBoxContainer = this.closest(".reply-box-container");
            replyBoxContainer.style.display = "none"; // Hide reply box
        });
    });


    // Process reply comment
    commentEditor.forEach(form => {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            const replyBoxContainer = this.closest(".reply-box-container");
            const commentContent = this.querySelector("textarea").value.trim();

            const parentId = replyBoxContainer.dataset.parentId;
            const articleId = replyBoxContainer.dataset.articleId;

            if (!commentContent) {
                alert("Reply content cannot be empty!");
                return;
            }

            try {
                const response = await fetch(`/articles/${articleId}/comments/new`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        content: commentContent,
                        parentId: parentId
                    }),
                });

                const result = await response.json();

                if (response.ok) {
                    alert("Reply posted successfully!");
                    location.reload(); // Refresh page to display new comments
                } else {
                    alert("Failed to post reply: " + result.err);
                }
            } catch (error) {
                console.error(error);
            }
        });


    });

    // Process delete comment
    deleteButtons.forEach(button => {
        button.addEventListener("click", async function () {
            const commentId = this.dataset.commentId;
            const articleId = this.dataset.articleId;

            if (!confirm("Are you sure you want to delete this comment?")) return;

            try {
                const response = await fetch(`/articles/${articleId}/comments/${commentId}`, {
                    method: "DELETE",
                    headers: {"Content-Type": "application/json"}
                });

                const result = await response.json();

                if (response.ok) {
                    alert("Comment deleted successfully!");
                    location.reload();
                } else {
                    alert("Failed to delete comment: " + result.err);
                }
            } catch (error) {
                console.error("Error deleting comment:", error);
            }
        });

    });


});





