(function () {
  var CACHE_KEY = 'md-blog-counts-v3';
  var TTL = 6 * 60 * 60 * 1000;

  function scopeHref() {
    try { return window.__md_scope ? window.__md_scope.href : location.href; }
    catch (e) { return location.href; }
  }

  function blogIndexUrl() {
    var links = document.querySelectorAll('.md-nav--primary a.md-nav__link');
    for (var i = 0; i < links.length; i++) {
      var h = links[i].getAttribute('href') || '';
      if (!h || h === '#') continue;
      try {
        var u = new URL(h, location.href);
        if (/\/blog\/?$/.test(u.pathname)) return u.href;
      } catch (e) {}
    }
    return new URL('blog/', scopeHref()).href;
  }

  function isTagsPage() {
    return /\/tags\/?(index\.html)?$/.test(location.pathname.replace(/\/$/, '/'));
  }

  function resolvedPath(href) {
    try { return new URL(href, location.href).pathname; }
    catch (e) { return ''; }
  }

  function addBadge(a, n) {
    if (a.querySelector('.md-count-badge')) return;
    var badge = document.createElement('span');
    badge.className = 'md-count-badge';
    badge.textContent = n;
    a.appendChild(badge);
  }

  function blogIndexPath() {
    var links = document.querySelectorAll('.md-nav--primary a.md-nav__link');
    for (var i = 0; i < links.length; i++) {
      var h = links[i].getAttribute('href') || '';
      if (!h || h === '#') continue;
      var p = resolvedPath(h);
      if (/\/blog\/?$/.test(p)) return p.replace(/\/?$/, '/');
    }
    return '';
  }

  function applyCounts(data) {
    var blogPath = blogIndexPath();
    document.querySelectorAll('a.md-nav__link').forEach(function (a) {
      if (a.querySelector('.md-count-badge')) return;
      var href = a.getAttribute('href') || '';
      if (!href || href === '#' || href.charAt(0) === '#') return;
      var p = resolvedPath(href);
      if (!p) return;
      var mc = p.match(/\/category\/([^\/?#]+)\/?$/);
      if (mc) { var n = data.categories[decodeURIComponent(mc[1])]; if (n !== undefined) addBadge(a, n); return; }
      var ma = p.match(/\/archive\/([^\/?#]+)\/?$/);
      if (ma) { var n2 = data.archives[decodeURIComponent(ma[1])]; if (n2 !== undefined) addBadge(a, n2); return; }
      if (blogPath && p.replace(/\/?$/, '/') === blogPath) { if (data.total !== undefined) addBadge(a, data.total); }
    });
  }

  function parseCounts(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var categories = {};
    var archives = {};
    var total = 0;
    doc.querySelectorAll('article.md-post').forEach(function (art) {
      total++;
      var seen = {};
      art.querySelectorAll('a.md-meta__link').forEach(function (a) {
        var h = a.getAttribute('href') || '';
        var hh = resolvedPath(h);
        var m = hh.match(/\/category\/([^\/?#]+)\/?$/);
        if (!m) return;
        var slug = decodeURIComponent(m[1]);
        if (seen[slug]) return;
        seen[slug] = 1;
        categories[slug] = (categories[slug] || 0) + 1;
      });
      var t = art.querySelector('time[datetime]');
      if (t) {
        var mm = (t.getAttribute('datetime') || '').match(/^(\d{4}-\d{2})/);
        if (mm) archives[mm[1]] = (archives[mm[1]] || 0) + 1;
      }
    });
    return { categories: categories, archives: archives, total: total };
  }

  function loadCounts() {
    var cached;
    try {
      cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    } catch (e) { cached = null; }
    var now = Date.now();
    if (cached && cached.ts && (now - cached.ts) < TTL && cached.data) {
      return Promise.resolve(cached.data);
    }
    return fetch(blogIndexUrl(), { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.text() : ''; })
      .then(function (html) {
        if (!html) return { categories: {}, archives: {}, total: 0 };
        var data = parseCounts(html);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: now, data: data })); }
        catch (e) {}
        return data;
      })
      .catch(function () { return { categories: {}, archives: {}, total: 0 }; });
  }

  function countTagPosts() {
    var counts = {};
    document.querySelectorAll('h2[id^="tag:"]').forEach(function (h) {
      var id = h.getAttribute('id');
      var slug = decodeURIComponent(id.slice('tag:'.length));
      var ul = h.nextElementSibling;
      while (ul && ul.tagName !== 'UL') ul = ul.nextElementSibling;
      if (!ul) return;
      counts[slug] = ul.querySelectorAll(':scope > li').length;
    });
    return counts;
  }

  function applyTagCounts(counts) {
    var sidebar = document.querySelector('.md-sidebar--secondary');
    if (!sidebar) return;
    sidebar.querySelectorAll('a.md-nav__link').forEach(function (a) {
      if (a.querySelector('.md-count-badge')) return;
      var href = a.getAttribute('href') || '';
      var m = href.match(/^#tag:(.+)$/);
      if (!m) return;
      var slug = decodeURIComponent(m[1]);
      var n = counts[slug];
      if (n === undefined) return;
      var badge = document.createElement('span');
      badge.className = 'md-count-badge';
      badge.textContent = n;
      a.appendChild(badge);
    });
  }

  function init() {
    if (isTagsPage()) applyTagCounts(countTagPosts());
    loadCounts().then(applyCounts);
  }

  if (window.document$) window.document$.subscribe(init);
  else document.addEventListener('DOMContentLoaded', init);
})();