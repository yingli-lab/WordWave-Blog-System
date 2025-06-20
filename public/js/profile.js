// Get element first
const selectedAvatarId = document.querySelector("#avatar_id");

const usernameInput = document.querySelector("#username");
const firstNameInput = document.querySelector("#first_name");
const lastNameInput = document.querySelector("#last_name");

const passwordInput = document.querySelector("#password");
const repeatPasswordInput = document.querySelector("#repeat_password");

let availableUsername = false;

const primaryButton = document.querySelector(".btn-primary");




// Function for switch avatar drop-down list to show or hide
function toggleAvatarDropdown() {
    const avatarGrid = document.querySelector("#avatar-grid");
    avatarGrid.classList.toggle("hidden");
}

// Function for select an Avatar
function selectAvatar(element) {
    const selectedAvatar = document.querySelector("#selected-avatar");
    const avatarInput = document.querySelector("#avatar_id");
    const avatarGrid = document.querySelector("#avatar-grid");

    // Update the selected avatar
    selectedAvatar.src = element.src;
    avatarInput.value = element.getAttribute("data-avatar-id");

    // Hide avatar list
    avatarGrid.classList.add("hidden");
}




// Function for check repeated password.
function checkRepeatedPassword() {
    const password = passwordInput.value.trim();
    const repeatPassword = repeatPasswordInput.value.trim();
    const passwordStatus = document.querySelector("#password-status");

    if (repeatPassword.length === 0) {
        passwordStatus.textContent = "";
        return;
    }

    if (password === repeatPassword) {
        passwordStatus.textContent = "Passwords match";
        passwordStatus.style.color = "green";
    } else {
        passwordStatus.textContent = "Passwords do not match";
        passwordStatus.style.color = "red";
    }
}

// Function for checkUsername is unique
async function checkUsernameAvailability() {
    // Get input username
    const statusText = document.querySelector("#username-status");
    const username = usernameInput.value.trim();

    // If the input is empty, no check
    if (username.length === 0) {
        statusText.textContent = "";
        return;
    }

    try {
        const response = await fetch(`/user/register/check-username?username=${encodeURIComponent(username)}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.available) {
            statusText.textContent = "Username is available";
            statusText.style.color = "green";
            availableUsername = true;
        } else {
            statusText.textContent = "Username is taken";
            statusText.style.color = "red";
            availableUsername = false;
        }

    } catch (error) {
        console.error("Error checking username:", error);
        statusText.textContent = "Error checking username";
        statusText.style.color = "red";
        availableUsername = false;
    }
}

// Function for validate all input
function validateForm(mode) {
    let isValid = true;

    // Get input value
    const password = passwordInput.value.trim();
    const repeatPassword = repeatPasswordInput.value.trim();
    const username = usernameInput.value.trim();
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();

    if (!selectedAvatarId.value) {
        isValid = false;
    }

    if (!username || !firstName || !lastName) {
        isValid = false;
    }

    // Create mode
    if (mode === "create") {
        if (!password || !repeatPassword || password !== repeatPassword) {
            isValid = false;
        }
    }

    // Edit mode
    if (mode === "edit") {
        // Only when the user fills in the password, process verification.
        if ((password || repeatPassword) && password !== repeatPassword) {
            isValid = false;
        }
    }

    // Update button
    primaryButton.disabled = !isValid;
}




// Function for delete account
async function deleteAccount() {
    if (!confirm("Are you sure you want to delete your account?")) {
        return;
    }

    try {
        const response = await fetch("/user/delete", {
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.redirect) {
            alert("Your account has been deleted.");
            window.location.href = data.redirect;
        } else {
            window.location.href = "/";
        }

    } catch (error) {
        console.error("Error deleting account:", error);
    }
}



// Function for go back previous page when click cancel button.
function goBack() {
    window.history.back();
}


// Event listener
document.addEventListener("DOMContentLoaded", function () {
    const isEditing = Boolean(document.querySelector("#username").dataset.isEditing);
    const mode = isEditing ? "edit" : "create";

    validateForm(mode); // Validation on page load

    // Validate input
    usernameInput.addEventListener("input", () => validateForm(mode));
    firstNameInput.addEventListener("input", () => validateForm(mode));
    lastNameInput.addEventListener("input", () => validateForm(mode));

    passwordInput.addEventListener("input", () => {
        checkRepeatedPassword();
        validateForm(mode);
    });

    repeatPasswordInput.addEventListener("input", () => {
        checkRepeatedPassword();
        validateForm(mode);
    });

});





