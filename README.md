# TaskFlow 

**Canlı Demo:** (https://task-flow-ashy-one.vercel.app/)  
**Sunum Dosyası:** (./TaskFlow_Sunum.pdf)

TaskFlow, 48 saatlik kısıtlı bir sürede geliştirilmiş, sürükle-bırak (drag & drop) yeteneğine sahip modern bir proje yönetim panosudur. Projede yarım çalışan çok fazla özellik yerine, veritabanı tutarlılığı ve temel sistem performansı ön planda tutulmuştur.

## 🛠 Kullanılan Teknolojiler
* **Arayüz (Frontend):** React, Vite, Tailwind CSS
* **Sürükle-Bırak Motoru:** `@dnd-kit`
* **Veritabanı & Backend:** Supabase
* **Yayınlama (Hosting):** Vercel

## Bilgisayarda Çalıştırma (Kurulum)

Projeyi yerel ortamınızda test etmek için aşağıdaki adımları izleyebilirsiniz:

1. Repoyu bilgisayarınıza indirin:
   ```bash
   git clone [https://github.com/brknatmaca/TaskFlow.git](https://github.com/brknatmaca/TaskFlow.git)

2. Proje klasörüne girin ve gerekli paketleri yükleyin:
    ```cd TaskFlow
   npm install

3. Ana dizinde bir .env dosyası oluşturun ve Supabase bilgilerinizi ekleyin:
   VITE_SUPABASE_URL=kendi_supabase_url_adresiniz
   VITE_SUPABASE_ANON_KEY=kendi_supabase_anon_key_bilginiz

4. Geliştirici sunucusunu başlatın:
   npm run dev  
