// Yeni konu oluşturma sayfası için JavaScript
console.log('New-topic.js: Dosya yükleniyor');

// Sayfa yüklendiğinde çalışacak fonksiyon
document.addEventListener('DOMContentLoaded', function() {
    console.log('New-topic.js: DOMContentLoaded event triggered');
    
    // API_URL tanımlı değilse tanımla
    if (typeof window.API_URL === 'undefined') {
        console.log('New-topic.js: API_URL tanımlı değil, tanımlanıyor');
        window.API_URL = 'http://localhost:8080/api';
    }
    
    // Kullanıcı giriş yapmamışsa ana sayfaya yönlendir
    if (!window.forumJavaAuth || !window.forumJavaAuth.isAuthenticated()) {
        console.log('New-topic.js: Kullanıcı giriş yapmamış, login sayfasına yönlendiriliyor');
        if (window.showAlert) {
            window.showAlert('Konu oluşturmak için giriş yapmalısınız.', 'error');
        } else {
            alert('Konu oluşturmak için giriş yapmalısınız.');
        }
        setTimeout(function() {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    console.log('New-topic.js: Kullanıcı giriş yapmış, form hazırlanıyor');
    
    // Form gönderimi
    const topicForm = document.getElementById('new-topic-form');
    if (topicForm) {
        topicForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('New-topic.js: Form gönderildi, createTopic fonksiyonu çağrılıyor');
            createTopic();
        });
    }
    
    // İptal butonu
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
});

// Yeni konu oluşturma
function createTopic() {
    console.log('New-topic.js: createTopic fonksiyonu başladı');
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const alertElement = document.getElementById('topic-alert');
    
    if (!title || !content) {
        console.log('New-topic.js: Başlık veya içerik boş');
        if (window.showAlert) {
            window.showAlert('Lütfen tüm alanları doldurun.', 'error', alertElement);
        } else if (alertElement) {
            alertElement.textContent = 'Lütfen tüm alanları doldurun.';
            alertElement.style.display = 'block';
        } else {
            alert('Lütfen tüm alanları doldurun.');
        }
        return;
    }
    
    const token = window.forumJavaAuth.getToken();
    
    if (!token) {
        console.log('New-topic.js: Token bulunamadı');
        if (window.showAlert) {
            window.showAlert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.', 'error', alertElement);
        } else if (alertElement) {
            alertElement.textContent = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
            alertElement.style.display = 'block';
        } else {
            alert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        }
        setTimeout(function() {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    console.log('New-topic.js: API isteği gönderiliyor');
    
    fetch(`${window.API_URL}/topics`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            title,
            content
        })
    })
    .then(function(response) {
        console.log('New-topic.js: API yanıtı alındı, status:', response.status);
        if (!response.ok) {
            return response.json().then(function(errorData) {
                console.error('New-topic.js: API hatası:', errorData);
                throw new Error(errorData.message || 'Konu oluşturulurken bir hata oluştu');
            });
        }
        return response.json();
    })
    .then(function(topic) {
        console.log('New-topic.js: Konu başarıyla oluşturuldu:', topic);
        
        if (window.showAlert) {
            window.showAlert('Konu başarıyla oluşturuldu. Konu sayfasına yönlendiriliyorsunuz.', 'success', alertElement);
        } else if (alertElement) {
            alertElement.textContent = 'Konu başarıyla oluşturuldu. Konu sayfasına yönlendiriliyorsunuz.';
            alertElement.className = 'alert alert-success';
            alertElement.style.display = 'block';
        } else {
            alert('Konu başarıyla oluşturuldu. Konu sayfasına yönlendiriliyorsunuz.');
        }
        
        // Konu sayfasına yönlendir
        setTimeout(function() {
            window.location.href = `topic-detail.html?id=${topic.id}`;
        }, 2000);
    })
    .catch(function(error) {
        console.error('New-topic.js: Konu oluşturulurken hata:', error);
        if (window.showAlert) {
            window.showAlert(error.message || 'Konu oluşturulurken bir hata oluştu.', 'error', alertElement);
        } else if (alertElement) {
            alertElement.textContent = error.message || 'Konu oluşturulurken bir hata oluştu.';
            alertElement.className = 'alert alert-danger';
            alertElement.style.display = 'block';
        } else {
            alert(error.message || 'Konu oluşturulurken bir hata oluştu.');
        }
    });
} 