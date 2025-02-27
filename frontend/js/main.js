// Ana sayfa için JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Son konuları yükle
    loadRecentTopics();
});

// Son konuları yükleme
const loadRecentTopics = async () => {
    const topicsList = document.getElementById('recent-topics-list');
    
    try {
        const response = await fetch(`${window.API_URL}/topics?page=0&size=5`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error('Konular yüklenirken bir hata oluştu');
        }
        
        if (data.content && data.content.length > 0) {
            topicsList.innerHTML = '';
            
            data.content.forEach(topic => {
                topicsList.appendChild(createTopicCard(topic));
            });
        } else {
            topicsList.innerHTML = '<p class="no-content">Henüz konu bulunmamaktadır.</p>';
        }
    } catch (error) {
        console.error('Konular yüklenirken hata:', error);
        topicsList.innerHTML = '<p class="error">Konular yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>';
    }
};

// Konu kartı oluşturma
const createTopicCard = (topic) => {
    const card = document.createElement('div');
    card.className = 'topic-card';
    
    const createdDate = new Date(topic.createdAt).toLocaleDateString('tr-TR');
    const excerpt = topic.content.length > 150 ? topic.content.substring(0, 150) + '...' : topic.content;
    
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