/* ============================================
   中国乒乓球队 · 荣誉殿堂
   前端交互脚本（前后端结合版）
   ============================================ */

(function () {
    'use strict';

    var INITIAL = window.__INITIAL_DATA__ || {};
    var allPlayers = INITIAL.players || [];
    var allTimeline = INITIAL.timeline || [];

    var navbar = document.getElementById('navbar');
    var navToggle = document.getElementById('navToggle');
    var navMenu = document.getElementById('navMenu');
    var backToTop = document.getElementById('backToTop');
    var playersGrid = document.getElementById('playersGrid');
    var timelineContainer = document.getElementById('timelineContainer');
    var searchInput = document.getElementById('searchInput');
    var searchResults = document.getElementById('searchResults');

    // ============================================
    // 1. 导航栏
    // ============================================
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () { navMenu.classList.toggle('active'); });
        document.querySelectorAll('.nav-link').forEach(function (link) {
            link.addEventListener('click', function () { navMenu.classList.remove('active'); });
        });
    }

    window.addEventListener('scroll', function () {
        var y = window.scrollY || window.pageYOffset;
        navbar.style.background = y > 80 ? 'rgba(26, 26, 46, 0.98)' : 'rgba(26, 26, 46, 0.95)';
        navbar.style.boxShadow = y > 80 ? '0 2px 20px rgba(0,0,0,0.3)' : 'none';
        if (backToTop) backToTop.classList.toggle('show', y > 500);
    });

    if (backToTop) {
        backToTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }

    // ============================================
    // 2. Toast 错误提示
    // ============================================
    function showToast(msg, type) {
        var toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.className = 'toast ' + (type || 'error');
        toast.classList.add('show');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(function () { toast.classList.remove('show'); }, 3000);
    }

    // ============================================
    // 3. 球员筛选
    // ============================================
    document.querySelectorAll('.filter-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            var filter = btn.getAttribute('data-filter');
            var url = filter === 'all' ? '/api/players' : '/api/players?gender=' + filter;
            showLoading(playersGrid);
            fetch(url).then(function (r) { return r.json(); }).then(function (j) {
                if (j.success) renderPlayers(playersGrid, j.data);
            }).catch(function () {
                showToast('加载球员数据失败，已使用本地缓存');
                renderPlayers(playersGrid, filter === 'all' ? allPlayers : allPlayers.filter(function (p) { return p.gender === filter; }));
            });
        });
    });

    function showLoading(c) { c.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:rgba(255,255,255,0.5);font-size:1.1rem">加载中...</div>'; }

    function renderPlayers(container, data) {
        if (!data || !data.length) {
            container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:rgba(255,255,255,0.5)">暂无数据</div>';
            return;
        }
        var html = '';
        data.forEach(function (p) {
            var initials = p.name.split('').join('<br>');
            html += '<div class="player-card" data-gender="' + p.gender + '" data-id="' + p.id + '">'
                  + '<div class="player-img">'
                  + '<div class="player-initials">' + initials + '</div>'
                  + '<img src="' + (p.image || '') + '" alt="' + p.name + '" onerror="this.style.display=\'none\'">'
                  + '</div>'
                  + '<div class="player-info">'
                  + '<h3 class="player-name">' + p.name + '</h3>'
                  + '<span class="player-born">' + (p.born || '') + '</span>'
                  + '<p class="player-bio">' + (p.bio || '') + '</p>'
                  + '<div class="player-honors">'
                  + '<span class="honor-tag olympic-tag">' + (p.honors ? p.honors.olympic : '') + '</span>'
                  + '<span class="honor-tag world-tag">' + (p.honors ? p.honors.world : '') + '</span>'
                  + '<span class="honor-tag cup-tag">' + (p.honors ? p.honors.cup : '') + '</span>'
                  + '</div></div></div>';
        });
        container.innerHTML = html;
    }

    // ============================================
    // 4. 时间线筛选
    // ============================================
    document.querySelectorAll('.timeline-filter-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.timeline-filter-btn').forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            var filter = btn.getAttribute('data-filter');
            var url = filter === 'all' ? '/api/timeline' : '/api/timeline?category=' + filter;
            fetch(url).then(function (r) { return r.json(); }).then(function (j) {
                if (j.success) { renderTimeline(timelineContainer, j.data); setTimeout(initTimelineVisibility, 100); }
            }).catch(function () {
                showToast('加载时间线失败，已使用本地缓存');
                renderTimeline(timelineContainer, filter === 'all' ? allTimeline : allTimeline.filter(function (t) { return t.category === filter; }));
                setTimeout(initTimelineVisibility, 100);
            });
        });
    });

    function renderTimeline(container, data) {
        if (!data || !data.length) { container.innerHTML = '<div style="text-align:center;padding:60px 0;color:#999">暂无数据</div>'; return; }
        var html = '';
        data.forEach(function (t) {
            var isGold = t.category === 'olympic' && (t.year === '2008' || t.year === '2024');
            html += '<div class="timeline-item visible" data-category="' + t.category + '">'
                  + '<div class="timeline-dot' + (isGold ? ' olympic-gold' : '') + '"></div>'
                  + '<div class="timeline-date">' + t.year + '</div>'
                  + '<div class="timeline-content">'
                  + '<h3>' + t.title + '</h3><p>' + t.description + '</p></div></div>';
        });
        container.innerHTML = html;
    }

    function initTimelineVisibility() {
        var items = document.querySelectorAll('.timeline-item');
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('visible'); });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
        items.forEach(function (item) { if (item.style.display !== 'none') observer.observe(item); });
    }
    setTimeout(initTimelineVisibility, 300);

    // ============================================
    // 5. 数据统计 Tab 切换
    // ============================================
    document.querySelectorAll('.stats-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.stats-tab').forEach(function (t) { t.classList.remove('active'); });
            tab.classList.add('active');
            var tabId = tab.getAttribute('data-tab');
            document.querySelectorAll('.stats-panel').forEach(function (p) { p.classList.remove('active'); });
            var target = document.getElementById('tab-' + tabId);
            if (target) target.classList.add('active');
            if (tabId === 'charts') renderCharts();
        });
    });

    // ============================================
    // 6. 平滑滚动
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var t = document.querySelector(this.getAttribute('href'));
            if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        });
    });

    // ============================================
    // 7. 统计数字动画
    // ============================================
    (function () {
        var done = false;
        var observer = new IntersectionObserver(function () {
            if (!done) {
                done = true;
                document.querySelectorAll('.stat-card-num').forEach(function (el) {
                    var target = parseInt(el.textContent, 10);
                    if (isNaN(target)) return;
                    var cur = 0, step = Math.ceil(target / 40);
                    var timer = setInterval(function () { cur += step; if (cur >= target) { cur = target; clearInterval(timer); } el.textContent = cur; }, 30);
                });
            }
        }, { threshold: 0.5 });
        var section = document.querySelector('#overview');
        if (section) observer.observe(section);
    })();

    // ============================================
    // 8. 图片点击放大 (Modal)
    // ============================================
    function openImgModal(imgEl) {
        var modal = document.getElementById('imgModal');
        var modalImg = document.getElementById('imgModalContent');
        var modalName = document.getElementById('imgModalName');
        if (!modal || !modalImg) return;
        modalImg.src = imgEl.src;
        modalName.textContent = imgEl.alt || '';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    window.openImgModal = openImgModal;

    window.closeImgModal = function () {
        var modal = document.getElementById('imgModal');
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeImgModal(); closeDetailModal(); } });

    document.getElementById('playersGrid').addEventListener('click', function (e) {
        var img = e.target.closest('.player-img img');
        if (img) { e.stopPropagation(); openImgModal(img); return; }
        var card = e.target.closest('.player-card');
        if (card && !e.target.closest('.player-img')) {
            var id = card.getAttribute('data-id');
            if (id) openDetailModal(id);
        }
    });

    // ============================================
    // 9. 球员详情 Modal（增强版）
    // ============================================
    function openDetailModal(id) {
        var player = allPlayers.find(function (p) { return p.id === id; });
        if (!player) return;
        var modal = document.getElementById('detailModal');
        var body = document.getElementById('detailBody');

        // 构建三大赛荣誉表
        var honorMap = { olympic: '奥运会', world: '世锦赛', cup: '世界杯' };
        var honorRows = '';
        for (var key in player.honors) {
            if (player.honors.hasOwnProperty(key)) {
                honorRows += '<tr><td>' + honorMap[key] + '</td><td>' + player.honors[key] + '</td></tr>';
            }
        }

        // 从时间线数据中提取该球员相关的赛事
        var relatedEvents = allTimeline.filter(function (t) {
            return t.description.indexOf(player.name) !== -1;
        });
        var eventsHtml = '';
        if (relatedEvents.length) {
            eventsHtml += '<h3 class="detail-section-title">生涯关键赛事</h3><div class="detail-events">';
            relatedEvents.forEach(function (ev) {
                eventsHtml += '<div class="detail-event-item"><span class="detail-event-year">' + ev.year + '</span>'
                    + '<span class="detail-event-desc">' + ev.title + '</span></div>';
            });
            eventsHtml += '</div>';
        }

        body.innerHTML = '<div class="detail-layout">'
            + '<div class="detail-img-wrapper">'
            + '<img src="' + player.image + '" alt="' + player.name + '" class="detail-img" onerror="this.style.display=\'none\'">'
            + '<div class="detail-initials">' + player.name.split('').join(' ') + '</div>'
            + '</div>'
            + '<div class="detail-info">'
            + '<h2 class="detail-name">' + player.name + '</h2>'
            + '<span class="detail-born">' + (player.born || '') + '</span>'
            + '<p class="detail-bio">' + (player.bio || '') + '</p>'
            + '<h3 class="detail-section-title">三大赛荣誉</h3>'
            + '<table class="detail-table"><thead><tr><th>赛事</th><th>成绩</th></tr></thead><tbody>' + honorRows + '</tbody></table>'
            + eventsHtml
            + '</div></div>';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    window.openDetailModal = openDetailModal;

    window.closeDetailModal = function () {
        var modal = document.getElementById('detailModal');
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    // ============================================
    // 10. 搜索功能（带防抖）
    // ============================================
    if (searchInput && searchResults) {
        var debounceTimer = null;

        function doSearch() {
            var q = searchInput.value.trim().toLowerCase();
            if (!q) { searchResults.classList.remove('active'); return; }
            var playerHits = [];
            var timelineHits = [];
            allPlayers.forEach(function (p) {
                if (p.name.indexOf(q) !== -1 || p.bio.indexOf(q) !== -1 || p.born.indexOf(q) !== -1) playerHits.push(p);
            });
            allTimeline.forEach(function (t) {
                if (t.title.indexOf(q) !== -1 || t.description.indexOf(q) !== -1) timelineHits.push(t);
            });
            if (!playerHits.length && !timelineHits.length) {
                searchResults.innerHTML = '<div class="search-result-empty">未找到相关结果</div>';
            } else {
                var html = '';
                if (playerHits.length) {
                    html += '<div class="search-result-group">球员 (' + playerHits.length + ')</div>';
                    playerHits.forEach(function (p) {
                        html += '<div class="search-result-item" data-type="player" data-id="' + p.id + '">'
                            + '<span class="search-result-icon">&#127922;</span>'
                            + '<span class="search-result-text"><strong>' + p.name + '</strong><small>' + p.born + '</small></span>'
                            + '</div>';
                    });
                }
                if (timelineHits.length) {
                    html += '<div class="search-result-group">赛事 (' + timelineHits.length + ')</div>';
                    timelineHits.forEach(function (t) {
                        html += '<div class="search-result-item" data-type="timeline" data-year="' + t.year + '">'
                            + '<span class="search-result-icon">&#128197;</span>'
                            + '<span class="search-result-text"><strong>' + t.title + '</strong><small>' + t.year + '</small></span>'
                            + '</div>';
                    });
                }
                searchResults.innerHTML = html;
            }
            searchResults.classList.add('active');
        }

        searchInput.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(doSearch, 220);
        });

        searchResults.addEventListener('click', function (e) {
            var item = e.target.closest('.search-result-item');
            if (!item) return;
            var type = item.getAttribute('data-type');
            searchResults.classList.remove('active');
            searchInput.value = '';
            if (type === 'player') {
                var id = item.getAttribute('data-id');
                var section = document.getElementById('players');
                if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setTimeout(function () { openDetailModal(id); }, 500);
            } else if (type === 'timeline') {
                var sec = document.getElementById('timeline');
                if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });

        document.addEventListener('click', function (e) {
            if (!e.target.closest('.nav-search')) searchResults.classList.remove('active');
        });
    }

    // ============================================
    // 11. 图表渲染 (SVG)
    // ============================================
    function renderCharts() {
        var chart1 = document.getElementById('chartOlympic');
        var chart2 = document.getElementById('chartGoat');
        if (chart1) renderOlympicChart(chart1);
        if (chart2) renderGoatChart(chart2);
    }

    function renderOlympicChart(container) {
        var data = (INITIAL.statsData && INITIAL.statsData.olympicMedals) || [];
        if (!data.length) return;
        var maxVal = 0;
        data.forEach(function (d) { if (d.total > maxVal) maxVal = d.total; });
        var w = 600, h = 280, pad = { t: 20, r: 20, b: 40, l: 40 };
        var cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
        var cols = data.length, gap = 8;
        var barW = Math.min(40, (cw - gap * (cols - 1)) / cols);
        var totalBW = cols * barW + (cols - 1) * gap;
        var offsetX = pad.l + (cw - totalBW) / 2;

        var svg = '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;max-width:600px;height:auto">';
        svg += '<defs><linearGradient id="gGoldChart" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#B8860B"/><stop offset="100%" stop-color="#FFD700"/></linearGradient></defs>';

        data.forEach(function (d, i) {
            var x = offsetX + i * (barW + gap);
            var barH = (d.total / maxVal) * ch;
            var y = pad.t + ch - barH;
            svg += '<rect x="' + x + '" y="' + y + '" width="' + barW + '" height="' + barH + '" fill="url(#gGoldChart)" rx="3" ry="3">'
                + '<title>' + d.event + ' ' + d.year + ': ' + d.total + '枚 (' + d.gold + '金 ' + d.silver + '银 ' + d.bronze + '铜)</title></rect>';
            svg += '<text x="' + (x + barW / 2) + '" y="' + (y - 6) + '" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="13" font-weight="700">' + d.total + '</text>';
            svg += '<text x="' + (x + barW / 2) + '" y="' + (h - 8) + '" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="11">' + d.year.slice(2) + '</text>';
            var dotY = y - 24;
            svg += '<circle cx="' + (x + barW / 2 - 14) + '" cy="' + dotY + '" r="3" fill="#FFD700"/>';
            svg += '<text x="' + (x + barW / 2 - 10) + '" y="' + (dotY + 4) + '" fill="rgba(255,255,255,0.55)" font-size="9">' + d.gold + '</text>';
            svg += '<circle cx="' + (x + barW / 2) + '" cy="' + dotY + '" r="3" fill="#C0C0C0"/>';
            svg += '<text x="' + (x + barW / 2 + 4) + '" y="' + (dotY + 4) + '" fill="rgba(255,255,255,0.55)" font-size="9">' + d.silver + '</text>';
            svg += '<circle cx="' + (x + barW / 2 + 14) + '" cy="' + dotY + '" r="3" fill="#CD7F32"/>';
            svg += '<text x="' + (x + barW / 2 + 18) + '" y="' + (dotY + 4) + '" fill="rgba(255,255,255,0.55)" font-size="9">' + d.bronze + '</text>';
        });
        svg += '</svg>';
        container.innerHTML = svg;
    }

    function renderGoatChart(container) {
        var data = (INITIAL.statsData && INITIAL.statsData.goatRanking) || [];
        if (!data.length) return;
        var top = data.slice(0, 10);
        var maxVal = top[0].total;
        var barH = 28, gap = 6, pad = { t: 10, r: 80, b: 10, l: 80 };
        var h = top.length * (barH + gap) + pad.t + pad.b;
        var w = 600, cw = w - pad.l - pad.r;

        var svg = '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;max-width:600px;height:auto">';
        top.forEach(function (d, i) {
            var y = pad.t + i * (barH + gap);
            var bw = (d.total / maxVal) * cw;
            var colors = ['#C41E1E','#D4A017','#E84949','#B8860B','#DC143C','#8B0000','#FF6347','#CD5C5C','#F08080','#A0522D'];
            svg += '<rect x="' + pad.l + '" y="' + y + '" width="' + bw + '" height="' + barH + '" fill="' + colors[i % colors.length] + '" rx="4" ry="4">'
                + '<title>' + d.name + ': ' + d.total + '枚</title></rect>';
            svg += '<text x="' + (pad.l - 8) + '" y="' + (y + barH / 2 + 1) + '" text-anchor="end" fill="rgba(255,255,255,0.8)" font-size="13" font-weight="600">' + d.name + '</text>';
            svg += '<text x="' + (pad.l + bw + 6) + '" y="' + (y + barH / 2 + 1) + '" fill="rgba(255,255,255,0.7)" font-size="12">' + d.total + '枚</text>';
        });
        svg += '</svg>';
        container.innerHTML = svg;
    }

    // ============================================
    // 12. 初始化完成
    // ============================================
    console.log('%c\uD83C\uDFC6 中国乒乓球队 · 荣誉殿堂已加载', 'font-size:16px;color:#C41E1E;font-weight:bold;');

})();
