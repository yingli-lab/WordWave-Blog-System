
// Note:
// This is not original idea.
// I have searched for mainstream sorting methods and referred to other blog websites.
// After making sure I understood their ranking rules,
// Modified them according to my own needs.

document.addEventListener("DOMContentLoaded", function () {

    // Get the sort buttons
    const sortButtons = document.querySelectorAll(".sort-btn");
    let currentSort = {
        type: null,
        ascending: true // Default sort ascending
    };

    // Add click event to every button
    sortButtons.forEach(button => {
        button.addEventListener("click", function () {
            const sortType = this.dataset.sort;

            // If you click the same sort button repeatedly
            // Switch sort order
            if (currentSort.type === sortType) {
                currentSort.ascending = !currentSort.ascending;
            } else { // If you click the different sort button
                currentSort = {
                    type: sortType, // Update sort type
                    ascending: true // default: assending
                };
            }

            sortArticles(sortType, currentSort.ascending);
            updateUI(sortType, currentSort.ascending);
        });
    });
});

function sortArticles(type, ascending) {
    // Get articles container
    const articleContainer = document.querySelector(".articles");

    // Get all article items and convert them into an array
    let articles = Array.from(articleContainer.children);

    articles.sort((a, b) => {
        let valueA = a.dataset[type];
        let valueB = b.dataset[type];

        if (type === "created_time") { // If it is time
            valueA = new Date(valueA).getTime(); // Convert to timestamp for easy comparison.
            valueB = new Date(valueB).getTime();
            return ascending ? valueA - valueB : valueB - valueA;

        } else {
            // If it is a string (title, author), Sort alphabetically
            return ascending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        }
    });

    // Clear the articleContainer
    articleContainer.innerHTML = "";
    //  reset the articles in the new order
    articles.forEach(article => articleContainer.appendChild(article));
}

// Update sort buttons UI
function updateUI(sortType, ascending) {
    document.querySelectorAll(".sort-btn").forEach(btn => {
        btn.classList.remove("active", "asc", "desc");
    });

    const activeButton = document.querySelector(`[data-sort=${sortType}]`);
    activeButton.classList.add("active", ascending ? "asc" : "desc");
}
