# TaskFlow 

**Canlı Demo:** (https://task-flow-ashy-one.vercel.app/)  
**Sunum Dosyası:** [TaskFlow_Sunum.pdf](./TaskFlow_Sunum.pdf)

TaskFlow, 48 saatlik kısıtlı bir sürede geliştirilmiş, sürükle-bırak (drag & drop) yeteneğine sahip modern bir proje yönetim panosudur. Projede yarım çalışan çok fazla özellik yerine, veritabanı tutarlılığı ve temel sistem performansı ön planda tutulmuştur.

## 🛠 Kullanılan Teknolojiler
* **Arayüz (Frontend):** React, Vite, Tailwind CSS
* **Sürükle-Bırak Motoru:** `@dnd-kit`
* **Veritabanı & Backend:** Supabase
* **Yayınlama (Hosting):** Vercel

## Bilgisayarda Çalıştırma (Kurulum)

Projeyi yerel ortamınızda test etmek için aşağıdaki adımları izleyebilirsiniz:

1. Repoyu bilgisayarınıza indirin ve proje klasörüne girin:
```Bash
git clone https://github.com/brknatmaca/TaskFlow.git
cd TaskFlow
npm install
```

2. Ana dizinde bir .env dosyası oluşturun ve Supabase bilgilerinizi ekleyin:
```Kod snippet'i
VITE_SUPABASE_URL=kendi_supabase_url_adresiniz
VITE_SUPABASE_ANON_KEY=kendi_supabase_anon_key_bilginiz
```

3. Geliştirici sunucusunu başlatın:
```Bash
npm run dev
```

