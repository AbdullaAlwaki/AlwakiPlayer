// Alwaki Player - Vanilla JS Application

const videos = [
    { id: 1, title: "Nature Documentary", category: "documentaries", duration: "45:30", thumbnail: "https://picsum.photos/seed/nature/400/225", url: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Explore the beauty of nature." },
    { id: 2, title: "Action Movie", category: "movies", duration: "2:15:00", thumbnail: "https://picsum.photos/seed/action/400/225", url: "https://www.w3schools.com/html/movie.mp4", description: "High-octane action thriller." },
    { id: 3, title: "Comedy Series S1E1", category: "series", duration: "25:00", thumbnail: "https://picsum.photos/seed/comedy/400/225", url: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Hilarious comedy series." },
    { id: 4, title: "Kids Adventure", category: "kids", duration: "30:00", thumbnail: "https://picsum.photos/seed/kids/400/225", url: "https://www.w3schools.com/html/movie.mp4", description: "Fun adventure for kids." },
    { id: 5, title: "Sci-Fi Movie", category: "movies", duration: "2:30:00", thumbnail: "https://picsum.photos/seed/scifi/400/225", url: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Journey to distant galaxies." },
    { id: 6, title: "History Channel", category: "documentaries", duration: "50:00", thumbnail: "https://picsum.photos/seed/history/400/225", url: "https://www.w3schools.com/html/movie.mp4", description: "Ancient civilizations." },
    { id: 7, title: "Drama Series S2E5", category: "series", duration: "45:00", thumbnail: "https://picsum.photos/seed/drama/400/225", url: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Intense drama episode." },
    { id: 8, title: "Cartoon Fun", category: "kids", duration: "22:00", thumbnail: "https://picsum.photos/seed/cartoon/400/225", url: "https://www.w3schools.com/html/movie.mp4", description: "Animated family fun." }
];

let currentCategory = 'all';
let searchQuery = '';
let watchHistory = JSON.parse(localStorage.getItem('watchHistory') || '[]');

const videoGrid = document.getElementById('videoGrid');
const categories = document.getElementById('categories');
const searchInput = document.getElementById('searchInput');
const playerModal = document.getElementById('playerModal');
const closePlayer = document.getElementById('closePlayer');
const videoPlayer = document.getElementById('videoPlayer');
const videoTitle = document.getElementById('videoTitle');
const videoDescription = document.getElementById('videoDescription');
const historyGrid = document.getElementById('historyGrid');
const historySection = document.getElementById('historySection');

function init() {
    renderVideos();
    setupEventListeners();
    renderHistory();
}

function renderVideos() {
    const filtered = videos.filter(video => {
        const matchesCategory = currentCategory === 'all' || video.category === currentCategory;
        const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    videoGrid.innerHTML = filtered.map(video => `
        <div class="video-card" tabindex="0" data-id="${video.id}">
            <img class="video-thumbnail" src="${video.thumbnail}" alt="${video.title}" loading="lazy">
            <div class="video-info-card">
                <h3 class="video-title">${video.title}</h3>
                <div class="video-meta">
                    <span>${video.duration}</span>
                    <span>${video.category}</span>
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('click', () => playVideo(parseInt(card.dataset.id)));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                playVideo(parseInt(card.dataset.id));
            }
        });
    });
}

function playVideo(id) {
    const video = videos.find(v => v.id === id);
    if (!video) return;

    videoTitle.textContent = video.title;
    videoDescription.textContent = video.description;
    videoPlayer.src = video.url;
    
    playerModal.classList.remove('hidden');
    playerModal.classList.add('active');
    
    addToHistory(video);
    videoPlayer.focus();
}

function closePlayerModal() {
    playerModal.classList.remove('active');
    setTimeout(() => {
        playerModal.classList.add('hidden');
        videoPlayer.pause();
        videoPlayer.src = '';
    }, 300);
}

function addToHistory(video) {
    watchHistory = watchHistory.filter(v => v.id !== video.id);
    watchHistory.unshift({
        id: video.id,
        title: video.title,
        thumbnail: video.thumbnail,
        watchedAt: new Date().toISOString()
    });
    watchHistory = watchHistory.slice(0, 10);
    localStorage.setItem('watchHistory', JSON.stringify(watchHistory));
    renderHistory();
}

function renderHistory() {
    if (watchHistory.length === 0) {
        historySection.style.display = 'none';
        return;
    }
    
    historySection.style.display = 'block';
    historyGrid.innerHTML = watchHistory.map(video => `
        <div class="history-item" tabindex="0" data-id="${video.id}">
            <h4>${video.title}</h4>
            <p>${new Date(video.watchedAt).toLocaleDateString()}</p>
        </div>
    `).join('');

    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => playVideo(parseInt(item.dataset.id)));
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                playVideo(parseInt(item.dataset.id));
            }
        });
    });
}

function setupEventListeners() {
    categories.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-btn')) {
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            renderVideos();
        }
    });

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        renderVideos();
    });

    closePlayer.addEventListener('click', closePlayerModal);
    
    playerModal.addEventListener('click', (e) => {
        if (e.target === playerModal) closePlayerModal();
    });

    document.addEventListener('keydown', (e) => {
        if ((e.key === 'Escape' || e.key === 'Back') && !playerModal.classList.contains('hidden')) {
            closePlayerModal();
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
