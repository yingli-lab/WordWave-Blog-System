
// Hide and show the dropdown menu
const avatarButton = document.querySelector("#avatarButton");
const dropdownMenu = document.querySelector("#dropdownMenu");

if (avatarButton && dropdownMenu) {
    // Show menu when click avatar
    avatarButton.addEventListener("click", (e) => {
        dropdownMenu.classList.toggle("show");
    });

    // Close dropdown when click outside
    document.addEventListener("click", (e) => {
        if (!dropdownMenu.contains(e.target) && !avatarButton.contains(e.target)) {
            dropdownMenu.classList.remove("show");
        }
    });
}