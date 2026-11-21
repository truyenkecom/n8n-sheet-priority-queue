// n8n Code node ("Run Once for All Items")
// Chọn 1 URL để xử lý trong lượt chạy:
//   1) ƯU TIÊN dòng anh/chị tự dán vào Google Sheet: có URL nhưng Title + Status còn trống (lấy từ trên xuống)
//   2) Hết dòng ưu tiên -> lấy item mới nhất trong sitemap chưa xử lý
// Trả về `sheet_key` = nguyên văn URL trong Sheet để node ghi Sheet (appendOrUpdate) match đúng dòng đó.
//
// Cần 2 node phía trước:
//   'Sheets Read'  : Google Sheets read (executeOnce, alwaysOutputData) - cột URL, Title, Status
//   'Sitemap Items': mỗi item có { url, lastmod }, đã sort lastmod giảm dần
// Đổi các hằng số dưới cho site của bạn.

const SHEET_NODE = 'Sheets Read';
const SITEMAP_NODE = 'Sitemap Items';
const URL_COL = 'URL';
const HOST = 'example.com';
const ITEM_PATH = /^https:\/\/example\.com\/truyen\/[^\/]+\/$/i;          // URL hợp lệ
const CHILD_TO_PARENT = /^https:\/\/example\.com\/chuong\/(.+?)-chuong-\d+\/?$/i; // link con -> link cha (tuỳ chọn)

const norm = u => String(u || '').trim().replace(/[#?].*$/, '').replace(/\/+$/, '')
  .replace(/^https?:\/\/(www\.)?/i, '').toLowerCase();

// Chuẩn hoá link dán tay: thêm https, bỏ www/?utm, link con -> link cha, có / cuối
const canon = raw => {
  let u = String(raw || '').trim().replace(/[#?].*$/, '');
  if (!u) return '';
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u.replace(/^\/+/, '');
  u = u.replace(/^http:\/\//i, 'https://').replace(/^https:\/\/www\./i, 'https://');
  const ch = u.match(CHILD_TO_PARENT);
  if (ch) u = `https://${HOST}/truyen/${ch[1]}/`;
  if (!/\/$/.test(u)) u += '/';
  return ITEM_PATH.test(u) ? u : '';
};

let rows = [];
try { rows = $(SHEET_NODE).all().map(i => i.json); } catch (e) {}
const urlOf = r => String(r[URL_COL] || '').trim();
const pending = r => urlOf(r) && !String(r.Title || '').trim() && !String(r.Status || '').trim();
const done = new Set(rows.filter(r => urlOf(r) && !pending(r)).map(r => norm(canon(urlOf(r)) || urlOf(r))));

// 1) dòng ưu tiên
for (const r of rows) {
  if (!pending(r)) continue;
  const u = canon(urlOf(r));
  if (!u || done.has(norm(u))) continue; // link sai hoặc đã làm ở dòng khác -> bỏ qua
  return [{ json: { url: u, sheet_key: urlOf(r), row_number: r.row_number, source: 'sheet_priority' } }];
}

// 2) sitemap
const seen = new Set(rows.map(urlOf).filter(Boolean).map(x => norm(canon(x) || x)));
for (const it of $(SITEMAP_NODE).all()) {
  if (!seen.has(norm(it.json.url))) return [{ json: { ...it.json, sheet_key: it.json.url, source: 'sitemap' } }];
}
return [];
