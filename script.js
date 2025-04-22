// API Configuration
const API_KEY = 'YOUR API KEY';
const BASE_URL = 'YOUR API LINK';
const ITEMS_PER_PAGE = 40;

let currentPage = 1;
let currentQuery = '';
let currentCategory = '';
let totalPages = 1;

// DOM Elements
const newsContainer = document.getElementById('newsContainer');
const featuredArticle = document.getElementById('featuredArticle');
const photoStories = document.getElementById('photoStories');
const textNews = document.getElementById('textNews');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageNumbers = document.getElementById('pageNumbers');
const categoryLinks = document.querySelectorAll('.category');
const tickerContent = document.getElementById('tickerContent');
const spotlightList = document.getElementById('spotlightList');
const worldOfStarsList = document.getElementById('worldOfStarsList');
const moreNewsLeft = document.getElementById('moreNewsLeft');
const moreNewsRight = document.getElementById('moreNewsRight');
const citySelect = document.getElementById('citySelect');
const hamburger = document.getElementById('hamburger');
const categoryNav = document.getElementById('categoryNav');

// Fetch News Data
async function fetchNews(page = 1, query = '', category = '') {
    try {
        let url = `${BASE_URL}?api-key=${API_KEY}&page=${page}&page-size=${ITEMS_PER_PAGE}&show-fields=thumbnail,trailText`;
        if (query) url += `&q=${encodeURIComponent(query)}`;
        if (category) url += `&section=${category}`; // Corrected 'section'

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        if (!data.response || !data.response.results || data.response.results.length === 0) {
            throw new Error('No news articles found in API response');
        }

        displayFeaturedArticle(data.response.results[0]);
        displayNews(data.response.results.slice(1, 7));
        displayTextNews(data.response.results.slice(7, 12));
        displayPhotoStories(data.response.results.slice(12, 17));
        displayMoreNewsLeft(data.response.results.slice(17, 24));
        displayMoreNewsRight(data.response.results.slice(24, 31));
        updatePagination(data.response);

        // Scroll to top after content is loaded
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } catch (error) {
        console.error('Error fetching news:', error);
        newsContainer.innerHTML = '<p class="error">Failed to load news. Please try again later.</p>';
        featuredArticle.innerHTML = '<p class="error">Failed to load featured article.</p>';
        photoStories.innerHTML = '<p class="error">Failed to load photostories.</p>';
        textNews.innerHTML = '<li class="error">Failed to load latest updates.</li>';
        moreNewsLeft.innerHTML = '<li class="error">Failed to load more news.</li>';
        moreNewsRight.innerHTML = '<li class="error">Failed to load more news.</li>';
    }
}

// Fetch Breaking News for Ticker
async function fetchBreakingNews() {
    try {
        const url = `${BASE_URL}?api-key=${API_KEY}&page-size=5&order-by=newest&show-fields=trailText`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        if (data.response && data.response.results) {
            displayTicker(data.response.results);
        } else {
            throw new Error('No breaking news found');
        }
    } catch (error) {
        console.error('Error fetching breaking news:', error);
        tickerContent.innerHTML = '<div class="ticker-content-wrapper">Unable to load breaking news.</div>';
    }
}

// Fetch Spotlight (Trending)
async function fetchSpotlight() {
    try {
        const url = `${BASE_URL}?api-key=${API_KEY}&page-size=10&order-by=relevance&show-fields=trailText`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        if (data.response && data.response.results) {
            displaySpotlight(data.response.results);
        } else {
            throw new Error('No spotlight articles found');
        }
    } catch (error) {
        console.error('Error fetching spotlight:', error);
        spotlightList.innerHTML = '<li>Unable to load spotlight.</li>';
    }
}

// Fetch World of Stars (Entertainment)
async function fetchWorldOfStars() {
    try {
        const url = `${BASE_URL}?api-key=${API_KEY}&page-size=10&section=film&show-fields=trailText`; // Fixed typo: 'section' instead of '§ion'
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        if (data.response && data.response.results) {
            displayWorldOfStars(data.response.results);
        } else {
            throw new Error('No world of stars articles found');
        }
    } catch (error) {
        console.error('Error fetching world of stars:', error);
        worldOfStarsList.innerHTML = '<li>Unable to load world of stars.</li>';
    }
}

// Display Featured Article
function displayFeaturedArticle(article) {
    if (!article) {
        featuredArticle.innerHTML = '<p class="error">No featured article available.</p>';
        return;
    }
    featuredArticle.innerHTML = '';
    const thumbnail = article.fields?.thumbnail || 'https://via.placeholder.com/300x200';
    const trailText = article.fields?.trailText || 'No summary available';
    const pubDate = new Date(article.webPublicationDate).toLocaleString();

    featuredArticle.innerHTML = `
        <img src="${thumbnail}" alt="${article.webTitle}" loading="lazy">
        <div class="featured-card-content">
            <h2>${article.webTitle}</h2>
            <p>${trailText}</p>
            <div class="timestamp">${pubDate}</div>
            <a href="${article.webUrl}" target="_blank" class="read-more">Read More</a>
        </div>
        <a href="${article.webUrl}" target="_blank"></a>
    `;
}

// Display News Articles
function displayNews(articles) {
    newsContainer.innerHTML = '';
    if (articles.length === 0) {
        newsContainer.innerHTML = '<p class="error">No top stories available.</p>';
        return;
    }
    articles.forEach(article => {
        const card = document.createElement('div');
        card.classList.add('news-card');

        const thumbnail = article.fields?.thumbnail || 'https://via.placeholder.com/300x200';
        const trailText = article.fields?.trailText || 'No summary available';
        const pubDate = new Date(article.webPublicationDate).toLocaleString();

        card.innerHTML = `
            <img src="${thumbnail}" alt="${article.webTitle}" loading="lazy">
            <div class="news-card-content">
                <h2>${article.webTitle}</h2>
                <p>${trailText}</p>
                <div class="timestamp">${pubDate}</div>
                <a href="${article.webUrl}" target="_blank" class="read-more">Read More</a>
            </div>
            <a href="${article.webUrl}" target="_blank"></a>
        `;
        newsContainer.appendChild(card);
    });
}

// Display Text News (Bullet Points)
function displayTextNews(articles) {
    textNews.innerHTML = '';
    if (articles.length === 0) {
        textNews.innerHTML = '<li class="error">No latest updates available.</li>';
        return;
    }
    articles.forEach(article => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${article.webUrl}" target="_blank">${article.webTitle}</a>`;
        textNews.appendChild(li);
    });
}

// Display Photostories
function displayPhotoStories(articles) {
    photoStories.innerHTML = '';
    if (articles.length === 0) {
        photoStories.innerHTML = '<p class="error">No photostories available.</p>';
        return;
    }
    articles.forEach(article => {
        const card = document.createElement('div');
        card.classList.add('photo-card');

        const thumbnail = article.fields?.thumbnail || 'https://via.placeholder.com/150x100';

        card.innerHTML = `
            <img src="${thumbnail}" alt="${article.webTitle}" loading="lazy">
            <div class="photo-card-content">
                <h3>${article.webTitle}</h3>
            </div>
            <a href="${article.webUrl}" target="_blank"></a>
        `;
        photoStories.appendChild(card);
    });
}

// Display Breaking News Ticker
function displayTicker(articles) {
    const wrapper = tickerContent.querySelector('.ticker-content-wrapper');
    wrapper.innerHTML = articles.map(article => 
        `<a href="${article.webUrl}" target="_blank">${article.webTitle}</a>`
    ).join('');
}

// Display Spotlight
function displaySpotlight(articles) {
    spotlightList.innerHTML = articles.map(article => 
        `<li><a href="${article.webUrl}" target="_blank">${article.webTitle}</a></li>`
    ).join('');
}

// Display World of Stars
function displayWorldOfStars(articles) {
    const html = articles.map(article => 
        `<li><a href="${article.webUrl}" target="_blank">${article.webTitle}</a></li>`
    ).join('');
    worldOfStarsList.innerHTML = html;
}

// Display More News (Left Sidebar)
function displayMoreNewsLeft(articles) {
    moreNewsLeft.innerHTML = articles.map(article => 
        `<li><a href="${article.webUrl}" target="_blank">${article.webTitle}</a></li>`
    ).join('');
}

// Display More News (Right Sidebar)
function displayMoreNewsRight(articles) {
    moreNewsRight.innerHTML = articles.map(article => 
        `<li><a href="${article.webUrl}" target="_blank">${article.webTitle}</a></li>`
    ).join('');
}

// Update Pagination
function updatePagination(response) {
    totalPages = Math.ceil(response.total / ITEMS_PER_PAGE);
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    // Generate page numbers
    pageNumbers.innerHTML = '';
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageSpan = document.createElement('span');
        pageSpan.textContent = i;
        if (i === currentPage) {
            pageSpan.classList.add('active');
        }
        pageSpan.addEventListener('click', () => {
            currentPage = i;
            fetchNews(currentPage, currentQuery, currentCategory);
        });
        pageNumbers.appendChild(pageSpan);
    }
}

// Highlight Active Category
function updateActiveCategory() {
    categoryLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.category === currentCategory) {
            link.classList.add('active');
        }
    });
}

// Toggle Hamburger Menu
hamburger.addEventListener('click', () => {
    categoryNav.classList.toggle('active');
});

// Event Listeners
prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchNews(currentPage, currentQuery, currentCategory);
    }
});

nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        fetchNews(currentPage, currentQuery, currentCategory);
    }
});

categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        currentCategory = link.dataset.category;
        currentPage = 1;
        currentQuery = '';
        fetchNews(currentPage, currentQuery, currentCategory);
        updateActiveCategory();
        if (window.innerWidth <= 768) {
            categoryNav.classList.remove('active');
        }
    });
});

citySelect.addEventListener('change', () => {
    const city = citySelect.value;
    currentQuery = city === 'global' ? '' : city;
    currentPage = 1;
    fetchNews(currentPage, currentQuery, currentCategory);
});

// Initial Load and Auto-Refresh
fetchNews(currentPage, currentQuery, currentCategory);
fetchBreakingNews();
fetchSpotlight();
fetchWorldOfStars();

// Auto-refresh breaking news every 5 minutes
setInterval(fetchBreakingNews, 300000);