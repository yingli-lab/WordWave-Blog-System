function goToLogin() {
    window.location.href = "/user/login";
}

// Function for switch likes,
// if user already liked it, remove it, else add it.
async function switchLike(articleId) {
    try {
        const response = await fetch(`/articles/${articleId}/likes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();

        if (response.ok) {
            document.querySelector("#like-count").textContent = result.likesCount;
        } else {
            alert(result.err);
        }

    } catch (error) {
        console.error("Error liking article:", error);
    }
}

// Switch comment section to show or hide
const commentSecButton = document.querySelector(".comment-section-button");
const commentSection = document.querySelector(".comment-section");

// Hide comment section first
commentSection.style.display = "none";

commentSecButton.addEventListener("click", function () {
    if (commentSection.style.display === "none") {
        commentSection.style.display = "block";
        commentSecButton.innerHTML = "Hide Comments ▲";
    } else {
        commentSection.style.display = "none";
        commentSecButton.innerHTML = "Show Comments ▼";
    }
});
