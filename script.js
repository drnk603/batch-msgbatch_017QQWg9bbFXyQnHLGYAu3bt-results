(function() {
    'use strict';

    if (window.__app) {
        return;
    }

    const app = window.__app = {};
    const initFlags = {};

    function debounce(fn, delay) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                fn.apply(context, args);
            }, delay);
        };
    }

    function throttle(fn, limit) {
        let inThrottle;
        return function() {
            const context = this;
            const args = arguments;
            if (!inThrottle) {
                fn.apply(context, args);
                inThrottle = true;
                setTimeout(function() {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    function initBurgerMenu() {
        if (initFlags.burger) {
            return;
        }
        initFlags.burger = true;

        const nav = document.querySelector('.c-nav#main-nav');
        const toggle = document.querySelector('.c-nav__toggle');
        const body = document.body;

        if (!nav || !toggle) {
            return;
        }

        let isOpen = false;

        function openMenu() {
            isOpen = true;
            nav.classList.add('is-open');
            toggle.setAttribute('aria-expanded', 'true');
            toggle.setAttribute('aria-label', 'Menu sluiten');
            body.classList.add('u-no-scroll');
        }

        function closeMenu() {
            isOpen = false;
            nav.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Menu openen');
            body.classList.remove('u-no-scroll');
        }

        function toggleMenu() {
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        }

        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            toggleMenu();
        });

        const navLinks = document.querySelectorAll('.c-nav__link');
        for (let i = 0; i < navLinks.length; i++) {
            navLinks[i].addEventListener('click', function() {
                if (isOpen) {
                    closeMenu();
                }
            });
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isOpen) {
                closeMenu();
            }
        });

        document.addEventListener('click', function(e) {
            if (isOpen && !nav.contains(e.target) && !toggle.contains(e.target)) {
                closeMenu();
            }
        });

        const resizeHandler = debounce(function() {
            if (window.innerWidth >= 1024 && isOpen) {
                closeMenu();
            }
        }, 200);

        window.addEventListener('resize', resizeHandler);
    }

    function initSmoothScroll() {
        if (initFlags.smoothScroll) {
            return;
        }
        initFlags.smoothScroll = true;

        const isHomepage = window.location.pathname === '/' || 
                          window.location.pathname === '/index.html' || 
                          window.location.pathname.endsWith('/');

        const links = document.querySelectorAll('a[href^="#"]');

        for (let i = 0; i < links.length; i++) {
            (function(link) {
                const href = link.getAttribute('href');
                if (href === '#' || href === '#!') {
                    return;
                }

                if (!isHomepage && href.indexOf('/') === -1) {
                    link.setAttribute('href', '/' + href);
                }

                link.addEventListener('click', function(e) {
                    const targetHref = link.getAttribute('href');
                    let hash = '';

                    if (targetHref.indexOf('#') !== -1) {
                        hash = targetHref.substring(targetHref.indexOf('#'));
                    } else {
                        return;
                    }

                    if (hash === '#' || hash === '#!') {
                        return;
                    }

                    if (targetHref.indexOf('/') === 0 && !isHomepage) {
                        return;
                    }

                    e.preventDefault();

                    const targetId = hash.substring(1);
                    const targetEl = document.getElementById(targetId);

                    if (!targetEl) {
                        return;
                    }

                    const header = document.querySelector('.l-header');
                    const offset = header ? header.offsetHeight : 80;
                    const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;

                    window.scrollTo({
                        top: targetPos,
                        behavior: 'smooth'
                    });

                    if (history.pushState) {
                        history.pushState(null, null, hash);
                    }
                });
            })(links[i]);
        }
    }

    function initScrollSpy() {
        if (initFlags.scrollSpy) {
            return;
        }
        initFlags.scrollSpy = true;

        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.c-nav__link[href^="#"]');

        if (sections.length === 0 || navLinks.length === 0) {
            return;
        }

        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(function(link) {
                        const href = link.getAttribute('href');
                        if (href === '#' + id) {
                            navLinks.forEach(function(l) {
                                l.classList.remove('is-active');
                                l.removeAttribute('aria-current');
                            });
                            link.classList.add('is-active');
                            link.setAttribute('aria-current', 'location');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(function(section) {
            observer.observe(section);
        });
    }

    function initActiveMenu() {
        if (initFlags.activeMenu) {
            return;
        }
        initFlags.activeMenu = true;

        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.c-nav__link:not([href^="#"])');

        for (let i = 0; i < navLinks.length; i++) {
            const link = navLinks[i];
            const linkPath = link.getAttribute('href');

            if (!linkPath) {
                continue;
            }

            let normalizedLinkPath = linkPath;
            if (normalizedLinkPath === '' || normalizedLinkPath === '/') {
                normalizedLinkPath = '/index.html';
            }

            let normalizedCurrentPath = currentPath;
            if (normalizedCurrentPath === '/' || normalizedCurrentPath === '') {
                normalizedCurrentPath = '/index.html';
            }

            if (normalizedLinkPath === normalizedCurrentPath ||
                (normalizedLinkPath === '/' && normalizedCurrentPath === '/index.html') ||
                (normalizedLinkPath === '/index.html' && normalizedCurrentPath === '/')) {
                link.setAttribute('aria-current', 'page');
                link.classList.add('is-active');
            } else {
                link.removeAttribute('aria-current');
                link.classList.remove('is-active');
            }
        }
    }

    function initLazyImages() {
        if (initFlags.lazyImages) {
            return;
        }
        initFlags.lazyImages = true;

        const images = document.querySelectorAll('img');

        for (let i = 0; i < images.length; i++) {
            (function(img) {
                if (!img.hasAttribute('loading')) {
                    const isCritical = img.classList.contains('c-logo__img') || 
                                     img.hasAttribute('data-critical');
                    if (!isCritical) {
                        img.setAttribute('loading', 'lazy');
                    }
                }

                img.addEventListener('error', function() {
                    const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage unavailable%3C/text%3E%3C/svg%3E';
                    img.src = placeholder;
                }, {once: true});
            })(images[i]);
        }
    }

    function initForms() {
        if (initFlags.forms) {
            return;
        }
        initFlags.forms = true;

        const searchForm = document.querySelector('.c-search-bar__form');
        if (searchForm) {
            searchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const destination = document.getElementById('destination');
                const date = document.getElementById('date');
                const travelers = document.getElementById('travelers');

                let hasError = false;

                if (destination && !destination.value.trim()) {
                    hasError = true;
                }
                if (date && !date.value) {
                    hasError = true;
                }
                if (travelers && !travelers.value) {
                    hasError = true;
                }

                if (hasError) {
                    app.notify('Vul alle velden in om te zoeken', 'warning');
                    return;
                }

                app.notify('Zoeken naar beschikbare reizen...', 'info');
            });
        }

        const contactForm = document.getElementById('contact-form-element');
        if (contactForm) {
            const honeypot = document.createElement('input');
            honeypot.type = 'text';
            honeypot.name = 'website';
            honeypot.style.position = 'absolute';
            honeypot.style.left = '-9999px';
            honeypot.setAttribute('tabindex', '-1');
            honeypot.setAttribute('autocomplete', 'off');
            contactForm.appendChild(honeypot);

            let formSubmitTime = Date.now();

            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();

                if (honeypot.value) {
                    return;
                }

                const timeDiff = Date.now() - formSubmitTime;
                if (timeDiff < 3000) {
                    app.notify('Wacht even voordat u het formulier verzendt', 'warning');
                    return;
                }

                const nameField = document.getElementById('name');
                const emailField = document.getElementById('email');
                const phoneField = document.getElementById('phone');
                const messageField = document.getElementById('message');
                const privacyField = document.getElementById('privacy');

                const nameError = document.getElementById('name-error');
                const emailError = document.getElementById('email-error');
                const phoneError = document.getElementById('phone-error');
                const messageError = document.getElementById('message-error');
                const privacyError = document.getElementById('privacy-error');

                let hasError = false;

                const nameGroup = nameField ? nameField.closest('.c-form__group') : null;
                const emailGroup = emailField ? emailField.closest('.c-form__group') : null;
                const phoneGroup = phoneField ? phoneField.closest('.c-form__group') : null;
                const messageGroup = messageField ? messageField.closest('.c-form__group') : null;
                const privacyGroup = privacyField ? privacyField.closest('.c-form__group') : null;

                if (nameGroup) nameGroup.classList.remove('has-error');
                if (emailGroup) emailGroup.classList.remove('has-error');
                if (phoneGroup) phoneGroup.classList.remove('has-error');
                if (messageGroup) messageGroup.classList.remove('has-error');
                if (privacyGroup) privacyGroup.classList.remove('has-error');

                if (nameField && !nameField.value.trim()) {
                    hasError = true;
                    if (nameGroup) nameGroup.classList.add('has-error');
                    if (nameError) nameError.textContent = 'Naam is verplicht';
                } else if (nameField && nameField.value.trim().length < 2) {
                    hasError = true;
                    if (nameGroup) nameGroup.classList.add('has-error');
                    if (nameError) nameError.textContent = 'Naam moet minimaal 2 tekens bevatten';
                }

                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailField && !emailField.value.trim()) {
                    hasError = true;
                    if (emailGroup) emailGroup.classList.add('has-error');
                    if (emailError) emailError.textContent = 'E-mail is verplicht';
                } else if (emailField && !emailPattern.test(emailField.value.trim())) {
                    hasError = true;
                    if (emailGroup) emailGroup.classList.add('has-error');
                    if (emailError) emailError.textContent = 'Voer een geldig e-mailadres in';
                }

                const phonePattern = /^[\+\(\)\d\s\-]{10,20}$/;
                if (phoneField && phoneField.value.trim() && !phonePattern.test(phoneField.value.trim())) {
                    hasError = true;
                    if (phoneGroup) phoneGroup.classList.add('has-error');
                    if (phoneError) phoneError.textContent = 'Voer een geldig telefoonnummer in';
                }

                if (messageField && messageField.value.trim().length < 10) {
                    hasError = true;
                    if (messageGroup) messageGroup.classList.add('has-error');
                    if (messageError) messageError.textContent = 'Bericht moet minimaal 10 tekens bevatten';
                }

                if (privacyField && !privacyField.checked) {
                    hasError = true;
                    if (privacyGroup) privacyGroup.classList.add('has-error');
                    if (privacyError) privacyError.textContent = 'U moet akkoord gaan met het privacy beleid';
                }

                if (hasError) {
                    app.notify('Controleer de formuliervelden op fouten', 'danger');
                    return;
                }

                const submitBtn = contactForm.querySelector('.c-form__submit');
                const originalText = submitBtn ? submitBtn.innerHTML : '';

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.classList.add('is-disabled');
                    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Verzenden...';
                }

                setTimeout(function() {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.classList.remove('is-disabled');
                        submitBtn.innerHTML = originalText;
                    }

                    app.notify('Bedankt voor uw bericht! We nemen zo snel mogelijk contact met u op.', 'success');

                    setTimeout(function() {
                        window.location.href = 'thank_you.html';
                    }, 1500);
                }, 1500);
            });
        }
    }

    function initLanguageSwitcher() {
        if (initFlags.languageSwitcher) {
            return;
        }
        initFlags.languageSwitcher = true;

        const langButtons = document.querySelectorAll('.c-language-switcher__btn');

        for (let i = 0; i < langButtons.length; i++) {
            langButtons[i].addEventListener('click', function() {
                langButtons.forEach(function(btn) {
                    btn.classList.remove('is-active');
                    btn.setAttribute('aria-pressed', 'false');
                });

                this.classList.add('is-active');
                this.setAttribute('aria-pressed', 'true');

                const language = this.textContent.trim();
                app.notify('Taal gewijzigd naar ' + language, 'info');
            });
        }
    }

    function initScrollToTop() {
        if (initFlags.scrollToTop) {
            return;
        }
        initFlags.scrollToTop = true;

        const scrollBtn = document.createElement('button');
        scrollBtn.className = 'c-scroll-to-top';
        scrollBtn.setAttribute('aria-label', 'Terug naar boven');
        scrollBtn.innerHTML = '↑';
        scrollBtn.style.cssText = 'position:fixed;bottom:20px;right:20px;width:48px;height:48px;border-radius:50%;background:var(--color-primary);color:var(--color-bg-primary);border:none;cursor:pointer;opacity:0;visibility:hidden;transition:opacity 0.3s,visibility 0.3s;z-index:999;font-size:24px;display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow-lg);';

        document.body.appendChild(scrollBtn);

        const toggleVisibility = throttle(function() {
            if (window.pageYOffset > 300) {
                scrollBtn.style.opacity = '1';
                scrollBtn.style.visibility = 'visible';
            } else {
                scrollBtn.style.opacity = '0';
                scrollBtn.style.visibility = 'hidden';
            }
        }, 100);

        window.addEventListener('scroll', toggleVisibility);

        scrollBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    function initCountUp() {
        if (initFlags.countUp) {
            return;
        }
        initFlags.countUp = true;

        const statNumbers = document.querySelectorAll('.c-stat__number');

        if (statNumbers.length === 0) {
            return;
        }

        function animateValue(element, start, end, duration) {
            const range = end - start;
            const increment = range / (duration / 16);
            let current = start;

            const timer = setInterval(function() {
                current += increment;
                if (current >= end) {
                    current = end;
                    clearInterval(timer);
                }
                element.textContent = Math.floor(current).toLocaleString('nl-NL');
            }, 16);
        }

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && !entry.target.hasAttribute('data-counted')) {
                    entry.target.setAttribute('data-counted', 'true');
                    const endValue = parseInt(entry.target.textContent.replace(/[^0-9]/g, ''));
                    entry.target.textContent = '0';
                    animateValue(entry.target, 0, endValue, 2000);
                }
            });
        }, observerOptions);

        statNumbers.forEach(function(stat) {
            observer.observe(stat);
        });
    }

    function initModal() {
        if (initFlags.modal) {
            return;
        }
        initFlags.modal = true;

        const privacyLinks = document.querySelectorAll('a[href*="privacy"]');
        
        for (let i = 0; i < privacyLinks.length; i++) {
            const link = privacyLinks[i];
            const href = link.getAttribute('href');
            
            if (href && href.indexOf('#') === -1 && link.classList.contains('c-form__link')) {
                link.addEventListener('click', function(e) {
                    const currentPath = window.location.pathname;
                    const isOnPrivacyPage = currentPath.indexOf('privacy') !== -1;
                    
                    if (!isOnPrivacyPage) {
                        return;
                    }
                });
            }
        }
    }

    app.notify = function(message, type) {
        let container = document.getElementById('toast-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'c-toast c-toast--' + (type || 'info');
        toast.setAttribute('role', 'alert');
        toast.style.cssText = 'min-width:250px;padding:16px 20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);background:#fff;border-left:4px solid;animation:slideIn 0.3s ease-out;';

        const colors = {
            success: '#10b981',
            danger: '#ef4444',
            warning: '#f97316',
            info: '#2563eb'
        };

        toast.style.borderLeftColor = colors[type] || colors.info;
        toast.innerHTML = '<div style="display:flex;align-items:center;gap:12px;"><span style="font-size:14px;color:#374151;">' + message + '</span><button type="button" style="background:none;border:none;font-size:20px;line-height:1;cursor:pointer;color:#9ca3af;padding:0;margin-left:auto;" aria-label="Sluiten">&times;</button></div>';

        const closeBtn = toast.querySelector('button');
        closeBtn.addEventListener('click', function() {
            toast.remove();
        });

        container.appendChild(toast);

        setTimeout(function() {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(function() {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);

        const style = document.getElementById('toast-animations');
        if (!style) {
            const animations = document.createElement('style');
            animations.id = 'toast-animations';
            animations.textContent = '@keyframes slideIn{from{transform:translateX(100%);opacity:0;}to{transform:translateX(0);opacity:1;}}@keyframes slideOut{from{transform:translateX(0);opacity:1;}to{transform:translateX(100%);opacity:0;}}';
            document.head.appendChild(animations);
        }
    };

    app.init = function() {
        initBurgerMenu();
        initSmoothScroll();
        initScrollSpy();
        initActiveMenu();
        initLazyImages();
        initForms();
        initLanguageSwitcher();
        initScrollToTop();
        initCountUp();
        initModal();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', app.init);
    } else {
        app.init();
    }
})();
