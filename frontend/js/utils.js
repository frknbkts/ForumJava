// Yardımcı fonksiyonlar
console.log('Utils.js: Dosya yükleniyor');

// API URL - global olarak tanımla
window.API_URL = 'http://localhost:8080/api';
console.log('Utils.js: API_URL tanımlandı:', window.API_URL);

// Global değişkenleri kontrol et ve çakışmaları önle
if (typeof window.forumJavaUtils === 'undefined') {
    window.forumJavaUtils = {};
    
    // Tarih formatı
    window.forumJavaUtils.formatDate = function(dateString) {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('tr-TR', options);
    };
    
    // Metin kısaltma
    window.forumJavaUtils.truncateText = function(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };
    
    // URL parametresi alma
    window.forumJavaUtils.getUrlParameter = function(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    };
    
    // Sayfa yükleme göstergesi
    window.forumJavaUtils.showLoading = function(element) {
        if (element) {
            element.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Yükleniyor...</div>';
        }
    };
    
    // Hata mesajı gösterme
    window.forumJavaUtils.showError = function(element, message) {
        if (element) {
            element.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i> ${message}</div>`;
        }
    };
    
    // Boş içerik mesajı gösterme
    window.forumJavaUtils.showEmpty = function(element, message) {
        if (element) {
            element.innerHTML = `<div class="empty"><i class="fas fa-info-circle"></i> ${message}</div>`;
        }
    };
    
    // Uyarı gösterme - global olarak tanımla
    window.showAlert = function(message, type, container = null) {
        console.log(`Utils.js: showAlert çağrıldı - Mesaj: "${message}", Tip: ${type}`);
        const alertElement = container || document.getElementById('topic-alert');
        
        if (!alertElement) {
            console.error('Utils.js: Alert element bulunamadı');
            return;
        }
        
        alertElement.innerHTML = message;
        alertElement.className = `alert alert-${type}`;
        alertElement.style.display = 'block';
        
        // 5 saniye sonra uyarıyı gizle
        setTimeout(function() {
            alertElement.style.display = 'none';
        }, 5000);
    };
    
    // Sayfa başına dön butonu
    window.forumJavaUtils.createBackToTopButton = function() {
        const button = document.createElement('button');
        button.id = 'back-to-top';
        button.innerHTML = '<i class="fas fa-arrow-up"></i>';
        button.title = 'Yukarı Çık';
        
        document.body.appendChild(button);
        
        // Sayfa aşağı kaydırıldığında butonu göster
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                button.classList.add('show');
            } else {
                button.classList.remove('show');
            }
        });
        
        // Butona tıklandığında sayfanın başına dön
        button.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    };
    
    console.log('Utils.js: Yardımcı fonksiyonlar tanımlandı');
}

// Sayfa yüklendiğinde sayfa başına dön butonunu oluştur
document.addEventListener('DOMContentLoaded', function() {
    console.log('Utils.js: DOMContentLoaded event triggered');
    window.forumJavaUtils.createBackToTopButton();
}); 