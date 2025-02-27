// Auth.js - Kimlik doğrulama işlemleri
console.log('Auth.js: Dosya yükleniyor');

// Global değişkenleri kontrol et ve çakışmaları önle
if (typeof window.forumJavaAuth === 'undefined') {
    window.forumJavaAuth = {};
    
    // Token alma fonksiyonu
    window.forumJavaAuth.getToken = function() {
        return localStorage.getItem('token');
    };
    
    // Kullanıcı bilgilerini alma fonksiyonu
    window.forumJavaAuth.getCurrentUser = function() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    };
    
    // Kimlik doğrulama durumunu kontrol etme
    window.forumJavaAuth.isAuthenticated = function() {
        const token = window.forumJavaAuth.getToken();
        const user = window.forumJavaAuth.getCurrentUser();
        return !!(token && user);
    };
    
    // Kimlik doğrulama durumunu kontrol etme ve UI'ı güncelleme
    window.forumJavaAuth.checkAuth = function() {
        const authenticated = window.forumJavaAuth.isAuthenticated();
        
        if (authenticated) {
            document.body.classList.add('is-authenticated');
        } else {
            document.body.classList.remove('is-authenticated');
        }
        
        return authenticated;
    };
    
    // Giriş işlemi
    window.forumJavaAuth.login = function() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const alertElement = document.getElementById('login-alert');
        
        if (!username || !password) {
            if (alertElement) {
                alertElement.textContent = "Kullanıcı adı ve şifre gereklidir.";
                alertElement.style.display = 'block';
            }
            return;
        }
        
        console.log('Auth.js: Giriş isteği gönderiliyor');
        
        fetch(`${window.API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(function(response) {
            console.log('Auth.js: Giriş yanıtı alındı, status:', response.status);
            if (!response.ok) {
                return response.json().then(function(errorData) {
                    throw new Error(errorData.message || 'Giriş yapılırken bir hata oluştu');
                });
            }
            return response.json();
        })
        .then(function(data) {
            console.log('Auth.js: Giriş başarılı, veri:', data);
            if (!data.token) {
                throw new Error(data.message || 'Giriş yapılırken bir hata oluştu');
            }
            
            // Token ve kullanıcı bilgilerini kaydet
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                id: data.userId,
                username: data.username
            }));
            
            // Ana sayfaya yönlendir
            window.location.href = 'index.html';
        })
        .catch(function(error) {
            console.error('Auth.js: Giriş hatası:', error);
            if (alertElement) {
                alertElement.textContent = error.message || 'Giriş yapılırken bir hata oluştu';
                alertElement.style.display = 'block';
            }
        });
    };
    
    // Kayıt işlemi
    window.forumJavaAuth.register = function() {
        const fullName = document.getElementById('fullName').value;
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const alertElement = document.getElementById('register-alert');
        
        if (!fullName || !username || !email || !password) {
            if (alertElement) {
                alertElement.textContent = "Tüm alanları doldurun.";
                alertElement.style.display = 'block';
            }
            return;
        }
        
        console.log('Auth.js: Kayıt isteği gönderiliyor');
        
        fetch(`${window.API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fullName, username, email, password })
        })
        .then(function(response) {
            console.log('Auth.js: Kayıt yanıtı alındı, status:', response.status);
            if (!response.ok) {
                return response.json().then(function(errorData) {
                    throw new Error(errorData.message || 'Kayıt olurken bir hata oluştu');
                });
            }
            return response.json();
        })
        .then(function(data) {
            console.log('Auth.js: Kayıt başarılı, veri:', data);
            if (!data.token) {
                throw new Error(data.message || 'Kayıt olurken bir hata oluştu');
            }
            
            // Token ve kullanıcı bilgilerini kaydet
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                id: data.userId,
                username: data.username
            }));
            
            // Ana sayfaya yönlendir
            window.location.href = 'index.html';
        })
        .catch(function(error) {
            console.error('Auth.js: Kayıt hatası:', error);
            if (alertElement) {
                alertElement.textContent = error.message || 'Kayıt olurken bir hata oluştu';
                alertElement.style.display = 'block';
            }
        });
    };
    
    // Çıkış işlemi
    window.forumJavaAuth.logout = function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.forumJavaAuth.checkAuth();
        window.location.href = 'index.html';
    };
    
    // API istekleri için yardımcı fonksiyon
    window.forumJavaAuth.fetchWithAuth = function(url, options = {}) {
        const token = window.forumJavaAuth.getToken();
        
        if (!options.headers) {
            options.headers = {};
        }
        
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        options.headers['Content-Type'] = 'application/json';
        
        return fetch(url, options)
            .then(function(response) {
                if (response.status === 401) {
                    // Token geçersiz, çıkış yap
                    window.forumJavaAuth.logout();
                    throw new Error('Oturum süresi doldu, lütfen tekrar giriş yapın');
                }
                return response;
            })
            .catch(function(error) {
                console.error('API isteği başarısız:', error);
                throw error;
            });
    };
    
    console.log('Auth.js: Kimlik doğrulama fonksiyonları tanımlandı');
}

// Sayfa yüklendiğinde kimlik doğrulama durumunu kontrol et
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth.js: DOMContentLoaded event triggered');
    window.forumJavaAuth.checkAuth();
    
    // Çıkış yapma butonu
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.forumJavaAuth.logout();
        });
    }
    
    // Giriş formu
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            window.forumJavaAuth.login();
        });
    }
    
    // Kayıt formu
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            window.forumJavaAuth.register();
        });
    }
}); 