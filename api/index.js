import crypto from 'node:crypto';
import { list, put } from '@vercel/blob';

const libraryPath = 'earth-ex/library.json';
const extensions = new Set(['.mp4', '.webm', '.mkv', '.avi', '.mov', '.m4v']);
const secret = process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || 'change-this-secret';

const send = (status, data, headers = {}) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...headers } });
const id = () => crypto.randomUUID();
const hash = (value, salt = crypto.randomBytes(16).toString('hex')) => `${salt}:${crypto.scryptSync(value, salt, 64).toString('hex')}`;
const valid = (value, stored) => { try { const [salt, digest] = stored.split(':'); return crypto.timingSafeEqual(Buffer.from(digest, 'hex'), crypto.scryptSync(value, salt, 64)); } catch { return false; } };
const sign = value => crypto.createHmac('sha256', secret).update(value).digest('hex');
const tokenFor = user => { const payload = Buffer.from(JSON.stringify({ id: user.id, username: user.username, role: user.role })).toString('base64url'); return `${payload}.${sign(payload)}`; };
const userFor = request => { try { const [payload, signature] = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').split('.'); if (!payload || !signature || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(sign(payload)))) return null; return JSON.parse(Buffer.from(payload, 'base64url').toString()); } catch { return null; } };
const requireUser = (request, admin = false) => { const user = userFor(request); if (!user || (admin && user.role !== 'admin')) return null; return user; };
const blob = async pathname => { const result = await list({ prefix: pathname }); return result.blobs[0]; };
async function readDb() {
  const item = await blob(libraryPath);
  if (item) { try { return JSON.parse(await (await fetch(item.url)).text()); } catch {} }
  return { movies: [], users: [] };
}
async function saveDb(db) { await put(libraryPath, JSON.stringify(db, null, 2), { access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' }); }
async function adminUser(db) { const username = process.env.ADMIN_USERNAME || 'admin'; const password = process.env.ADMIN_PASSWORD || 'change-me-now'; return { id: 'admin', username, password: hash(password, 'earth-ex-admin'), role: 'admin' }; }
const view = movie => ({ ...movie, streamUrl: `/api/movies/${movie.id}/stream` });
const safe = value => String(value || 'movie.mp4').split('/').pop().replace(/[^\w .()[\]-]/g, '_');
const movieType = name => { const ext = name.slice(name.lastIndexOf('.')).toLowerCase(); return extensions.has(ext) ? ext : null; };

export default async function handler(request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return send(500, { error: 'Set BLOB_READ_WRITE_TOKEN in Vercel project settings.' });
  const url = new URL(request.url), path = url.pathname.replace(/^\/api/, '') || '/';
  try {
    let db = await readDb();
    if (!db.users?.length) { db.users = [await adminUser(db)]; await saveDb(db); }
    if (request.method === 'POST' && path === '/login') {
      const body = await request.json(), admin = await adminUser(db);
      const user = [...db.users, admin].find(item => item.username === body.username && valid(body.password || '', item.password));
      if (!user) return send(401, { error: 'Invalid username or password' });
      return send(200, { token: tokenFor(user), user: { username: user.username, role: user.role } });
    }
    if (request.method === 'GET' && path === '/me') { const user = requireUser(request); return user ? send(200, user) : send(401, { error: 'Sign in required' }); }
    const movieMatch = path.match(/^\/movies\/([^/]+)$/), streamMatch = path.match(/^\/movies\/([^/]+)\/stream$/);
    if (request.method === 'GET' && path === '/movies') { if (!requireUser(request)) return send(401, { error: 'Sign in required' }); return send(200, db.movies.map(view)); }
    if (request.method === 'GET' && streamMatch) {
      if (!requireUser(request)) return send(401, { error: 'Sign in required' });
      const movie = db.movies.find(item => item.id === streamMatch[1]);
      return movie?.url ? Response.redirect(movie.url, 302) : send(404, { error: 'Movie not found' });
    }
    if (request.method === 'PATCH' && movieMatch) {
      if (!requireUser(request, true)) return send(403, { error: 'Administrator permission required' });
      const movie = db.movies.find(item => item.id === movieMatch[1]); if (!movie) return send(404, { error: 'Movie not found' });
      const body = await request.json(); for (const key of ['title', 'year', 'genre', 'description', 'poster']) if (typeof body[key] === 'string') movie[key] = body[key].slice(0, 5000);
      await saveDb(db); return send(200, view(movie));
    }
    if (request.method === 'PUT' && path === '/upload') {
      if (!requireUser(request, true)) return send(403, { error: 'Administrator permission required' });
      const filename = safe(request.headers.get('x-filename')); if (!movieType(filename)) return send(400, { error: 'Unsupported movie format' });
      const result = await put(`movies/${id()}-${filename}`, request.body, { access: 'public', addRandomSuffix: false, contentType: request.headers.get('content-type') || 'application/octet-stream' });
      const movie = { id: id(), file: filename, url: result.url, title: filename.replace(/\.[^.]+$/, '').replace(/[._]/g, ' '), year: '', genre: '', description: '', poster: '' }; db.movies.push(movie); await saveDb(db); return send(201, { movie: view(movie) });
    }
    if (request.method === 'POST' && path === '/scan') return requireUser(request, true) ? send(200, db.movies.map(view)) : send(403, { error: 'Administrator permission required' });
    if (request.method === 'POST' && path === '/users') {
      if (!requireUser(request, true)) return send(403, { error: 'Administrator permission required' }); const body = await request.json();
      if (!body.username || !body.password) return send(400, { error: 'Username and password are required' }); if (db.users.some(item => item.username === body.username)) return send(409, { error: 'Username already exists' });
      db.users.push({ id: id(), username: body.username, password: hash(body.password), role: 'viewer' }); await saveDb(db); return send(201, { username: body.username, role: 'viewer' });
    }
    return send(404, { error: 'Not found' });
  } catch (error) { console.error(error); return send(500, { error: error.message || 'Server error' }); }
}
