// ══════════════════════════════════════════════════
// CMS integration (admin panel via Google Sheets)
// Paste your deployed Apps Script /exec URL below —
// see admin-backend/SETUP.md. Site works fine with this
// left empty; it just skips the dynamic content.
// ══════════════════════════════════════════════════
const CMS_API_URL = "";

async function loadSiteData() {
    if (!CMS_API_URL) return;
    try {
        const res = await fetch(`${CMS_API_URL}?action=data`);
        const data = await res.json();
        if (!data.ok) return;

        // Accent color override
        if (data.settings.accent_color) {
            document.documentElement.style.setProperty('--accent', data.settings.accent_color);
        }

        // Logo image override (falls back to the built-in SVG mark if empty)
        if (data.settings.logo_image_url) {
            document.querySelectorAll('.site-logo-icon').forEach(el => {
                el.innerHTML = `<img src="${data.settings.logo_image_url}" alt="TheStarth" style="width: 45px; height: 45px; object-fit: contain;">`;
            });
        }

        // Announcement banner
        if (String(data.settings.announcement_active).toUpperCase() === 'TRUE' && data.settings.announcement_text) {
            const bar = document.createElement('div');
            bar.id = 'site-announcement';
            bar.style.cssText = 'background: var(--accent); color: #fff; text-align: center; padding: 0.6rem 1rem; font-size: 0.88rem; position: relative; z-index: 1001;';
            const link = data.settings.announcement_link;
            bar.innerHTML = link
                ? `<a href="${link}" style="color: #fff; text-decoration: underline;">${data.settings.announcement_text}</a>`
                : data.settings.announcement_text;
            document.body.prepend(bar);
        }

        // News list (any element with id="news-list")
        const newsWrap = document.getElementById('news-list');
        if (newsWrap && data.news.length) {
            document.getElementById('news').style.display = 'block';
            newsWrap.innerHTML = '';
            data.news
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .forEach(n => {
                    const item = document.createElement('div');
                    item.className = 'news-item';
                    item.style.cssText = 'background: var(--paper); border: 1px solid var(--rule); border-radius: 12px; padding: 1.5rem;';
                    item.innerHTML = `
                        <div style="color: var(--ink-soft); font-size: 0.82rem; margin-bottom: 0.4rem;">${n.date ? new Date(n.date).toLocaleDateString('ru-RU') : ''}</div>
                        <h3 style="margin-bottom: 0.5rem;">${n.title}</h3>
                        <p style="color: var(--ink-soft); line-height: 1.6;">${n.body}</p>
                    `;
                    newsWrap.appendChild(item);
                });
        }

        // Reviews list (any element with id="reviews-list")
        const reviewsWrap = document.getElementById('reviews-list');
        if (reviewsWrap && data.reviews.length) {
            reviewsWrap.innerHTML = '';
            data.reviews.forEach(r => {
                const stars = '★'.repeat(Number(r.rating) || 5);
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <div class="stars">${stars}</div>
                    <p style="margin-bottom: 1rem;">${r.text}</p>
                    <strong>${r.name}</strong>
                `;
                reviewsWrap.appendChild(card);
            });
        }
    } catch (err) {
        console.warn('CMS data failed to load, showing static content instead.', err);
    }
}
loadSiteData();

document.addEventListener('DOMContentLoaded', () => {

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return; // FIX: пропускаем пустые якоря
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Reveal Animations
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-fade');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });
    revealElements.forEach(el => revealObserver.observe(el));

    // Animate numbers
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start) + '+';
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end + '+'; // FIX: гарантированное финальное значение
            }
        };
        window.requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const students = document.getElementById('students-count');
                const certs    = document.getElementById('certs-count');
                const teachers = document.getElementById('teachers-count');
                if (students) { students.innerText = '0+'; animateValue(students, 0, 1200, 2000); }
                if (certs)    { certs.innerText = '0+'; animateValue(certs,    0,  850, 2000); }
                if (teachers) { teachers.innerText = '0+'; animateValue(teachers, 0,   45, 2000); }
                observer.unobserve(entry.target);
            }
        });
    });

    const metricsSection = document.querySelector('.trust-metrics');
    if (metricsSection) observer.observe(metricsSection);

    // Mobile menu
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks     = document.querySelector('.nav-links');
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
        // FIX: закрываем при клике вне меню
        document.addEventListener('click', (e) => {
            if (!mobileToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });
    }

    // Modal — FIX: полная null-проверка
    const modal    = document.getElementById('appModal');
    const closeBtn = document.querySelector('.close-modal');
    const leadForm = document.getElementById('leadForm');

    if (modal && closeBtn) {
        document.querySelectorAll('.open-modal-btn').forEach(btn => {
            btn.addEventListener('click', () => modal.classList.add('show'));
        });
        closeBtn.addEventListener('click', () => modal.classList.remove('show'));
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('show');
        });
        // FIX: закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') modal.classList.remove('show');
        });
        if (leadForm) {
            leadForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Заявка успешно отправлена! Мы свяжемся с вами.');
                modal.classList.remove('show');
                e.target.reset();
            });
        }
    }

    // FAQ — FIX: один открытый вопрос за раз
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(q => {
        q.addEventListener('click', () => {
            faqQuestions.forEach(other => {
                if (other !== q && other.classList.contains('active')) {
                    other.classList.remove('active');
                    other.nextElementSibling.style.maxHeight = '0px';
                }
            });
            q.classList.toggle('active');
            const answer = q.nextElementSibling;
            answer.style.maxHeight = q.classList.contains('active')
                ? answer.scrollHeight + 'px'
                : '0px';
        });
    });

    // Certificate verification
    const verifyBtn  = document.getElementById('verify-cert-btn');
    const certInput  = document.getElementById('cert-input');
    const certResult = document.getElementById('cert-result');

    if (verifyBtn && certInput && certResult) {
        // List of valid certificates
        const validCerts = ['TS-2026-001', 'TS-2026-002', 'TS-2026-003', 'TS-2026-004'];
        
        verifyBtn.addEventListener('click', () => {
            const val = certInput.value.trim().toUpperCase();
            certResult.style.display = 'block';
            if (!val) {
                certResult.style.color = '#e74c3c';
                certResult.innerText   = '⚠️ Введите номер сертификата.';
                return;
            }
            if (validCerts.includes(val)) {
                certResult.style.color = '#25D366';
                certResult.innerText   = '✅ Сертификат подлинный! Выдан: TheStarth.';
            } else {
                certResult.style.color = '#e74c3c';
                certResult.innerText   = '❌ Сертификат не найден в базе данных.';
            }
        });
        // FIX: сброс при новом вводе
        certInput.addEventListener('input', () => {
            certResult.style.display = 'none';
        });
    }

    // --- AUTH LOGIC (Variant A) ---
    const authModal = document.getElementById('authModal');
    const closeAuthModalBtn = document.querySelector('.close-auth-modal');
    const authForm = document.getElementById('authForm');

    function checkAuth() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const authLinks = document.querySelectorAll('.nav-links a[href="dashboard.html"], .nav-links a[href="#"]');
        
        // Update navbar buttons
        authLinks.forEach(link => {
            // Only target the specific dashboard/auth link, not the language toggle
            if(link.classList.contains('lang-btn')) return;
            
            if (link.textContent.includes('Личный кабинет') || link.textContent.includes('Войти')) {
                if (!isLoggedIn) {
                    link.href = "#";
                    link.innerHTML = "Войти <span style='font-size:0.8em; margin-left:5px;'>🔒</span>";
                    link.classList.add('btn-outline');
                    link.onclick = (e) => {
                        e.preventDefault();
                        if(authModal) authModal.style.display = 'block';
                    };
                } else {
                    link.href = "dashboard.html";
                    link.innerHTML = "Личный кабинет";
                    link.onclick = null;
                }
            }
        });
    }

    // Initial check
    checkAuth();

    if (closeAuthModalBtn && authModal) {
        closeAuthModalBtn.onclick = () => authModal.style.display = 'none';
    }
    window.addEventListener('click', (e) => {
        if (authModal && e.target == authModal) {
            authModal.style.display = 'none';
        }
    });

    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = authForm.querySelector('button');
            const originalText = btn.textContent;
            btn.textContent = 'Вход...';
            btn.disabled = true;

            try {
                // Send lead data to Formspree
                await fetch('https://formspree.io/f/mqennban', {
                    method: 'POST',
                    body: new FormData(authForm),
                    headers: { 'Accept': 'application/json' }
                });
                
                localStorage.setItem('isLoggedIn', 'true');
                const formData = new FormData(authForm);
                localStorage.setItem('userName', formData.get('name'));
                if (formData.get('phone')) localStorage.setItem('userPhone', formData.get('phone'));
                if (formData.get('email')) localStorage.setItem('userEmail', formData.get('email'));
                
                authModal.style.display = 'none';
                checkAuth();
                window.location.href = 'dashboard.html';
            } catch (err) {
                btn.textContent = 'Ошибка сети. Попробуйте еще раз';
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }, 3000);
            }
        });
    }

    // Hero no longer uses a canvas animation — replaced with a static score-report visual.
    const steps = document.querySelectorAll('.stepper-item');
    const stepProgressLine = document.getElementById('step-line-progress');
    
    if (steps.length > 0 && stepProgressLine) {
        function updateStepperProgress(activeIndex) {
            const totalSteps = steps.length;
            const percentage = (activeIndex / (totalSteps - 1)) * 100;
            
            // Set vertical progress for mobile, horizontal for desktop
            if (window.innerWidth <= 768) {
                stepProgressLine.style.width = '2px';
                stepProgressLine.style.height = `${percentage}%`;
            } else {
                stepProgressLine.style.height = '2px';
                stepProgressLine.style.width = `${percentage}%`;
            }

            steps.forEach((step, idx) => {
                if (idx <= activeIndex) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
        }

        steps.forEach((step, idx) => {
            step.addEventListener('mouseenter', () => {
                updateStepperProgress(idx);
            });
        });

        // Initialize progress line matching first active step (Step 1 = 0%)
        updateStepperProgress(0);
        
        window.addEventListener('resize', () => {
            const activeStep = document.querySelector('.stepper-item.active:last-of-type');
            if (activeStep) {
                const idx = parseInt(activeStep.getAttribute('data-step')) - 1;
                updateStepperProgress(idx);
            }
        });
    }

    // ── 4. CHAT WIDGET POPUP LOGIC ──
    const chatTrigger = document.getElementById('chatTrigger');
    const chatPopup = document.getElementById('chatPopup');
    
    if (chatTrigger && chatPopup) {
        chatTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            chatPopup.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!chatPopup.contains(e.target) && !chatTrigger.contains(e.target)) {
                chatPopup.classList.remove('show');
            }
        });
    }

    // ── 5. COOKIE CONSENT BANNER LOGIC ──
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptCookiesBtn = document.getElementById('acceptCookiesBtn');

    if (cookieBanner && acceptCookiesBtn) {
        // Display banner after a 2-second delayed entry if not yet accepted
        if (!localStorage.getItem('cookieAccepted')) {
            setTimeout(() => {
                cookieBanner.classList.add('show');
            }, 2000);
        }

        acceptCookiesBtn.addEventListener('click', () => {
            localStorage.setItem('cookieAccepted', 'true');
            cookieBanner.classList.remove('show');
        });
    }

    // ── 6. STARTH LOYALTY & REWARDS SYSTEM ──
    
    // Check quests achievements and mark them completed
    if (localStorage.getItem('levelTestScore') || localStorage.getItem('levelTestCompleted')) {
        const chk = document.getElementById('chk-level-test');
        const item = document.getElementById('quest-level-test');
        if (chk && item) {
            item.classList.add('completed');
        }
    }
    if (localStorage.getItem('quest_telegram_completed')) {
        const chk = document.getElementById('chk-telegram');
        const item = document.getElementById('quest-telegram');
        if (chk && item) {
            item.classList.add('completed');
        }
    }

    // Toast Notification System
    window.showToast = function(message, icon = '✨') {
        const toast = document.getElementById('starth-toast');
        const toastMsg = document.getElementById('starth-toast-message');
        const toastIcon = toast ? toast.querySelector('.starth-toast-icon') : null;
        
        if (!toast || !toastMsg) return;
        
        toastMsg.textContent = message;
        if (toastIcon) toastIcon.textContent = icon;
        
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3500);
    };

    // Pricing Format Switcher
    window.setPricingMode = function(mode) {
        const btnInd = document.getElementById('btn-pricing-ind');
        const btnGrp = document.getElementById('btn-pricing-grp');
        const desc = document.getElementById('pricing-toggle-desc');
        
        if (!btnInd || !btnGrp || !desc) return;
        
        if (mode === 'ind') {
            btnInd.classList.add('active');
            btnGrp.classList.remove('active');
            desc.textContent = "Персональный ментор, 100% внимания преподавателя, гибкий график под ваши цели. Стоимость — $15 за 90‑минутный урок.";
        } else {
            btnGrp.classList.add('active');
            btnInd.classList.remove('active');
            desc.textContent = "Обучение в мини-группах до 3 человек (строго!). Здоровая конкуренция, максимум разговорной практики и командной работы. Стоимость — $12 за урок с ученика.";
        }
        
        // Update price tags
        const priceTrial = document.getElementById('price-trial');
        const priceStandard = document.getElementById('price-standard');
        const priceIntensive = document.getElementById('price-intensive');
        
        if (priceTrial) {
            priceTrial.textContent = priceTrial.getAttribute('data-' + mode);
        }
        if (priceStandard) {
            priceStandard.textContent = priceStandard.getAttribute('data-' + mode);
        }
        if (priceIntensive) {
            priceIntensive.textContent = priceIntensive.getAttribute('data-' + mode);
        }
        
        // Dynamic card context updating
        const trialDesc = document.getElementById('trial-card-desc');
        if (trialDesc) {
            trialDesc.textContent = mode === 'ind' ? 'Оценить уровень и методику (Индивидуально)' : 'Оценить уровень и методику (В мини-группе)';
        }
        
        const trialFeatures = document.getElementById('trial-card-features');
        if (trialFeatures) {
            trialFeatures.innerHTML = mode === 'ind' 
                ? `<li>1 полноценное занятие (90 минут)</li>
                   <li>Диагностика знаний экспертом</li>
                   <li>Индивидуальная траектория</li>`
                : `<li>1 занятие в мини-группе (90 минут)</li>
                   <li>Диагностика уровня Speaking</li>
                   <li>Разговорная практика в группе</li>`;
        }
        
        const standardFeatures = document.getElementById('standard-card-features');
        if (standardFeatures) {
            standardFeatures.innerHTML = mode === 'ind'
                ? `<li>12 занятий в месяц (90 минут каждое)</li>
                   <li>Полный доступ к Telegram-базе</li>
                   <li>Регулярная проверка ДЗ с разбором</li>`
                : `<li>12 занятий в группе (90 минут каждое)</li>
                   <li>Групповая дискуссионная база</li>
                   <li>Совместная подготовка к тестам</li>`;
        }
        
        const intensiveFeatures = document.getElementById('intensive-card-features');
        if (intensiveFeatures) {
            intensiveFeatures.innerHTML = mode === 'ind'
                ? `<li>24 занятия в месяц (максимальный темп)</li>
                   <li>Полное погружение в среду</li>
                   <li>Ежедневный фидбек преподавателей</li>`
                : `<li>24 групповых занятия в месяц</li>
                   <li>Соревновательный эффект лидеров</li>
                   <li>Ежедневные групповые дебаты</li>`;
        }
        
        // Re-calculate active coupon discounts dynamically
        if (window.currentActivePromo) {
            window.applyPromoCode(true);
        }
    };

    // Logout from the personal dashboard
    window.starthLogout = function() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('userPhone');
        localStorage.removeItem('userEmail');
        window.location.href = 'index.html';
    };

    // Referral link generator
    window.generateReferralLink = function() {
        const refId = 'REF_' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const link = window.location.origin + window.location.pathname + '?ref=' + refId;
        
        navigator.clipboard.writeText(link).then(() => {
            window.showToast('Ссылка скопирована! Отправьте её другу для получения 20% скидки', '🤝');
            localStorage.setItem('myReferralLink', link);
        }).catch(err => {
            console.error('Could not copy link: ', err);
            alert('Реферальная ссылка скопирована вручную: ' + link);
        });
    };

    // Quests action triggers
    window.completeTelegramQuest = function(event) {
        const chk = document.getElementById('chk-telegram');
        const item = document.getElementById('quest-telegram');
        if (chk && item) {
            item.classList.add('completed');
            localStorage.setItem('quest_telegram_completed', 'true');
            window.showToast('Квест выполнен! Книга IELTS успешно отправлена в ваш Telegram!', '📘');
        }
    };

    // Interactive Promo Code dynamic calculation box
    window.currentActivePromo = null;
    window.applyPromoCode = function(silent = false) {
        const promoInput = document.getElementById('promo-code-input');
        const feedback = document.getElementById('promo-feedback');
        if (!promoInput || !feedback) return;
        
        const code = promoInput.value.trim().toUpperCase();
        if (!code) {
            if (!silent) {
                feedback.className = 'promo-feedback error';
                feedback.textContent = 'Введите промокод!';
                feedback.style.display = 'block';
            }
            return;
        }
        
        let discountPct = 0;
        let description = '';
        
        if (code === 'FRIEND20') {
            discountPct = 20;
            description = 'Реферальная скидка 20% на следующий месяц!';
        } else if (code === 'START10' || code === 'QUEST10') {
            discountPct = 10;
            description = 'Приветственная скидка 10% за квест!';
        } else if (code === 'GEMINI') {
            discountPct = 15;
            description = 'Эксклюзивная скидка 15% от разработчиков!';
        }
        
        if (discountPct > 0) {
            window.currentActivePromo = { code, discountPct };
            feedback.className = 'promo-feedback success';
            feedback.textContent = `✅ Успешно! ${description}`;
            feedback.style.display = 'block';
            
            if (!silent) {
                window.showToast(`Промокод ${code} на скидку ${discountPct}% успешно применен!`, '🎟️');
            }
            
            // Recompute values
            const priceTrial = document.getElementById('price-trial');
            const priceStandard = document.getElementById('price-standard');
            const priceIntensive = document.getElementById('price-intensive');
            
            const activeMode = document.getElementById('btn-pricing-grp').classList.contains('active') ? 'grp' : 'ind';
            
            if (priceTrial) {
                const origVal = parseFloat(priceTrial.getAttribute('data-' + activeMode));
                const finalVal = Math.round(origVal * (1 - discountPct / 100));
                priceTrial.innerHTML = `<span style="text-decoration: line-through; opacity: 0.5; font-size: 0.75em; margin-right: 5px;">$${origVal}</span>${finalVal}<span class="price-discount-tag">-${discountPct}%</span>`;
            }
            if (priceStandard) {
                const origVal = parseFloat(priceStandard.getAttribute('data-' + activeMode));
                const finalVal = Math.round(origVal * (1 - discountPct / 100));
                priceStandard.innerHTML = `<span style="text-decoration: line-through; opacity: 0.5; font-size: 0.75em; margin-right: 5px;">$${origVal}</span>${finalVal}<span class="price-discount-tag">-${discountPct}%</span>`;
            }
            if (priceIntensive) {
                const origVal = parseFloat(priceIntensive.getAttribute('data-' + activeMode));
                const finalVal = Math.round(origVal * (1 - discountPct / 100));
                priceIntensive.innerHTML = `<span style="text-decoration: line-through; opacity: 0.5; font-size: 0.75em; margin-right: 5px;">$${origVal}</span>${finalVal}<span class="price-discount-tag">-${discountPct}%</span>`;
            }
        } else {
            feedback.className = 'promo-feedback error';
            feedback.textContent = '❌ Неверный или истекший промокод.';
            feedback.style.display = 'block';
            
            // Revert changes if error entered
            window.currentActivePromo = null;
            const activeMode = document.getElementById('btn-pricing-grp').classList.contains('active') ? 'grp' : 'ind';
            window.setPricingMode(activeMode);
        }
    };
});
