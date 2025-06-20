document.addEventListener("DOMContentLoaded", function () {

    const deleteButtons = document.querySelectorAll(".delete-btn");
    const editButtons = document.querySelectorAll(".edit-btn");


    // Add event listener to every delete button
    deleteButtons.forEach(button => {
        button.addEventListener("click", async function () {

            const articleId = this.getAttribute("data-id");
            console.log(articleId);

            if (!confirm("Are you sure you want to delete this article?")) {
                return; // When user clicks "Cancel", stop delete
            }

            try {
                const response = await fetch(`/articles/my/delete/${articleId}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    // Delete successfully, remove the article item from DOM
                    document.querySelector(`#article-${articleId}`).remove();
                    alert("Article deleted successfully.");
                } else {
                    const errorData = await response.json();
                    alert("Delete Error: " + errorData.error);
                }
            } catch (error) {
                console.error("Delete request failed:", error);
            }
        });
    });


    // Add event listener to every edit button
    editButtons.forEach(button => {
        button.addEventListener("click", function () {
            const articleId = this.getAttribute("data-id");
            window.location.href = `/articles/edit/${articleId}`;
        });
    });


});
