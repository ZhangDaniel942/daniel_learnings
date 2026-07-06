(function () {
  var CACHE_KEY = 'md-blog-counts-v3';
  var TTL = 5 * 60 * 1000;

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

  function sameCounts(a, b) {
    if (!a || !b) return false;
    if (a.total !== b.total) return false;
    var ak = Object.keys(a.categories || {}), bk = Object.keys(b.categories || {});
    if (ak.length !== bk.length) return false;
    for (var i = 0; i < ak.length; i++) if (a.categories[ak[i]] !== b.categories[ak[i]]) return false;
    ak = Object.keys(a.archives || {}); bk = Object.keys(b.archives || {});
    if (ak.length !== bk.length) return false;
    for (var j = 0; j < ak.length; j++) if (a.archives[ak[j]] !== b.archives[ak[j]]) return false;
    return true;
  }

  function fetchCounts() {
    return fetch(blogIndexUrl(), { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.text() : ''; })
      .then(function (html) {
        if (!html) return null;
        return parseCounts(html);
      })
      .catch(function () { return null; });
  }

  function loadCounts() {
    var cached;
    try {
      cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    } catch (e) { cached = null; }
    var now = Date.now();
    var hasFreshCache = cached && cached.ts && (now - cached.ts) < TTL && cached.data;

    if (hasFreshCache) {
      // 先用缓存渲染，但后台再 fetch 一次校验，发现不一致就刷新
      fetchCounts().then(function (fresh) {
        if (!fresh) return;
        if (!sameCounts(cached.data, fresh)) {
          try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: fresh })); }
          catch (e) {}
          applyCounts(fresh);
        } else {
          try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: cached.data })); }
          catch (e) {}
        }
      });
      return Promise.resolve(cached.data);
    }

    return fetchCounts().then(function (data) {
      if (!data) return { categories: {}, archives: {}, total: 0 };
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data })); }
      catch (e) {}
      return data;
    });
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