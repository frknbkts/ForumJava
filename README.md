# Forum Java Projesi

Bu proje, kullanıcıların kayıt olup giriş yapabildiği, konular açabildiği ve yorumlar yapabildiği modern bir forum uygulamasıdır. Proje, frontend ve backend olmak üzere iki ana bölümden oluşmaktadır.

## Kullanılan Teknolojiler

### Backend

- **Java 21**: Ana programlama dili
- **Spring Boot**: Web uygulaması geliştirme çerçevesi
- **Spring Security**: Kimlik doğrulama ve yetkilendirme
- **Spring Data JPA**: Veritabanı işlemleri için ORM çözümü
- **JWT (JSON Web Token)**: Kullanıcı oturumlarını yönetmek için
- **Maven**: Bağımlılık yönetimi ve proje yapılandırması
- **Lombok**: Tekrarlayan kod yazımını azaltmak için
- **RESTful API**: Frontend ile iletişim için


## Proje Yapısı

### Backend Yapısı

```
forumjava/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── example/
│   │   │           └── forumjava/
│   │   │               ├── controller/    # REST API endpoint'leri
│   │   │               ├── dto/           # Veri transfer nesneleri
│   │   │               ├── exception/     # Özel hata sınıfları
│   │   │               ├── model/         # Veritabanı varlık sınıfları
│   │   │               ├── repository/    # Veritabanı erişim katmanı
│   │   │               ├── security/      # Güvenlik yapılandırması
│   │   │               ├── service/       # İş mantığı katmanı
│   │   │               └── ForumjavaApplication.java  # Ana uygulama sınıfı
│   │   └── resources/
│   │       ├── application.properties     # Uygulama yapılandırması
│   │       ├── static/                    # Statik dosyalar
│   │       └── templates/                 # Şablonlar (kullanılmıyor)
│   └── test/                              # Test sınıfları
└── pom.xml                                # Maven yapılandırması
```


## API Endpoint'leri

### Kimlik Doğrulama

- `POST /api/auth/register`: Yeni kullanıcı kaydı
- `POST /api/auth/login`: Kullanıcı girişi

### Konular

- `GET /api/topics`: Tüm konuları listele
- `GET /api/topics/{id}`: Belirli bir konuyu getir
- `POST /api/topics`: Yeni konu oluştur
- `PUT /api/topics/{id}`: Konuyu güncelle
- `DELETE /api/topics/{id}`: Konuyu sil
- `POST /api/topics/{id}/view`: Konu görüntüleme sayısını artır
- `GET /api/topics/search?query=`: Konularda arama yap
- `GET /api/topics/user/{userId}`: Kullanıcının konularını getir

### Yorumlar

- `GET /api/comments/topic/{topicId}`: Konuya ait yorumları getir
- `POST /api/comments/topic/{topicId}`: Konuya yorum ekle
- `PUT /api/comments/{id}`: Yorumu güncelle
- `DELETE /api/comments/{id}`: Yorumu sil
- `GET /api/comments/user/{userId}`: Kullanıcının yorumlarını getir

## Kurulum ve Çalıştırma

### Backend

1. Java 21 veya üstü sürümün kurulu olduğundan emin olun
2. Projeyi klonlayın: `git clone [repo-url]`
3. Proje dizinine gidin: `cd forumjava`
4. Maven ile projeyi derleyin: `./mvnw clean install`
5. Uygulamayı çalıştırın: `./mvnw spring-boot:run`
6. Backend http://localhost:8080 adresinde çalışacaktır


## Güvenlik Özellikleri

- JWT tabanlı kimlik doğrulama
- Şifre hashleme (BCrypt)
- CORS yapılandırması
- CSRF koruması
- Rol tabanlı yetkilendirme
