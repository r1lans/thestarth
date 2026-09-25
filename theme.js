/* TheStarth — light / dark theme.
 *
 * Loaded in <head> of every page so the saved theme is applied BEFORE the
 * first paint (no white flash on dark). The toggle button is injected into
 * the navbar automatically, so pages don't need any extra markup.
 *
 * Order of choice: saved choice (localStorage) -> system preference -> light.
 */
(function () {
    var KEY = 'starthTheme';
    var root = document.documentElement;

    function readSaved() {
        try { var v = localStorage.getItem(KEY); return (v === 'dark' || v === 'light') ? v : null; }
        catch (e) { return null; }
    }
    function systemTheme() {
        return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }
    function current() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }

    function apply(theme) {
        root.setAttribute('data-theme', theme);
        var meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', 'theme-color');
            (document.head || root).appendChild(meta);
        }
        meta.setAttribute('content', theme === 'dark' ? '#12141A' : '#FAF9F5');
        document.querySelectorAll('.theme-toggle').forEach(function (b) {
            b.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        });
    }

    apply(readSaved() || systemTheme());

    var SUN = '<svg class="ti-sun" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    var MOON = '<svg class="ti-moon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>';

    function makeButton(extraClass) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'theme-toggle ' + (extraClass || '');
        b.setAttribute('aria-label', 'Переключить тему / Toggle theme');
        b.setAttribute('title', 'Светлая / тёмная тема');
        b.setAttribute('aria-pressed', current() === 'dark' ? 'true' : 'false');
        b.innerHTML = SUN + MOON;
        b.addEventListener('click', toggle);
        return b;
    }

    function toggle() {
        var next = current() === 'dark' ? 'light' : 'dark';
        // short-lived class -> smooth colour transition only while switching
        root.classList.add('theme-anim');
        apply(next);
        try { localStorage.setItem(KEY, next); } catch (e) {}
        setTimeout(function () { root.classList.remove('theme-anim'); }, 350);
    }

    function inject() {
        var container = document.querySelector('.nav-container');
        var links = document.querySelector('.nav-links');

        if (!container) {
            // pages without a navbar (e.g. admin panel): small floating button
            document.body.appendChild(makeButton('theme-toggle--floating'));
            return;
        }

        // Some pages have a nav menu but no burger button, so on phones the menu
        // could never be opened. Add one (only where app.js isn't already wiring it).
        var burger = container.querySelector('.mobile-toggle');
        if (links && !burger) {
            burger = document.createElement('button');
            burger.type = 'button';
            burger.className = 'mobile-toggle';
            burger.setAttribute('aria-label', 'Меню');
            burger.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
            container.insertBefore(burger, links);
            if (!document.querySelector('script[src*="app.js"]')) {
                burger.addEventListener('click', function (e) { e.stopPropagation(); links.classList.toggle('active'); });
                document.addEventListener('click', function (e) {
                    if (!links.contains(e.target) && !burger.contains(e.target)) links.classList.remove('active');
                });
            }
        }

        if (links) {
            // desktop: inside the menu, after the language switch
            links.appendChild(makeButton('theme-toggle--inline'));
            // mobile: always visible next to the burger
            container.insertBefore(makeButton('theme-toggle--mobile'), burger || links);
        } else {
            container.appendChild(makeButton(''));
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
    else inject();

    // keep several open tabs in sync
    window.addEventListener('storage', function (e) {
        if (e.key === KEY && (e.newValue === 'dark' || e.newValue === 'light')) apply(e.newValue);
    });
    // follow the system theme live, but only until the visitor picks one manually
    if (window.matchMedia) {
        var mq = window.matchMedia('(prefers-color-scheme: dark)');
        var onChange = function (e) { if (!readSaved()) apply(e.matches ? 'dark' : 'light'); };
        if (mq.addEventListener) mq.addEventListener('change', onChange);
        else if (mq.addListener) mq.addListener(onChange);
    }

    window.StarthTheme = { toggle: toggle, get: current, set: function (t) { apply(t); try { localStorage.setItem(KEY, t); } catch (e) {} } };
})();
