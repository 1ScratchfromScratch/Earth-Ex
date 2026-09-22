import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const dataDir = process.env.DATA_DIR || path.join(root, 'data');
const moviesDir = process.env.MOVIES_DIR || path.join(root, 'media', 'movies');
const publicDir = path.join(root, 'public');
const dbFile = path.join(dataDir, 'library.json');
const extensions = new Set(['.mp4', '.webm', '.mkv', '.avi', '.mov', '.m4v']);
const sessions = new Map();

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(moviesDir, { recursive: true });
let db = loadDb();

function loadDb() {
  try { return JSON.parse(fs.readFileSync(dbFile, 'utf8')); }
  catch { return { movies: [], users: [] }; }
}
function saveDb() { fs.writeFileSync(dbFile, JSON.stringify(db, null, 2)); }
function id() { return crypto.randomUUID(); }
function hash(value, salt = crypto.randomBytes(16).toString('hex')) { return `${salt}:${crypto.scryptSync(value, salt, 64).toString('hex')}`; }
function valid(value, stored) {
  try { const [salt, digest] = stored.split(':'); return crypto.timingSafeEqual(Buffer.from(digest, 'hex'), crypto.scryptSync(value, salt, 64)); }
  catch { return false; }
}
if (!db.users.length) { db.users.push({ id: id(), username: process.env.ADMIN_USERNAME || 'admin', password: hash(process.env.ADMIN_PASSWORD || 'change-me-now'), role: 'admin' }); saveDb(); }

function send(res, status, data, contentType = 'application/json') {
  const isJson = contentType.startsWith('application/json');
  const output = isJson && typeof data !== 'string' ? JSON.stringify(data) : data;
  res.writeHead(status, { 'Content-Type': `${contentType}; charset=utf-8`, 'Cache-Control': 'no-store' });
  res.end(output);
}
function parseBody(req) { return new Promise((resolve, reject) => { let text = ''; req.on('data', chunk => { text += chunk; if (text.length > 2_000_000) req.destroy(); }); req.on('end', () => resolve(text)); req.on('error', reject); }); }
function userFor(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '') || new URL(req.url, 'http://localhost').searchParams.get('token');
  return sessions.get(token);
}
function requireUser(req, res, admin = false) { const user = userFor(req); if (!user) { send(res, 401, { error: 'Sign in required' }); return null; } if (admin && user.role !== 'admin') { send(res, 403, { error: 'Administrator permission required' }); return null; } return user; }
function safeName(value) { return path.basename(String(value || 'movie.mp4')).replace(/[^a-zA-Z0-9 ._()[\]-]/g, '_'); }
function movieView(movie, token) { return { ...movie, streamUrl: `/api/movies/${movie.id}/stream?token=${encodeURIComponent(token || '')}` }; }

function scanLibrary() {
  const found = new Set();
  function walk(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, item.name);
      if (item.isDirectory()) walk(file);
      else if (extensions.has(path.extname(item.name).toLowerCase())) {
        const relative = path.relative(moviesDir, file); found.add(relative);
        if (!db.movies.some(movie => movie.file === relative)) db.movies.push({ id: id(), file: relative, title: path.basename(item.name, path.extname(item.name)).replace(/[._]/g, ' '), year: '', genre: '', description: '', poster: '' });
      }
    }
  }
  walk(moviesDir); db.movies = db.movies.filter(movie => found.has(movie.file)); saveDb(); return db.movies;
}
function stream(req, res, movie) {
  const file = path.resolve(moviesDir, movie.file), base = path.resolve(moviesDir);
  if (!file.startsWith(base + path.sep) || !fs.existsSync(file)) return send(res, 404, { error: 'Video not found' });
  const size = fs.statSync(file).size, range = req.headers.range, type = { '.mp4': 'video/mp4', '.webm': 'video/webm', '.m4v': 'video/mp4' }[path.extname(file).toLowerCase()] || 'video/mp4';
  if (!range) { res.writeHead(200, { 'Content-Length': size, 'Content-Type': type, 'Accept-Ranges': 'bytes' }); return fs.createReadStream(file).pipe(res); }
  const [startText, endText] = range.replace('bytes=', '').split('-'), start = Number(startText), end = endText ? Math.min(Number(endText), size - 1) : size - 1;
  if (!Number.isInteger(start) || start < 0 || start >= size || end < start) return send(res, 416, { error: 'Invalid range' });
  res.writeHead(206, { 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1, 'Content-Type': type, 'Accept-Ranges': 'bytes' }); fs.createReadStream(file, { start, end }).pipe(res);
}
function serveStatic(req, res, pathname) {
  const requested = pathname === '/' ? 'index.html' : pathname.slice(1), file = path.resolve(publicDir, requested), base = path.resolve(publicDir);
  if (!file.startsWith(base + path.sep)) return send(res, 403, { error: 'Forbidden' });
  fs.stat(file, (error, stat) => { if (error || !stat.isFile()) return send(res, 404, { error: 'Not found' }); const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }[path.extname(file)] || 'application/octet-stream'; res.writeHead(200, { 'Content-Type': `${type}; charset=utf-8` }); fs.createReadStream(file).pipe(res); });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`), pathname = url.pathname;
  try {
    if (req.method === 'POST' && pathname === '/api/login') { const body = JSON.parse(await parseBody(req) || '{}'), user = db.users.find(item => item.username === body.username && valid(body.password || '', item.password)); if (!user) return send(res, 401, { error: 'Invalid username or password' }); const token = crypto.randomBytes(32).toString('hex'); sessions.set(token, { id: user.id, username: user.username, role: user.role }); return send(res, 200, { token, user: { username: user.username, role: user.role } }); }
    if (req.method === 'GET' && pathname === '/api/me') { const user = requireUser(req, res); if (user) return send(res, 200, user); return; }
    if (req.method === 'GET' && pathname === '/api/movies') { const user = requireUser(req, res); if (!user) return; return send(res, 200, db.movies.map(movie => movieView(movie, userToken(req)))); }
    const streamMatch = pathname.match(/^\/api\/movies\/([^/]+)\/stream$/), movieMatch = pathname.match(/^\/api\/movies\/([^/]+)$/);
    if (req.method === 'GET' && streamMatch) { if (!requireUser(req, res)) return; const movie = db.movies.find(item => item.id === streamMatch[1]); return movie ? stream(req, res, movie) : send(res, 404, { error: 'Movie not found' }); }
    if (req.method === 'PATCH' && movieMatch) { if (!requireUser(req, res, true)) return; const movie = db.movies.find(item => item.id === movieMatch[1]); if (!movie) return send(res, 404, { error: 'Movie not found' }); const changes = JSON.parse(await parseBody(req) || '{}'); for (const key of ['title', 'year', 'genre', 'description', 'poster']) if (typeof changes[key] === 'string') movie[key] = changes[key].slice(0, 5000); saveDb(); return send(res, 200, movieView(movie, userToken(req))); }
    if (req.method === 'POST' && pathname === '/api/scan') { const user = requireUser(req, res, true); if (!user) return; return send(res, 200, scanLibrary().map(movie => movieView(movie, userToken(req)))); }
    if (req.method === 'PUT' && pathname === '/api/upload') { if (!requireUser(req, res, true)) return; const filename = safeName(req.headers['x-filename']); if (!extensions.has(path.extname(filename).toLowerCase())) return send(res, 400, { error: 'Unsupported video format' }); const destination = path.join(moviesDir, filename); const output = fs.createWriteStream(destination); req.pipe(output); output.on('finish', () => send(res, 201, { message: 'Uploaded and indexed', movies: scanLibrary() })); return; }
    if (req.method === 'POST' && pathname === '/api/users') { if (!requireUser(req, res, true)) return; const body = JSON.parse(await parseBody(req) || '{}'); if (!body.username || !body.password) return send(res, 400, { error: 'Username and password are required' }); if (db.users.some(item => item.username === body.username)) return send(res, 409, { error: 'Username already exists' }); db.users.push({ id: id(), username: body.username, password: hash(body.password), role: 'viewer' }); saveDb(); return send(res, 201, { username: body.username, role: 'viewer' }); }
    if (pathname.startsWith('/api/')) return send(res, 404, { error: 'Not found' });
    return serveStatic(req, res, pathname);
  } catch (error) { console.error(error); return send(res, 500, { error: 'Server error' }); }
});
function userToken(req) { return (req.headers.authorization || '').replace(/^Bearer\s+/i, '') || new URL(req.url, 'http://localhost').searchParams.get('token') || ''; }
server.listen(port, () => console.log(`Earth-Ex running at http://localhost:${port}`));
