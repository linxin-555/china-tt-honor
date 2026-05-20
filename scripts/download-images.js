const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'public', 'images', 'players');
const PLAYERS = [
  { id: 'liuguoliang',   page: 'Liu_Guoliang' },
  { id: 'konglinghui',   page: 'Kong_Linghui' },
  { id: 'malin',         page: 'Ma_Lin_(table_tennis)' },
  { id: 'wangliqin',     page: 'Wang_Liqin' },
  { id: 'wanghao',       page: 'Wang_Hao_(table_tennis)' },
  { id: 'zhangjike',     page: 'Zhang_Jike' },
  { id: 'malong',        page: 'Ma_Long_(table_tennis)' },
  { id: 'xuxin',         page: 'Xu_Xin' },
  { id: 'fanzhendong',   page: 'Fan_Zhendong' },
  { id: 'wangchuqin',    page: 'Wang_Chuqin' },
  { id: 'dengyaping',    page: 'Deng_Yaping' },
  { id: 'wangnan',       page: 'Wang_Nan_(table_tennis)' },
  { id: 'zhangyining',   page: 'Zhang_Yining' },
  { id: 'lixiaoxia',     page: 'Li_Xiaoxia' },
  { id: 'dingning',      page: 'Ding_Ning' },
  { id: 'liushiwen',     page: 'Liu_Shiwen' },
  { id: 'chenmeng',      page: 'Chen_Meng' },
  { id: 'sunyingsha',    page: 'Sun_Yingsha' },
  { id: 'wangmanyu',     page: 'Wang_Manyu' }
];

function wikiGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'ChinaTT/1.0 (nodejs)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function download(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, { headers: { 'User-Agent': 'ChinaTT/1.0 (nodejs)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close(); fs.unlink(filepath, () => {});
        download(res.headers.location, filepath).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        const st = fs.statSync(filepath);
        if (st.size > 500) resolve(st.size);
        else { fs.unlink(filepath, () => {}); resolve(0); }
      });
    }).on('error', (err) => { file.close(); fs.unlink(filepath, () => {}); reject(err); });
  });
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const pl of PLAYERS) {
    const filepath = path.join(OUTPUT_DIR, pl.id + '.jpg');
    if (fs.existsSync(filepath) && fs.statSync(filepath).size > 500) {
      console.log(`  ✓ ${pl.id}.jpg 已存在 (${(fs.statSync(filepath).size/1024).toFixed(1)} KB)`);
      continue;
    }

    process.stdout.write(`  → ${pl.id} (${pl.page}) ... `);
    try {
      const info = await wikiGet(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pl.page)}`);
      if (!info.thumbnail || !info.thumbnail.source) {
        console.log('无缩略图');
        continue;
      }
      // Use a larger size (640px wide)
      const thumb640 = info.thumbnail.source.replace(/\d+px/, '640px');
      const bytes = await download(thumb640, filepath);
      if (bytes > 0) {
        console.log(`✓ (${(bytes/1024).toFixed(1)} KB)`);
      } else {
        console.log('文件无效');
      }
    } catch (err) {
      console.log(`错误: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('\n  全部完成！');
}

main().catch(console.error);
