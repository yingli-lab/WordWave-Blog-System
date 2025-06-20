document.addEventListener("DOMContentLoaded", function () {

    //Initialize the Quill editor
    const editorElement = document.querySelector("#editor");
    const content = editorElement.dataset.content || "";

    const quill = new Quill("#editor", {
        theme: 'snow',
        modules: {
            toolbar: [
                [{'header': [1, 2, 3, false]}],
                ['bold', 'italic', 'underline'],
                [{'list': 'ordered'}, {'list': 'bullet'}]
            ]
        },
        placeholder: 'Start writing...'
    });

    // Load existing article content
    // quill.root.innerHTML = `{{{article.content}}}`;
    quill.clipboard.dangerouslyPasteHTML(content);

    // Image upload
    const imagePreview = document.querySelector("#imagePreview");
    const uploadBtn = document.querySelector("#uploadBtn");
    const changeBtn = document.querySelector("#changeBtn");
    const clearBtn = document.querySelector("#clearBtn");
    const imageInput = document.querySelector("#imageInput");

    let uploadedImage = `{{article.image_url}}` ? `{{article.image_url}}` : null; //Store the uploaded image URL

    // Publish button
    const publishButton = document.querySelector("#publishBtn");
    const republishButton = document.querySelector("#republishBtn");


    // Handle image uploads
    async function handleImageUpload(file) { // Receive a file

        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('imageFile', file);

        try {
            const response = await fetch("/articles/create/uploadImage", {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Upload image failed");
            }

            const result = await response.json();
            uploadedImage = result.imageUrl; // Sava image url

            // Clear the current content
            while (imagePreview.firstChild) {
                imagePreview.removeChild(imagePreview.firstChild);
            }

            // Add New Image
            const img = document.createElement('img');
            img.src = uploadedImage;
            imagePreview.appendChild(img);

            // Update button state
            uploadBtn.style.display = 'none';
            changeBtn.style.display = 'inline-flex';
            clearBtn.style.display = 'inline-flex';

        } catch (err) {
            alert(err.message);
        }
    }


    // Delete image
    function clearImage() {
        const coverImage = imagePreview.querySelector("#coverImage");

        if (coverImage) {
            imagePreview.removeChild(coverImage);
        }

        const placeholder = document.createElement("div");
        placeholder.classList.add("upload-placeholder");
        placeholder.textContent = "Preview Area";
        imagePreview.appendChild(placeholder);

        uploadedImage = null;

        uploadBtn.style.display = 'inline-flex';
        changeBtn.style.display = 'none';
        clearBtn.style.display = 'none';
        imageInput.value = '';
    }


    // Publish Article
    async function publishArticle() {
        const title = document.querySelector(".title-input").value;
        const content = quill.root.innerHTML;

        // Check content can not be null
        if (!title || !content) {
            alert("Please enter article title and content");
            return;
        }

        if (!uploadedImage) {
            alert("Please upload a cover image");
            return;
        }

        try { // publishing logic here
            const response = await fetch("/articles/create/new-article", {
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    title: title,
                    content: content,
                    image: uploadedImage
                }),
            });

            if (!response.ok) {
                console.error("Publish failed:", result.err);
                alert("Publish article failed: " + result.err);
                return;
            }

            alert("Article was published!");
            window.location.href = "/"; // Jump to the home page

        } catch (err) {
            alert(err.message);
        }

    }


    // Editing and Republish Article
    async function republishArticle() {
        const title = document.querySelector(".title-input").value;
        const content = quill.root.innerHTML;
        const articleId = republishButton.getAttribute("data-id");
        console.log("Republish button data-id:", articleId);

        if (!title || !content) {
            alert("Please enter article title and content");
            return;
        }

        if (!uploadedImage) {
            alert("Please upload a cover image");
            return;
        }

        try {
            const response = await fetch(`/articles/update/${articleId}`, {
                method: 'PUT',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    title: title,
                    content: content,
                    image: uploadedImage
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                console.error("Publish failed:", result.err);
                alert("Publish article failed: " + result.err);
                return;
            }

            alert("Article was published!");
            window.location.href = "/"; // Jump to the home page

        } catch (err) {
            alert(err.message);
            alert("Publish failed: " + result.err);
        }

    }


    // Add listener
    uploadBtn.addEventListener('click', () => imageInput.click());
    changeBtn.addEventListener('click', () => imageInput.click());
    clearBtn.addEventListener('click', clearImage);

    // Upload image
    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            handleImageUpload(file);
        }
    });

    // Use event delegation to handle button click
    // whether the button is dynamically rendered or statically present.
    document.body.addEventListener("click", function (event) {
        if (event.target.id === "publishBtn") {
            publishArticle();
        }
        if (event.target.id === "republishBtn") {
            republishArticle();
        }
    });

});

// Function for go back previous page when click cancel button.
function goBack() {
    window.history.back();
};


