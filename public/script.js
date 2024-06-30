const dateElement = document.getElementById("copyright");
const article = document.getElementById("articles");
const search = document.getElementById("search-bar");
const metadata = document.getElementById("metadata");
const articlePathRegex = /^\/articles\/[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
const currentPath = window.location.pathname;

if (currentPath === "/") {
    search.style.display = "flex";
}

if (articlePathRegex.test(currentPath)) {
    metadata.style.display = "flex";
    metadata.style.flexDirection = "column";
}

const d = new Date();
dateElement.innerHTML = `© ${d.getFullYear()} Maneesh Wijewardhana™. All Rights Reserved.`;
