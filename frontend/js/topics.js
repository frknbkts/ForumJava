// Konular sayfası için JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // API_URL tanımlı değilse tanımla
    if (typeof window.API_URL === 'undefined') {
        console.log('Topics.js: API_URL tanımlı değil, tanımlanıyor');
        window.API_URL = 'http://localhost:8080/api';
    }
    
    // Konuları yükle
    loadTopics();
    
    // Arama işlemi
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                loadTopics(0, query);
            } else {
                loadTopics();
            }
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    loadTopics(0, query);
                } else {
                    loadTopics();
                }
            }
        });
    }
});

// Konuları yükleme
const loadTopics = async (page = 0, query = null) => {
    const topicsList = document.getElementById('topics-list');
    const paginationElement = document.getElementById('pagination');
    const size = 10;
    
    try {
        let url = `${window.API_URL}/topics?page=${page}&size=${size}`;
        
        if (query) {
            url = `${window.API_URL}/topics/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error('Konular yüklenirken bir hata oluştu');
        }
        
        if (data.content && data.content.length > 0) {
            topicsList.innerHTML = '';
            
            data.content.forEach(topic => {
                topicsList.appendChild(createTopicCard(topic));
            });
            
            // Sayfalama
            createPagination(paginationElement, data.totalPages, page, query);
        } else {
            topicsList.innerHTML = '<p class="no-content">Henüz konu bulunmamaktadır.</p>';
            paginationElement.innerHTML = '';
        }
    } catch (error) {
        console.error('Konular yüklenirken hata:', error);
        topicsList.innerHTML = '<p class="error">Konular yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>';
        paginationElement.innerHTML = '';
    }
};

// Konu kartı oluşturma
const createTopicCard = (topic) => {
    const card = document.createElement('div');
    card.className = 'topic-card';
    
    const createdDate = new Date(topic.createdAt).toLocaleDateString('tr-TR');
    const excerpt = topic.content.length > 200 ? topic.content.substring(0, 200) + '...' : topic.content;
    
    card.innerHTML = `
        <div class="topic-header">
            <h3 class="topic-title"><a href="topic-detail.html?id=${topic.id}">${topic.title}</a></h3>
        </div>
        <div class="topic-meta">
            <div class="topic-author">
                <img src="${topic.author.profilePicture || 'https://via.placeholder.com/30'}" alt="${topic.author.username}">
                <span>${topic.author.fullName || topic.author.username}</span>
            </div>
            <div class="topic-date">${createdDate}</div>
        </div>
        <div class="topic-content">
            ${excerpt}
        </div>
        <div class="topic-footer">
            <div class="topic-comments">
                <i class="fas fa-comment"></i> ${topic.comments ? topic.comments.length : 0} Yorum
            </div>
            <div class="topic-views">
                <i class="fas fa-eye"></i> ${topic.viewCount || 0} Görüntülenme
            </div>
        </div>
    `;
    
    return card;
};

// Sayfalama oluşturma
const createPagination = (element, totalPages, currentPage, query) => {
    element.innerHTML = '';
    
    if (totalPages <= 1) {
        return;
    }
    
    const ul = document.createElement('ul');
    ul.className = 'pagination-list';
    
    // Önceki sayfa
    if (currentPage > 0) {
        const prevItem = document.createElement('li');
        prevItem.className = 'pagination-item';
        
        const prevLink = document.createElement('a');
        prevLink.className = 'pagination-link';
        prevLink.href = '#';
        prevLink.innerHTML = '&laquo; Önceki';
        
        prevLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadTopics(currentPage - 1, query);
        });
        
        prevItem.appendChild(prevLink);
        ul.appendChild(prevItem);
    }
    
    // Sayfa numaraları
    for (let i = 0; i < totalPages; i++) {
        if (totalPages > 7 && i > 1 && i < totalPages - 2 && Math.abs(i - currentPage) > 1) {
            if (i === 2 && currentPage > 3) {
                const ellipsisItem = document.createElement('li');
                ellipsisItem.className = 'pagination-item';
                ellipsisItem.textContent = '...';
                ul.appendChild(ellipsisItem);
            }
            continue;
        }
        
        const pageItem = document.createElement('li');
        pageItem.className = 'pagination-item';
        
        const pageLink = document.createElement('a');
        pageLink.className = 'pagination-link';
        if (i === currentPage) {
            pageLink.className += ' active';
        }
        pageLink.href = '#';
        pageLink.textContent = i + 1;
        
        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (i !== currentPage) {
                loadTopics(i, query);
            }
        });
        
        pageItem.appendChild(pageLink);
        ul.appendChild(pageItem);
        
        if (totalPages > 7 && i === totalPages - 3 && currentPage < totalPages - 4) {
            const ellipsisItem = document.createElement('li');
            ellipsisItem.className = 'pagination-item';
            ellipsisItem.textContent = '...';
            ul.appendChild(ellipsisItem);
        }
    }
    
    // Sonraki sayfa
    if (currentPage < totalPages - 1) {
        const nextItem = document.createElement('li');
        nextItem.className = 'pagination-item';
        
        const nextLink = document.createElement('a');
        nextLink.className = 'pagination-link';
        nextLink.href = '#';
        nextLink.innerHTML = 'Sonraki &raquo;';
        
        nextLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadTopics(currentPage + 1, query);
        });
        
        nextItem.appendChild(nextLink);
        ul.appendChild(nextItem);
    }
    
    element.appendChild(ul);
}; 