export type Locale = "en" | "uz" | "ru";

export const translations = {
    en: {
        nav: {
            dashboard: "Dashboard",
            ads: "Announcements",
            admin: "Admin Panel",
            logout: "Logout",
            login: "Login",
            register: "Register"
        },
        hero: {
            badge: "The Ultimate Testing Platform",
            title: "Elevate Your Learning with",
            subtitle: "A production-ready platform for conducting and management of online tests. Powerful analytics, real-time results, and an advanced admin panel.",
            getStarted: "Get Started",
            signIn: "Sign In",
            goDashboard: "Go to Dashboard"
        },
        features: {
            subjects: { title: "Multiple Subjects", desc: "Wide range of topics to test your knowledge" },
            secure: { title: "Secure & Fair", desc: "Advanced protection against cheating" },
            stats: { title: "Deep Analytics", desc: "Detailed statistics for every test attempt" }
        },
        dashboard: {
            title: "Choose a Subject",
            subtitle: "Select a subject to start your proficiency test",
            startTest: "Start Test",
            noSubjects: "No subjects available yet",
            checkBack: "Please check back later or contact the administrator."
        },
        footer: {
            desc: "The ultimate platform for online testing and knowledge assessment. Empowering learners and educators with powerful analytics and seamless experience.",
            platform: "Platform",
            support: "Support",
            rights: "All rights reserved."
        },
        auth: {
            welcomeBack: "Welcome Back",
            createAccount: "Create Account",
            email: "Email Address",
            password: "Password",
            signIn: "Sign In",
            register: "Register",
            haveAccount: "Already have an account?",
            noAccount: "Don't have an account?"
        },
        adsPage: {
            subtitle: "Stay updated with the latest news and announcements from 3-IDUM TTM.",
            readMore: "Read more",
            noAds: "No announcements found",
            noAdsDesc: "We'll post important updates and news here. Check back soon!",
            close: "Close"
        },
        common: {
            welcomeBack: "Welcome back!",
            accountCreated: "Account created successfully!",
            error: "An error occurred",
            loading: "Loading...",
            success: "Success"
        },
        adminAds: {
            title: "Announcements",
            subtitle: "Manage site-wide advertisements and announcements (Superadmin only)",
            newAd: "New Announcement",
            adTitle: "Title",
            adContent: "Content",
            placeholderTitle: "e.g., Important Update",
            placeholderContent: "Announcement details...",
            publish: "Publish",
            noAds: "No announcements yet",
            confirmDelete: "Are you sure you want to delete this announcement?",
            deleted: "Announcement deleted",
            added: "Announcement added successfully",
            fillFields: "Please fill all fields"
        },
        adminNav: {
            overview: "Overview",
            subjects: "Subjects",
            tests: "Tests",
            users: "Users",
            statistics: "Statistics",
            announcements: "Announcements",
            menu: "Admin Menu",
            superAdminMode: "Super Admin Mode"
        }
    },
    uz: {
        nav: {
            dashboard: "Boshqaruv paneli",
            ads: "E'lonlar",
            admin: "Admin paneli",
            logout: "Chiqish",
            login: "Kirish",
            register: "Ro'yxatdan o'tish"
        },
        hero: {
            badge: "Eng yaxshi test platformasi",
            title: "Bilimingizni oshiring:",
            subtitle: "Onlayn testlarni o'tkazish va boshqarish uchun tayyor platforma. Kuchli tahlil, real vaqtda natijalar va ilg'or admin paneli.",
            getStarted: "Boshlash",
            signIn: "Kirish",
            goDashboard: "Panelga o'tish"
        },
        features: {
            subjects: { title: "Ko'plab fanlar", desc: "Bilimingizni sinash uchun keng qamrovli mavzular" },
            secure: { title: "Xavfsiz va adolatli", desc: "Nohaqchilikdan himoya qilishning ilg'or usullari" },
            stats: { title: "Chuqur tahlil", desc: "Har bir test urinishi uchun batafsil statistika" }
        },
        dashboard: {
            title: "Fanni tanlang",
            subtitle: "Bilimingizni sinashni boshlash uchun fan tanlang",
            startTest: "Testni boshlash",
            noSubjects: "Hozircha fanlar mavjud emas",
            checkBack: "Iltimos, keyinroq qayta urunib ko'ring yoki administrator bilan bog'laning."
        },
        footer: {
            desc: "Onlayn test va bilimni baholash bo'yicha eng yaxshi platforma. O'quvchilar va o'qituvchilar uchun kuchli tahlil va qulayliklar.",
            platform: "Platforma",
            support: "Yordam",
            rights: "Barcha huquqlar himoyalangan."
        },
        auth: {
            welcomeBack: "Xush kelibsiz",
            createAccount: "Hisob yaratish",
            email: "Email manzili",
            password: "Parol",
            signIn: "Kirish",
            register: "Ro'yxatdan o'tish",
            haveAccount: "Hisobingiz bormi?",
            noAccount: "Hisobingiz yo'qmi?"
        },
        adsPage: {
            subtitle: "3-IDUM TTM bilan bog'liq so'nggi yangiliklar va e'lonlardan xabardor bo'ling.",
            readMore: "Batafsil ma'lumot",
            noAds: "E'lonlar topilmadi",
            noAdsDesc: "Hozircha hech qanday e'lon mavjud emas. Yangiliklarni kutib qoling!",
            close: "Yopish"
        },
        common: {
            welcomeBack: "Xush kelibsiz!",
            accountCreated: "Hisob muvaffaqiyatli yaratildi!",
            error: "Xatolik yuz berdi",
            loading: "Yuklanmoqda...",
            success: "Muvaffaqiyatli"
        },
        adminAds: {
            title: "E'lonlar",
            subtitle: "Sayt bo'ylab e'lonlarni boshqarish (Faqat Superadmin)",
            newAd: "Yangi e'lon",
            adTitle: "Sarlavha",
            adContent: "Mazmuni",
            placeholderTitle: "Masalan: Muhim yangilanish",
            placeholderContent: "E'lon tafsilotlari...",
            publish: "Chop etish",
            noAds: "Hozircha e'lonlar yo'q",
            confirmDelete: "Ushbu e'lonni o'chirib tashlamoqchimisiz?",
            deleted: "E'lon o'chirildi",
            added: "E'lon muvaffaqiyatli qo'shildi",
            fillFields: "Iltimos, barcha maydonlarni to'ldiring"
        },
        adminNav: {
            overview: "Umumiy ko'rinish",
            subjects: "Fanlar",
            tests: "Testlar",
            users: "Foydalanuvchilar",
            statistics: "Statistika",
            announcements: "E'lonlar",
            menu: "Admin menyusi",
            superAdminMode: "Super Admin rejimi"
        }
    },
    ru: {
        nav: {
            dashboard: "Панель",
            ads: "Объявления",
            admin: "Админ-панель",
            logout: "Выйти",
            login: "Войти",
            register: "Регистрация"
        },
        hero: {
            badge: "Лучшая платформа для тестирования",
            title: "Повышайте свои знания с",
            subtitle: "Готовая платформа для проведения и управления онлайн-тестами. Мощная аналитика, результаты в реальном времени и продвинутая админ-панель.",
            getStarted: "Начать",
            signIn: "Войти",
            goDashboard: "В панель управления"
        },
        features: {
            subjects: { title: "Множество предметов", desc: "Широкий спектр тем для проверки ваших знаний" },
            secure: { title: "Безопасно и честно", desc: "Продвинутая защита от мошенничества" },
            stats: { title: "Глубокая аналитика", desc: "Подробная статистика для каждой попытки теста" }
        },
        dashboard: {
            title: "Выберите предмет",
            subtitle: "Выберите предмет, чтобы начать тест",
            startTest: "Начать тест",
            noSubjects: "Предметы пока не доступны",
            checkBack: "Пожалуйста, зайдите позже или свяжитесь с администратором."
        },
        footer: {
            desc: "Лучшая платформа для онлайн-тестирования и оценки знаний. Мощная аналитика и безупречный опыт для учащихся и преподавателей.",
            platform: "Платформа",
            support: "Поддержка",
            rights: "Все права защищены."
        },
        auth: {
            welcomeBack: "С возвращением",
            createAccount: "Создать аккаунт",
            email: "Электронная почта",
            password: "Пароль",
            signIn: "Войти",
            register: "Регистрация",
            haveAccount: "Уже есть аккаунт?",
            noAccount: "Нет аккаунта?"
        },
        adsPage: {
            subtitle: "Будьте в курсе последних новостей и объявлений от 3-IDUM TTM.",
            readMore: "Подробнее",
            noAds: "Объявлений не найдено",
            noAdsDesc: "Мы будем публиковать важные обновления и новости здесь. Заходите позже!",
            close: "Закрыть"
        },
        common: {
            welcomeBack: "С возвращением!",
            accountCreated: "Аккаунт успешно создан!",
            error: "Произошла ошибка",
            loading: "Загрузка...",
            success: "Успешно"
        },
        adminAds: {
            title: "Объявления",
            subtitle: "Управление объявлениями на всем сайте (Только для суперадмина)",
            newAd: "Новое объявление",
            adTitle: "Заголовок",
            adContent: "Содержание",
            placeholderTitle: "Например: Важное обновление",
            placeholderContent: "Детали объявления...",
            publish: "Опубликовать",
            noAds: "Объявлений пока нет",
            confirmDelete: "Вы уверены, что хотите удалить это объявление?",
            deleted: "Объявление удалено",
            added: "Объявление успешно добавлено",
            fillFields: "Пожалуйста, заполните все поля"
        },
        adminNav: {
            overview: "Обзор",
            subjects: "Предметы",
            tests: "Тесты",
            users: "Пользователи",
            statistics: "Статистика",
            announcements: "Объявления",
            menu: "Меню админа",
            superAdminMode: "Режим Суперадмина"
        }
    }
};
