// Konu detay sayfası için JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // API_URL tanımlı değilse tanımla
    if (typeof window.API_URL === 'undefined') {
        console.log('Topic-detail.js: API_URL tanımlı değil, tanımlanıyor');
        window.API_URL = 'http://localhost:8080/api';
    }
    
    // URL'den konu ID'sini al
    const urlParams = new URLSearchParams(window.location.search);
    const topicId = urlParams.get('id');
    
    if (!topicId) {
        showAlert('Konu ID bulunamadı. Ana sayfaya yönlendiriliyorsunuz.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
        return;
    }
    
    // Konu detaylarını yükle
    loadTopicDetails(topicId);
    
    // Yorum formu işlemleri
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitComment(topicId);
        });
    }
});

// Kimlik doğrulama yardımcı fonksiyonları
const isAuthenticated = () => {
    return window.forumJavaAuth && window.forumJavaAuth.isAuthenticated();
};

const getCurrentUser = () => {
    return window.forumJavaAuth && window.forumJavaAuth.getCurrentUser();
};

const getToken = () => {
    return window.forumJavaAuth && window.forumJavaAuth.getToken();
};

// Konu detaylarını yükleme
const loadTopicDetails = async (topicId) => {
    const topicContainer = document.getElementById('topic-container');
    const commentsContainer = document.getElementById('comments-container');
    const loadingElement = document.getElementById('loading-topic');
    const commentsLoadingElement = document.getElementById('loading-comments');
    
    try {
        // Konu detaylarını yükle
        if (loadingElement) loadingElement.style.display = 'block';
        if (topicContainer) topicContainer.style.display = 'none';
        
        const response = await fetch(`${window.API_URL}/topics/${topicId}`);
        
        if (!response.ok) {
            throw new Error('Konu detayları yüklenirken bir hata oluştu');
        }
        
        const topic = await response.json();
        
        // Konu görüntüleme sayısını artır
        await incrementViewCount(topicId);
        
        // Konu detaylarını göster
        displayTopicDetails(topic);
        
        // Yorumları yükle
        if (loadingElement) loadingElement.style.display = 'none';
        if (topicContainer) topicContainer.style.display = 'block';
        if (commentsLoadingElement) commentsLoadingElement.style.display = 'block';
        
        const commentsResponse = await fetch(`${window.API_URL}/comments/topic/${topicId}`);
        
        if (!commentsResponse.ok) {
            throw new Error('Yorumlar yüklenirken bir hata oluştu');
        }
        
        const comments = await commentsResponse.json();
        
        // Yorumları göster
        displayComments(comments, commentsContainer);
        if (commentsLoadingElement) commentsLoadingElement.style.display = 'none';
        
        // Kullanıcı giriş yapmışsa yorum formunu göster
        const commentFormContainer = document.getElementById('comment-form-container');
        if (commentFormContainer) {
            if (isAuthenticated()) {
                commentFormContainer.style.display = 'block';
            } else {
                const loginPrompt = document.createElement('div');
                loginPrompt.className = 'login-prompt';
                loginPrompt.innerHTML = '<p>Yorum yapabilmek için <a href="login.html">giriş yapın</a> veya <a href="register.html">kayıt olun</a>.</p>';
                commentFormContainer.parentNode.insertBefore(loginPrompt, commentFormContainer);
            }
        }
    } catch (error) {
        console.error('Konu detayları yüklenirken hata:', error);
        if (loadingElement) loadingElement.style.display = 'none';
        if (commentsLoadingElement) commentsLoadingElement.style.display = 'none';
        if (topicContainer) topicContainer.innerHTML = '<p class="error">Konu detayları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>';
    }
};

// Konu detaylarını gösterme
const displayTopicDetails = (topic) => {
    const topicContainer = document.getElementById('topic-container');
    const createdDate = new Date(topic.createdAt).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Konu başlığını sayfanın başlığına ekle
    document.title = `${topic.title} - Forum Java`;
    
    // Kullanıcı giriş yapmış mı kontrol et
    const isUserAuthenticated = isAuthenticated();
    const currentUser = getCurrentUser();
    const isAuthor = isUserAuthenticated && currentUser && currentUser.id === topic.author.id;
    
    topicContainer.innerHTML = `
        <div class="topic-detail-header">
            <h1>${topic.title}</h1>
            <div class="topic-meta">
                <div class="topic-author">
                    <img src="${topic.author.profilePicture || 'https://via.placeholder.com/40'}" alt="${topic.author.username}">
                    <span>${topic.author.fullName || topic.author.username}</span>
                </div>
                <div class="topic-date">${createdDate}</div>
            </div>
        </div>
        <div class="topic-detail-content">
            ${topic.content}
        </div>
        <div class="topic-detail-footer">
            <div class="topic-stats">
                <div class="topic-views">
                    <i class="fas fa-eye"></i> ${topic.viewCount || 0} Görüntülenme
                </div>
                <div class="topic-comments-count">
                    <i class="fas fa-comment"></i> ${topic.comments ? topic.comments.length : 0} Yorum
                </div>
            </div>
            ${isAuthor ? `
                <div class="topic-actions">
                    <button class="btn btn-edit" id="edit-topic-btn">Düzenle</button>
                    <button class="btn btn-delete" id="delete-topic-btn">Sil</button>
                </div>
            ` : ''}
        </div>
    `;
    
    // Düzenleme ve silme butonları için event listener'lar
    const editBtn = document.getElementById('edit-topic-btn');
    const deleteBtn = document.getElementById('delete-topic-btn');
    
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            // Düzenleme modalını göster
            showEditTopicModal(topic);
        });
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            // Silme onayı iste
            if (confirm('Bu konuyu silmek istediğinize emin misiniz?')) {
                deleteTopic(topic.id);
            }
        });
    }
};

// Yorumları gösterme
const displayComments = (comments, container) => {
    if (!comments || comments.length === 0) {
        container.innerHTML = '<p class="no-comments">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>';
        return;
    }
    
    container.innerHTML = '';
    
    // Kullanıcı giriş yapmış mı kontrol et
    const isUserAuthenticated = isAuthenticated();
    const currentUser = getCurrentUser();
    
    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.id = `comment-${comment.id}`;
        
        const createdDate = new Date(comment.createdAt).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const isAuthor = isUserAuthenticated && currentUser && currentUser.id === comment.author.id;
        
        commentElement.innerHTML = `
            <div class="comment-header">
                <div class="comment-author">
                    <img src="${comment.author.profilePicture || 'https://via.placeholder.com/30'}" alt="${comment.author.username}">
                    <span>${comment.author.fullName || comment.author.username}</span>
                </div>
                <div class="comment-date">${createdDate}</div>
            </div>
            <div class="comment-content">
                ${comment.content}
            </div>
            ${isAuthor ? `
                <div class="comment-actions">
                    <button class="btn-edit-comment" data-id="${comment.id}">Düzenle</button>
                    <button class="btn-delete-comment" data-id="${comment.id}">Sil</button>
                </div>
            ` : ''}
        `;
        
        container.appendChild(commentElement);
    });
    
    // Yorum düzenleme ve silme butonları için event listener'lar
    const editButtons = document.querySelectorAll('.btn-edit-comment');
    const deleteButtons = document.querySelectorAll('.btn-delete-comment');
    
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const commentId = button.getAttribute('data-id');
            const comment = comments.find(c => c.id == commentId);
            if (comment) {
                showEditCommentModal(comment);
            }
        });
    });
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const commentId = button.getAttribute('data-id');
            if (confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
                deleteComment(commentId);
            }
        });
    });
};

// Görüntüleme sayısını artırma
const incrementViewCount = async (topicId) => {
    try {
        await fetch(`${window.API_URL}/topics/${topicId}/view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Görüntüleme sayısı artırılırken hata:', error);
    }
};

// Yorum gönderme
const submitComment = async (topicId) => {
    const commentContent = document.getElementById('comment-content').value.trim();
    const alertElement = document.getElementById('comment-alert');
    
    if (!commentContent) {
        showAlert('Lütfen bir yorum yazın.', 'error', alertElement);
        return;
    }
    
    try {
        const token = getToken();
        
        if (!token) {
            showAlert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.', 'error', alertElement);
            return;
        }
        
        const response = await fetch(`${window.API_URL}/comments/topic/${topicId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                content: commentContent
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Yorum gönderilirken bir hata oluştu');
        }
        
        // Formu temizle
        document.getElementById('comment-content').value = '';
        
        // Yorumları yeniden yükle
        const commentsResponse = await fetch(`${window.API_URL}/comments/topic/${topicId}`);
        const comments = await commentsResponse.json();
        
        const commentsContainer = document.getElementById('comments-container');
        displayComments(comments, commentsContainer);
        
        showAlert('Yorumunuz başarıyla gönderildi.', 'success', alertElement);
    } catch (error) {
        console.error('Yorum gönderilirken hata:', error);
        showAlert(error.message || 'Yorum gönderilirken bir hata oluştu.', 'error', alertElement);
    }
};

// Konu düzenleme modalını gösterme
const showEditTopicModal = (topic) => {
    // Modal HTML'ini oluştur
    const modalHTML = `
        <div id="edit-topic-modal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Konuyu Düzenle</h2>
                <div id="edit-topic-alert"></div>
                <form id="edit-topic-form">
                    <div class="form-group">
                        <label for="edit-topic-title">Başlık</label>
                        <input type="text" id="edit-topic-title" value="${topic.title}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-topic-content">İçerik</label>
                        <textarea id="edit-topic-content" rows="10" required>${topic.content}</textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Kaydet</button>
                        <button type="button" class="btn btn-secondary" id="cancel-edit-topic">İptal</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Modal'ı body'ye ekle
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('edit-topic-modal');
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = document.getElementById('cancel-edit-topic');
    const form = document.getElementById('edit-topic-form');
    
    // Modal'ı göster
    modal.style.display = 'block';
    
    // Kapatma işlemleri
    const closeModal = () => {
        modal.style.display = 'none';
        modal.remove();
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Form gönderimi
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        updateTopic(topic.id);
    });
};

// Yorum düzenleme modalını gösterme
const showEditCommentModal = (comment) => {
    // Modal HTML'ini oluştur
    const modalHTML = `
        <div id="edit-comment-modal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Yorumu Düzenle</h2>
                <div id="edit-comment-alert"></div>
                <form id="edit-comment-form">
                    <div class="form-group">
                        <label for="edit-comment-content">Yorum</label>
                        <textarea id="edit-comment-content" rows="5" required>${comment.content}</textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Kaydet</button>
                        <button type="button" class="btn btn-secondary" id="cancel-edit-comment">İptal</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Modal'ı body'ye ekle
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('edit-comment-modal');
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = document.getElementById('cancel-edit-comment');
    const form = document.getElementById('edit-comment-form');
    
    // Modal'ı göster
    modal.style.display = 'block';
    
    // Kapatma işlemleri
    const closeModal = () => {
        modal.style.display = 'none';
        modal.remove();
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Form gönderimi
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        updateComment(comment.id);
    });
};

// Konu güncelleme
const updateTopic = async (topicId) => {
    const title = document.getElementById('edit-topic-title').value.trim();
    const content = document.getElementById('edit-topic-content').value.trim();
    const alertElement = document.getElementById('edit-topic-alert');
    
    if (!title || !content) {
        showAlert('Lütfen tüm alanları doldurun.', 'error', alertElement);
        return;
    }
    
    try {
        const token = getToken();
        
        if (!token) {
            showAlert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.', 'error', alertElement);
            return;
        }
        
        const response = await fetch(`${window.API_URL}/topics/${topicId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                content
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Konu güncellenirken bir hata oluştu');
        }
        
        // Modal'ı kapat
        const modal = document.getElementById('edit-topic-modal');
        modal.style.display = 'none';
        modal.remove();
        
        // Konu detaylarını yeniden yükle
        loadTopicDetails(topicId);
        
        showAlert('Konu başarıyla güncellendi.', 'success');
    } catch (error) {
        console.error('Konu güncellenirken hata:', error);
        showAlert(error.message || 'Konu güncellenirken bir hata oluştu.', 'error', alertElement);
    }
};

// Yorum güncelleme
const updateComment = async (commentId) => {
    const content = document.getElementById('edit-comment-content').value.trim();
    const alertElement = document.getElementById('edit-comment-alert');
    
    if (!content) {
        showAlert('Lütfen bir yorum yazın.', 'error', alertElement);
        return;
    }
    
    try {
        const token = getToken();
        
        if (!token) {
            showAlert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.', 'error', alertElement);
            return;
        }
        
        const response = await fetch(`${window.API_URL}/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                content
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Yorum güncellenirken bir hata oluştu');
        }
        
        // Modal'ı kapat
        const modal = document.getElementById('edit-comment-modal');
        modal.style.display = 'none';
        modal.remove();
        
        // URL'den konu ID'sini al
        const urlParams = new URLSearchParams(window.location.search);
        const topicId = urlParams.get('id');
        
        // Yorumları yeniden yükle
        const commentsResponse = await fetch(`${window.API_URL}/comments/topic/${topicId}`);
        const comments = await commentsResponse.json();
        
        const commentsContainer = document.getElementById('comments-container');
        displayComments(comments, commentsContainer);
        
        showAlert('Yorum başarıyla güncellendi.', 'success');
    } catch (error) {
        console.error('Yorum güncellenirken hata:', error);
        showAlert(error.message || 'Yorum güncellenirken bir hata oluştu.', 'error', alertElement);
    }
};

// Konu silme
const deleteTopic = async (topicId) => {
    try {
        const token = getToken();
        
        if (!token) {
            showAlert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.', 'error');
            return;
        }
        
        const response = await fetch(`${window.API_URL}/topics/${topicId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Konu silinirken bir hata oluştu');
        }
        
        showAlert('Konu başarıyla silindi. Ana sayfaya yönlendiriliyorsunuz.', 'success');
        
        // Ana sayfaya yönlendir
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } catch (error) {
        console.error('Konu silinirken hata:', error);
        showAlert(error.message || 'Konu silinirken bir hata oluştu.', 'error');
    }
};

// Yorum silme
const deleteComment = async (commentId) => {
    try {
        const token = getToken();
        
        if (!token) {
            showAlert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.', 'error');
            return;
        }
        
        const response = await fetch(`${window.API_URL}/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Yorum silinirken bir hata oluştu');
        }
        
        // URL'den konu ID'sini al
        const urlParams = new URLSearchParams(window.location.search);
        const topicId = urlParams.get('id');
        
        // Yorumları yeniden yükle
        const commentsResponse = await fetch(`${window.API_URL}/comments/topic/${topicId}`);
        const comments = await commentsResponse.json();
        
        const commentsContainer = document.getElementById('comments-container');
        displayComments(comments, commentsContainer);
        
        showAlert('Yorum başarıyla silindi.', 'success');
    } catch (error) {
        console.error('Yorum silinirken hata:', error);
        showAlert(error.message || 'Yorum silinirken bir hata oluştu.', 'error');
    }
};

// Uyarı gösterme
const showAlert = (message, type, container = null) => {
    console.log(`Topic-detail.js: showAlert çağrıldı - Mesaj: "${message}", Tip: ${type}`);
    
    // window.showAlert fonksiyonu varsa onu kullan
    if (window.showAlert) {
        window.showAlert(message, type, container);
        return;
    }
    
    // Yoksa kendi implementasyonumuzu kullan
    const alertElement = container || document.getElementById('topic-alert');
    
    if (!alertElement) {
        console.error('Topic-detail.js: Alert element bulunamadı');
        alert(message);
        return;
    }
    
    alertElement.innerHTML = message;
    alertElement.className = `alert alert-${type}`;
    alertElement.style.display = 'block';
    
    // 5 saniye sonra uyarıyı gizle
    setTimeout(() => {
        alertElement.style.display = 'none';
    }, 5000);
}; 