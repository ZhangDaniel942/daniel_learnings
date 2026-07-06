(function () {
  var BIN = '6a4b83aaf5f4af5e2965f621';
  var KEY = '$2a$10$JSQHfemlaWU1cqJxJp2CJOUsjEgIuXdGhOfFTxsmQTqN0yGm861ES';
  var URL = 'https://api.jsonbin.io/v3/b/' + BIN;
  var CACHE = 'md-task-cache';
  var HEADERS = {
    'Content-Type': 'application/json',
    'X-Master-Key': KEY
  };

  function taskKey(li) {
    var text = (li.textContent || '').replace(/\s+/g, ' ').trim();
    return location.pathname + '::' + text;
  }

  function readCache() {
    try { return JSON.parse(localStorage.getItem(CACHE) || '{}'); }
    catch (e) { return {}; }
  }
  function writeCache(tasks) {
    try { localStorage.setItem(CACHE, JSON.stringify(tasks)); } catch (e) {}
  }

  function getBin() {
    return fetch(URL + '/latest', { headers: { 'X-Master-Key': KEY } })
      .then(function (r) { return r.json(); })
      .then(function (d) { return (d.record && d.record.tasks) || {}; })
      .catch(function () { return {}; });
  }
  function putBin(tasks) {
    return fetch(URL, {
      method: 'PUT',
      headers: HEADERS,
      body: JSON.stringify({ tasks: tasks })
    }).catch(function () {});
  }

  function applyState(li, cb, tasks) {
    var k = taskKey(li);
    if (k in tasks) cb.checked = !!tasks[k];
  }

  function bindItem(li, tasks) {
    var cb = li.querySelector('input[type="checkbox"]');
    if (!cb || cb.dataset.taskBound) return;
    cb.dataset.taskBound = '1';
    cb.disabled = false;
    cb.style.cursor = 'pointer';
    applyState(li, cb, tasks);
    cb.addEventListener('change', function () {
      // read-modify-write to avoid clobbering other devices
      getBin().then(function (t) {
        t[taskKey(li)] = cb.checked;
        writeCache(t);
        return putBin(t);
      });
    });
  }

  function initTasks() {
    var items = document.querySelectorAll('.task-list-item');
    if (!items.length) return;
    // instant apply from local cache
    var cached = readCache();
    items.forEach(function (li) { bindItem(li, cached); });
    // sync with cloud, then re-apply
    getBin().then(function (tasks) {
      writeCache(tasks);
      items.forEach(function (li) {
        var cb = li.querySelector('input[type="checkbox"]');
        if (cb) applyState(li, cb, tasks);
      });
    });
  }

  if (window.document$) window.document$.subscribe(initTasks);
  else document.addEventListener('DOMContentLoaded', initTasks);
})();
