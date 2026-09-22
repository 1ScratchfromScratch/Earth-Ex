import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||3000), dataDir=process.env.DATA_DIR||path.join(root,'data'), moviesDir=process.env.MOVIES_DIR||path.join(root,'media/movies');
const dbFile=path.join(dataDir,'library.json'), publicDir=path.join(root,'public'), extensions=new Set(['.mp4','.webm','.mkv','.avi','.mov','.m4v']), sessions=new Map();
fs.mkdirSync(dataDir,{recursive:true}); fs.mkdirSync(moviesDir,{recursive:true});
let db; try{db=JSON.parse(fs.readFileSync(dbFile,'utf8'))}catch{db={movies:[],users:[]}}
const save=()=>fs.writeFileSync(dbFile,JSON.stringify(db,null,2));
const id=()=>crypto.randomUUID();
const password=(value,salt=crypto.randomBytes(16).toString('hex'))=>salt+':'+crypto.scryptSync(value,salt,64).toString('hex');
const valid=(value,stored)=>{try{const [salt,digest]=stored.split(':');return crypto.timingSafeEqual(Buffer.from(digest,'hex'),crypto.scryptSync(value,salt,64))}catch{return false}};
if(!db.users.length){db.users.push({id:id(),username:process.env.ADMIN_USERNAME||'admin',password:password(process.env.ADMIN_PASSWORD||'change-me-now'),role:'admin'});save()}
const body=req=>new Promise((resolve,reject)=>{let out='';req.on('data',chunk=>out+=chunk);req.on('end',()=>resolve(out));req.on('error',reject)});
const send=(res,status,data,type='application/json')=>{res.writeHead(status,{'Content-Type':type+'; charset=utf-8'});res.end(type==='application/json'?JSON.stringify(data):data)};
const auth=req=>sessions.get((req.headers.authorization||'').replace(/^Bearer\s+/i,''));
const requireUser=(req,res,admin=false)=>{const user=auth(req);if(!user){send(res,401,{error:'Sign in required'});return null}if(admin&&user.role!=='admin'){send(res,403,{error:'Administrator permission required'});return null}return user};
const safe=filename=>path.basename(filename).replace(/[^\w .()[\]-]/g,'_');
const view=m=>({...m,streamUrl:'/api/movies/'+m.id+'/stream'});
function scan(){const files=new Set();function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory())walk(file);else if(extensions.has(path.extname(item.name).toLowerCase())){const rel=path.relative(moviesDir,file);files.add(rel);if(!db.movies.some(m=>m.file===rel)){db.movies.push({id:id(),file:rel,title:path.basename(item.name,path.extname(item.name)).replace(/[._]/g,' '),year:'',genre:'',description:'',poster:''})}}}}walk(moviesDir);db.movies=db.movies.filter(m=>files.has(m.file));save();return db.movies.map(view)}
function stream(req,res,movie){const file=path.resolve(moviesDir,movie.file);if(!file.startsWith(path.resolve(moviesDir))||!fs.existsSync(file))return send(res,404,{error:'Video not found'});const size=fs.statSync(file).size,range=req.headers.range;const type='video/'+path.extname(file).slice(1);if(!range){res.writeHead(200,{'Content-Length':size,'Content-Type':type});return fs.createReadStream(file).pipe(res)}const [a,b]=range.replace('bytes=','').split('-'),start=Number(a),end=b?Number(b):size-1;if(start>=size)return send(res,416,{error:'Invalid range'});res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${size}`,'Accept-Ranges':'bytes','Content-Length':end-start+1,'Content-Type':type});fs.createReadStream(file,{start,end}).pipe(res)}
function staticFile(res,url){const name=url==='/'?'index.html':url.slice(1),file=path.resolve(publicDir,name);if(!file.startsWith(path.resolve(publicDir)))return send(res,403,{error:'Forbidden'});fs.readFile(file,(err,data)=>{if(err)return send(res,404,{error:'Not found'});const types={'.html':'text/html','.js':'text/javascript','.css':'text/css'};send(res,200,data,types[path.extname(file)]||'application/octet-stream')})}
const server=http.createServer(async(req,res)=>{const url=new URL(req.url,'http://localhost'),p=url.pathname;try{
if(req.method==='POST'&&p==='/api/login'){const b=JSON.parse(await body(req)),u=db.users.find(x=>x.username===b.username&&valid(b.password||'',x.password));if(!u)return send(res,401,{error:'Invalid username or password'});const token=crypto.randomBytes(32).toString('hex');sessions.set(token,{id:u.id,username:u.username,role:u.role});return send(res,200,{token,user:{username:u.username,role:u.role}})}
if(req.method==='GET'&&p==='/api/me'){const u=requireUser(req,res);if(u)return send(res,200,u);return}
if(req.method==='GET'&&p==='/api/movies'){if(!requireUser(req,res))return;return send(res,200,db.movies.map(view))}
const match=p.match(/^\/api\/movies\/([^/]+)$/), streamMatch=p.match(/^\/api\/movies\/([^/]+)\/stream$/);
if(req.method==='GET'&&streamMatch){if(!requireUser(req,res))return;const m=db.movies.find(x=>x.id===streamMatch[1]);return m?stream(req,res,m):send(res,404,{error:'Movie not found'})}
if(req.method==='PATCH'&&match){if(!requireUser(req,res,true))return;const m=db.movies.find(x=>x.id===match[1]);if(!m)return send(res,404,{error:'Movie not found'});const b=JSON.parse(await body(req));for(const k of ['title','year','genre','description','poster'])if(typeof b[k]==='string')m[k]=b[k].slice(0,5000);save();return send(res,200,view(m))}
if(req.method==='POST'&&p==='/api/scan'){if(!requireUser(req,res,true))return;return send(res,200,scan())}
if(req.method==='PUT'&&p==='/api/upload'){if(!requireUser(req,res,true))return;const file=path.join(moviesDir,safe(req.headers['x-filename']||'movie.mp4'));const out=fs.createWriteStream(file);req.pipe(out);out.on('finish',()=>send(res,201,{message:'Uploaded',movies:scan()}));return}
if(req.method==='POST'&&p==='/api/users'){if(!requireUser(req,res,true))return;const b=JSON.parse(await body(req));if(!b.username||!b.password)return send(res,400,{error:'Username and password are required'});if(db.users.some(u=>u.username===b.username))return send(res,409,{error:'Username already exists'});db.users.push({id:id(),username:b.username,password:password(b.password),role:'viewer'});save();return send(res,201,{username:b.username,role:'viewer'})}
if(p.startsWith('/api/'))return send(res,404,{error:'Not found'});staticFile(res,p)
}catch(e){console.error(e);send(res,500,{error:'Server error'})}});
server.listen(port,()=>console.log(`Earth-Ex listening on http://localhost:${port}`));
