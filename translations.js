// Real static translations — replaces the unreliable Google Translate
// widget. Add more keys here as more pages get translated; anything
// without a data-i18n tag on the page just stays in Russian (the
// language the site is authored in).
const TRANSLATIONS = {
    ru: {
        'nav.courses': 'Курсы',
        'nav.about': 'О нас',
        'nav.results': 'Результаты',
        'nav.news': 'Новости',
        'nav.payment': 'Оплата',
        'nav.dashboard': 'Личный кабинет',
        'nav.login': 'Войти',

        'footer.tagline': 'Платформа развития навыков. Английский и математика.',
        'footer.quicklinks': 'Быстрые ссылки',
        'footer.courses': 'Курсы',
        'footer.about': 'О нас',
        'footer.careers': 'Вакансии',
        'footer.news': 'Новости',
        'footer.contacts': 'Контакты',
        'footer.copyright': '© 2026 TheStarth. Все права защищены.',

        'hero.title_pre': 'Подготовка к',
        'hero.title_highlight': 'IELTS',
        'hero.title_post': ', SAT и математике',
        'hero.lede': 'Небольшие группы, преподаватели с собственным баллом IELTS 8.0+ и понятный план до результата — обычно 3–4 месяца до нужного балла.',
        'hero.cta_primary': 'Записаться на пробный урок',
        'hero.cta_secondary': 'Пройти тест уровня',
        'hero.trust_students': 'учеников',
        'hero.trust_certs': 'сертификатов',
        'hero.trust_teachers': 'преподавателей',

        'section.courses': 'Наши',
        'section.courses_highlight': 'Курсы',
        'section.reviews': 'Отзывы',
        'section.reviews_highlight': 'Учеников',
        'section.news': 'Новости',
        'section.news_highlight': 'и объявления'
    },
    uz: {
        'nav.courses': 'Kurslar',
        'nav.about': 'Biz haqimizda',
        'nav.results': 'Natijalar',
        'nav.news': 'Yangiliklar',
        'nav.payment': "To'lov",
        'nav.dashboard': 'Shaxsiy kabinet',
        'nav.login': 'Kirish',

        'footer.tagline': "Ko'nikmalarni rivojlantirish platformasi. Ingliz tili va matematika.",
        'footer.quicklinks': 'Tezkor havolalar',
        'footer.courses': 'Kurslar',
        'footer.about': 'Biz haqimizda',
        'footer.careers': "Bo'sh ish o'rinlari",
        'footer.news': 'Yangiliklar',
        'footer.contacts': 'Aloqa',
        'footer.copyright': '© 2026 TheStarth. Barcha huquqlar himoyalangan.',

        'hero.title_pre': '',
        'hero.title_highlight': 'IELTS',
        'hero.title_post': ", SAT va matematikaga tayyorgarlik",
        'hero.lede': "Kichik guruhlar, IELTS balli 8.0+ bo'lgan o'qituvchilar va natijaga aniq reja — odatda kerakli ballgacha 3–4 oy.",
        'hero.cta_primary': 'Sinov darsiga yozilish',
        'hero.cta_secondary': 'Daraja testini topshirish',
        'hero.trust_students': "o'quvchi",
        'hero.trust_certs': 'sertifikat',
        'hero.trust_teachers': "o'qituvchi",

        'section.courses': 'Bizning',
        'section.courses_highlight': 'kurslarimiz',
        'section.reviews': "O'quvchilar",
        'section.reviews_highlight': 'fikrlari',
        'section.news': 'Yangiliklar',
        'section.news_highlight': 'va e\'lonlar'
    },
    en: {
        'nav.courses': 'Courses',
        'nav.about': 'About',
        'nav.results': 'Results',
        'nav.news': 'News',
        'nav.payment': 'Payment',
        'nav.dashboard': 'Dashboard',
        'nav.login': 'Log in',

        'footer.tagline': 'A skills-development platform. English and Math.',
        'footer.quicklinks': 'Quick Links',
        'footer.courses': 'Courses',
        'footer.about': 'About',
        'footer.careers': 'Careers',
        'footer.news': 'News',
        'footer.contacts': 'Contact',
        'footer.copyright': '© 2026 TheStarth. All rights reserved.',

        'hero.title_pre': 'Preparation for',
        'hero.title_highlight': 'IELTS',
        'hero.title_post': ', SAT and Math',
        'hero.lede': 'Small groups, teachers with their own IELTS band 8.0+, and a clear plan to your result — usually 3–4 months to the score you need.',
        'hero.cta_primary': 'Book a trial lesson',
        'hero.cta_secondary': 'Take the level test',
        'hero.trust_students': 'students',
        'hero.trust_certs': 'certificates',
        'hero.trust_teachers': 'teachers',

        'section.courses': 'Our',
        'section.courses_highlight': 'Courses',
        'section.reviews': 'Student',
        'section.reviews_highlight': 'Reviews',
        'section.news': 'News',
        'section.news_highlight': '& Announcements'
    }
};

function applyTranslations(lang) {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.ru;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key] !== undefined) el.textContent = dict[key];
    });
    document.documentElement.lang = lang;
    localStorage.setItem('starthLang', lang);

    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll(`.lang-btn[onclick*="'${lang}'"]`).forEach(btn => btn.classList.add('active'));
}

function changeLanguage(langCode) {
    applyTranslations(langCode);
}

// Apply the saved language choice as soon as the page's DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('starthLang') || 'ru';
    applyTranslations(saved);
});
