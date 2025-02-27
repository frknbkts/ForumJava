// Kayıt sayfası için JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
    if (isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }
    
    // Form gönderimi
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            registerUser();
        });
    }
});

// Kullanıcı kaydı
const registerUser = async () => {
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();
    const alertElement = document.getElementById('alert');
    
    // Form doğrulama
    if (!username || !email || !password || !confirmPassword) {
        showAlert('Lütfen tüm alanları doldurun.', 'error', alertElement);
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Şifreler eşleşmiyor.', 'error', alertElement);
        return;
    }
    
    if (password.length < 6) {
        showAlert('Şifre en az 6 karakter olmalıdır.', 'error', alertElement);
        return;
    }
    
    // Email formatı doğrulama
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('Geçerli bir e-posta adresi girin.', 'error', alertElement);
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Kayıt sırasında bir hata oluştu');
        }
        
        showAlert('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.', 'success', alertElement);
        
        // Giriş sayfasına yönlendir
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    } catch (error) {
        console.error('Kayıt hatası:', error);
        showAlert(error.message || 'Kayıt sırasında bir hata oluştu.', 'error', alertElement);
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