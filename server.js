const express = require('express');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ----- 中间件 -----
app.use(compression());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));

// ----- 读取 JSON 数据文件 -----
function loadJSON(filename) {
    const filePath = path.join(__dirname, 'data', filename);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// 启动时一次性加载到内存
const players = loadJSON('players.json');
const timeline = loadJSON('timeline.json');
const heroStats = loadJSON('hero-stats.json');
const statsData = loadJSON('stats.json');

// ----- 模板引擎 -----
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ----- 页面路由 -----
app.get('/', (req, res) => {
    res.render('index', {
        players,
        timeline,
        stats: heroStats,
        statsData
    });
});

// ----- API 路由 -----

// GET /api/players?gender=male|female
app.get('/api/players', (req, res) => {
    const { gender } = req.query;
    let result = players;
    if (gender && (gender === 'male' || gender === 'female')) {
        result = players.filter(p => p.gender === gender);
    }
    res.json({ success: true, data: result });
});

// GET /api/timeline?category=olympic|world|asian
app.get('/api/timeline', (req, res) => {
    const { category } = req.query;
    let result = timeline;
    if (category && ['olympic', 'world', 'asian'].includes(category)) {
        result = timeline.filter(t => t.category === category);
    }
    res.json({ success: true, data: result });
});

// GET /api/stats
app.get('/api/stats', (req, res) => {
    res.json({ success: true, data: statsData });
});

// GET /api/hero-stats
app.get('/api/hero-stats', (req, res) => {
    res.json({ success: true, data: heroStats });
});

// GET /api/player/:id
app.get('/api/player/:id', (req, res) => {
    const player = players.find(p => p.id === req.params.id);
    if (!player) {
        return res.status(404).json({ success: false, message: '球员未找到' });
    }
    res.json({ success: true, data: player });
});

// ----- 404 处理 -----
app.use((req, res) => {
    res.status(404).json({ success: false, message: '接口不存在' });
});

// ----- 启动服务器 -----
app.listen(PORT, () => {
    console.log(`\n  🏓 中国乒乓球队 · 荣誉殿堂`);
    console.log(`  ─────────────────────────────`);
    console.log(`  服务已启动: http://localhost:${PORT}`);
    console.log(`  页面地址  : http://localhost:${PORT}/`);
    console.log(`  API 示例  : http://localhost:${PORT}/api/players`);
    console.log(`            : http://localhost:${PORT}/api/timeline?category=olympic`);
    console.log(`            : http://localhost:${PORT}/api/stats`);
    console.log(`  ─────────────────────────────\n`);
});
