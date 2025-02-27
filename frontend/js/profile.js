// Profil sayfası için JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Kullanıcı giriş yapmamışsa ana sayfaya yönlendir
    if (!isAuthenticated()) {
        showAlert('Profil sayfasını görüntülemek için giriş yapmalısınız.', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    // Profil bilgilerini yükle
    loadProfile();
    
    // Tab işlemleri
    const topicsTab = document.getElementById('topics-tab');
    const commentsTab = document.getElementById('comments-tab');
    
    if (topicsTab && commentsTab) {
        topicsTab.addEventListener('click', () => {
            showTab('topics');
        });
        
        commentsTab.addEventListener('click', () => {
            showTab('comments');
        });
    }
    
    // Profil düzenleme butonu
    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            showEditProfileModal();
        });
    }
});

// Profil bilgilerini yükleme
const loadProfile = async () => {
    const profileContainer = document.getElementById('profile-container');
    const loadingElement = document.getElementById('loading-profile');
    
    try {
        loadingElement.style.display = 'block';
        profileContainer.style.display = 'none';
        
        const user = getCurrentUser();
        
        if (!user) {
            throw new Error('Kullanıcı bilgileri bulunamadı');
        }
        
        // Kullanıcı bilgilerini göster
        displayProfile(user);
        
        // Kullanıcının konularını yükle
        loadUserTopics();
        
        // Kullanıcının yorumlarını yükle
        loadUserComments();
        
        loadingElement.style.display = 'none';
        profileContainer.style.display = 'block';
    } catch (error) {
        console.error('Profil bilgileri yüklenirken hata:', error);
        loadingElement.style.display = 'none';
        profileContainer.innerHTML = '<p class="error">Profil bilgileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>';
    }
};

// Profil bilgilerini gösterme
const displayProfile = (user) => {
    const profileContainer = document.getElementById('profile-container');
    const profileInfo = document.getElementById('profile-info');
    
    if (profileInfo) {
        profileInfo.innerHTML = `
            <div class="profile-avatar">
                <img src="${user.profilePicture || 'https://via.placeholder.com/150'}" alt="${user.username}">
            </div>
            <div class="profile-details">
                <h2>${user.fullName || user.username}</h2>
                <p class="profile-username">@${user.username}</p>
                ${user.bio ? `<p class="profile-bio">${user.bio}</p>` : ''}
                <div class="profile-stats">
                    <div class="profile-stat">
                        <span class="stat-value" id="topics-count">0</span>
                        <span class="stat-label">Konu</span>
                    </div>
                    <div class="profile-stat">
                        <span class="stat-value" id="comments-count">0</span>
                        <span class="stat-label">Yorum</span>
                    </div>
                </div>
            </div>
        `;
    }
};

// Kullanıcının konularını yükleme
const loadUserTopics = async () => {
    const topicsContainer = document.getElementById('topics-content');
    const topicsCountElement = document.getElementById('topics-count');
    
    try {
        const token = getToken();
        
        if (!token) {
            throw new Error('Oturum süreniz dolmuş');
        }
        
        const response = await fetch(`${API_URL}/users/me/topics`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Konular yüklenirken bir hata oluştu');
        }
        
        const topics = await response.json();
        
        if (topics && topics.length > 0) {
            topicsContainer.innerHTML = '';
            
            topics.forEach(topic => {
                topicsContainer.appendChild(createTopicItem(topic));
            });
            
            if (topicsCountElement) {
                topicsCountElement.textContent = topics.length;
            }
        } else {
            topicsContainer.innerHTML = '<p class="no-content">Henüz konu oluşturmadınız.</p>';
            if (topicsCountElement) {
                topicsCountElement.textContent = '0';
            }
        }
    } catch (error) {
        console.error('Konular yüklenirken hata:', error);
        topicsContainer.innerHTML = '<p class="error">Konular yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>';
    }
};

// Kullanıcının yorumlarını yükleme
const loadUserComments = async () => {
    const commentsContainer = document.getElementById('comments-content');
    const commentsCountElement = document.getElementById('comments-count');
    
    try {
        const token = getToken();
        
        if (!token) {
            throw new Error('Oturum süreniz dolmuş');
        }
        
        const response = await fetch(`${API_URL}/users/me/comments`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Yorumlar yüklenirken bir hata oluştu');
        }
        
        const comments = await response.json();
        
        if (comments && comments.length > 0) {
            commentsContainer.innerHTML = '';
            
            comments.forEach(comment => {
                commentsContainer.appendChild(createCommentItem(comment));
            });
            
            if (commentsCountElement) {
                commentsCountElement.textContent = comments.length;
            }
        } else {
            commentsContainer.innerHTML = '<p class="no-content">Henüz yorum yapmadınız.</p>';
            if (commentsCountElement) {
                commentsCountElement.textContent = '0';
            }
        }
    } catch (error) {
        console.error('Yorumlar yüklenirken hata:', error);
        commentsContainer.innerHTML = '<p class="error">Yorumlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>';
    }
};

// Konu öğesi oluşturma
const createTopicItem = (topic) => {
    const item = document.createElement('div');
    item.className = 'profile-item';
    
    const createdDate = new Date(topic.createdAt).toLocaleDateString('tr-TR');
    
    item.innerHTML = `
        <div class="profile-item-header">
            <h3 class="profile-item-title"><a href="topic-detail.html?id=${topic.id}">${topic.title}</a></h3>
            <div class="profile-item-date">${createdDate}</div>
        </div>
        <div class="profile-item-stats">
            <div class="profile-item-stat">
                <i class="fas fa-comment"></i> ${topic.comments ? topic.comments.length : 0} Yorum
            </div>
            <div class="profile-item-stat">
                <i class="fas fa-eye"></i> ${topic.viewCount || 0} Görüntülenme
            </div>
        </div>
    `;
    
    return item;
};

// Yorum öğesi oluşturma
const createCommentItem = (comment) => {
    const item = document.createElement('div');
    item.className = 'profile-item';
    
    const createdDate = new Date(comment.createdAt).toLocaleDateString('tr-TR');
    const excerpt = comment.content.length > 100 ? comment.content.substring(0, 100) + '...' : comment.content;
    
    item.innerHTML = `
        <div class="profile-item-header">
            <h3 class="profile-item-title"><a href="topic-detail.html?id=${comment.topic.id}">${comment.topic.title}</a></h3>
            <div class="profile-item-date">${createdDate}</div>
        </div>
        <div class="profile-item-content">
            ${excerpt}
        </div>
    `;
    
    return item;
};

// Tab gösterme
const showTab = (tabName) => {
    const topicsTab = document.getElementById('topics-tab');
    const commentsTab = document.getElementById('comments-tab');
    const topicsContent = document.getElementById('topics-content');
    const commentsContent = document.getElementById('comments-content');
    
    if (tabName === 'topics') {
        topicsTab.classList.add('active');
        commentsTab.classList.remove('active');
        topicsContent.style.display = 'block';
        commentsContent.style.display = 'none';
    } else if (tabName === 'comments') {
        topicsTab.classList.remove('active');
        commentsTab.classList.add('active');
        topicsContent.style.display = 'none';
        commentsContent.style.display = 'block';
    }
};

// Profil düzenleme modalını gösterme
const showEditProfileModal = () => {
    const user = getCurrentUser();
    
    if (!user) {
        showAlert('Kullanıcı bilgileri bulunamadı.', 'error');
        return;
    }
    
    // Modal HTML'ini oluştur
    const modalHTML = `
        <div id="edit-profile-modal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Profili Düzenle</h2>
                <div id="edit-profile-alert"></div>
                <form id="edit-profile-form">
                    <div class="form-group">
                        <label for="edit-full-name">Ad Soyad</label>
                        <input type="text" id="edit-full-name" value="${user.fullName || ''}">
                    </div>
                    <div class="form-group">
                        <label for="edit-bio">Hakkımda</label>
                        <textarea id="edit-bio" rows="5">${user.bio || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="edit-profile-picture">Profil Resmi URL</label>
                        <input type="text" id="edit-profile-picture" value="${user.profilePicture || ''}">
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Kaydet</button>
                        <button type="button" class="btn btn-secondary" id="cancel-edit-profile">İptal</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Modal'ı body'ye ekle
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('edit-profile-modal');
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = document.getElementById('cancel-edit-profile');
    const form = document.getElementById('edit-profile-form');
    
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
        updateProfile();
    });
};

// Profil güncelleme
const updateProfile = async () => {
    const fullName = document.getElementById('edit-full-name').value.trim();
    const bio = document.getElementById('edit-bio').value.trim();
    const profilePicture = document.getElementById('edit-profile-picture').value.trim();
    const alertElement = document.getElementById('edit-profile-alert');
    
    try {
        const token = getToken();
        
        if (!token) {
            showAlert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.', 'error', alertElement);
            return;
        }
        
        const response = await fetch(`${API_URL}/users/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                fullName,
                bio,
                profilePicture
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Profil güncellenirken bir hata oluştu');
        }
        
        const updatedUser = await response.json();
        
        // Kullanıcı bilgilerini güncelle
        const currentUser = getCurrentUser();
        currentUser.fullName = updatedUser.fullName;
        currentUser.bio = updatedUser.bio;
        currentUser.profilePicture = updatedUser.profilePicture;
        
        // LocalStorage'ı güncelle
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Modal'ı kapat
        const modal = document.getElementById('edit-profile-modal');
        modal.style.display = 'none';
        modal.remove();
        
        // Profil bilgilerini yeniden yükle
        displayProfile(currentUser);
        
        showAlert('Profil başarıyla güncellendi.', 'success');
    } catch (error) {
        console.error('Profil güncellenirken hata:', error);
        showAlert(error.message || 'Profil güncellenirken bir hata oluştu.', 'error', alertElement);
    }
};

// Uyarı gösterme
const showAlert = (message, type, container = null) => {
    const alertElement = container || document.getElementById('alert');
    
    if (!alertElement) {
        console.error('Alert element bulunamadı');
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