@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:ital,wght@0,600;1,600&display=swap');

:root {
  --bg: #0b0f12;
  --panel: #12191e;
  --muted: #9aa3a5;
  --gold: #d6a75d;
  --line: #273137;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: #f1f0ea;
  font: 15px 'DM Sans', sans-serif;
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.7'/%3E%3C/svg%3E");
}

nav {
  height: 78px;
  padding: 0 6vw;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ffffff12;
  gap: 44px;
}

.brand {
  font-weight: 700;
  letter-spacing: 4px;
  color: #f1f0ea;
  text-decoration: none;
}

.brand span { color: var(--gold); }

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-links a {
  color: var(--muted);
  text-decoration: none;
}

.outline,
.primary,
.watch-btn {
  border: 1px solid var(--gold);
  background: transparent;
  color: var(--gold);
  padding: 11px 17px;
  border-radius: 3px;
  font: inherit;
  cursor: pointer;
}

.outline {
  margin-left: auto;
}

.primary {
  display: inline-flex;
  gap: 25px;
  align-items: center;
  background: var(--gold);
  color: #101418;
  text-decoration: none;
  font-weight: 700;
}

.hero {
  min-height: 570px;
  padding: 100px 12vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: radial-gradient(circle at 75% 40%, #25353a 0, #111a1e 25%, transparent 52%);
}

.eyebrow {
  color: var(--gold);
  font-size: 11px;
  letter-spacing: 2px;
  font-weight: 700;
}

.hero h1 {
  font-size: clamp(50px, 7vw, 96px);
  line-height: 0.98;
  margin: 20px 0;
  font-weight: 500;
  letter-spacing: -3px;
}

.hero h1 em,
.about h2 em {
  font-family: 'Playfair Display', serif;
  color: var(--gold);
}

.hero-copy {
  color: var(--muted);
  font-size: 18px;
  margin-bottom: 35px;
}

.hero-art {
  width: 350px;
  height: 350px;
  position: relative;
}

.orb {
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: linear-gradient(140deg, #344e4d, #0b1114 65%);
  box-shadow: 0 0 100px #54716e44;
  margin: 25px auto;
}

.hero-card {
  position: absolute;
  right: 0;
  bottom: 25px;
  background: #12191ecc;
  border: 1px solid #ffffff18;
  padding: 18px 24px;
  display: grid;
  gap: 8px;
  min-width: 220px;
}

.hero-card small {
  color: var(--gold);
  font-size: 9px;
  letter-spacing: 1px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: end;
  margin-bottom: 35px;
}

.section-head h2,
.about h2 {
  font-size: 42px;
  font-weight: 500;
  margin: 8px 0;
}

.section-head input {
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--line);
  color: white;
  padding: 12px;
  width: 230px;
  font: inherit;
}

.section-head input:focus {
  outline: 0;
  border-color: var(--gold);
}

main {
  padding: 75px 8vw;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 22px;
}

.movie {
  background: var(--panel);
  border: 1px solid #ffffff0d;
  cursor: pointer;
  transition: 0.25s;
  overflow: hidden;
}

.movie:hover {
  transform: translateY(-5px);
  border-color: #d6a75d88;
}

.poster {
  height: 285px;
  background: #182126 center/cover;
  display: grid;
  place-items: center;
  color: var(--gold);
  font-size: 55px;
}

.movie-copy {
  padding: 21px;
}

.movie h3 {
  font-size: 23px;
  margin: 9px 0;
}

.movie-copy p:not(.eyebrow) {
  color: var(--muted);
  line-height: 1.5;
  min-height: 45px;
}

.watch-btn {
  font-size: 12px;
  padding: 8px 12px;
}

.about {
  padding: 100px 12vw;
  background: #11191d;
  max-width: 100%;
}

.about h2 { font-size: 60px; }

.about > p:last-child {
  color: var(--muted);
  max-width: 500px;
  line-height: 1.7;
}

dialog {
  border: 1px solid var(--line);
  background: #12191e;
  color: #f1f0ea;
  max-width: 760px;
  width: calc(100% - 30px);
  padding: 0;
  display: grid;
  grid-template-columns: 260px 1fr;
  box-shadow: 0 20px 80px #000;
}

.close {
  position: absolute;
  right: 13px;
  top: 8px;
  background: none;
  border: 0;
  color: white;
  font-size: 28px;
  cursor: pointer;
}

.dialog-info {
  padding: 55px 35px;
}

.dialog-info h2 {
  font-size: 42px;
  font-weight: 500;
}

.dialog-info p:not(.eyebrow) {
  color: var(--muted);
  line-height: 1.7;
}

#dialogPoster {
  width: 260px;
  height: 390px;
  object-fit: cover;
  background: #182126;
}

dialog::backdrop {
  background: #000b;
}

#editorDialog {
  padding: 35px;
  max-width: 520px;
}

#editorForm {
  display: grid;
  gap: 10px;
}

#editorForm h2 {
  font-size: 32px;
  font-weight: 500;
}

input, textarea {
  width: 100%;
  background: #0b0f12;
  color: white;
  border: 1px solid var(--line);
  padding: 13px;
  font: inherit;
}

textarea {
  min-height: 110px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}

.empty {
  color: var(--muted);
}

@media (max-width: 700px) {
  nav {
    padding: 0 20px;
  }

  .nav-links {
    display: none;
  }

  .hero {
    padding: 70px 25px;
    min-height: 500px;
  }

  .hero-art {
    display: none;
  }

  main {
    padding: 55px 20px;
  }

  .section-head {
    align-items: start;
    gap: 20px;
    flex-direction: column;
  }

  .about {
    padding: 70px 25px;
  }

  .about h2 {
    font-size: 42px;
  }

  dialog {
    grid-template-columns: 1fr;
  }

  #dialogPoster {
    width: 100%;
    height: 240px;
  }

  .dialog-info {
    padding: 25px;
  }
}
