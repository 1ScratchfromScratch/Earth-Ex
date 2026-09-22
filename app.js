<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Earth-Ex</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <nav>
      <a class="brand" href="#">EARTH<span>-EX</span></a>
      <div class="nav-links">
        <a href="#library">Library</a>
        <a href="#about">About</a>
      </div>
      <button id="openEditor" class="outline">Edit library</button>
    </nav>

    <header class="hero">
      <div>
        <p class="eyebrow">YOUR PRIVATE SCREENING ROOM</p>
        <h1>Stories worth<br><em>remembering.</em></h1>
        <p class="hero-copy">A Plex-style home for the movies you love most.</p>
        <a class="primary" href="#library">Browse library <span>→</span></a>
      </div>
      <div class="hero-art">
        <div class="orb"></div>
        <div class="hero-card">
          <small>EARTH-EX / FEATURED</small>
          <strong id="featuredTitle">Your collection</strong>
        </div>
      </div>
    </header>

    <main id="library">
      <div class="section-head">
        <div>
          <p class="eyebrow">THE COLLECTION</p>
          <h2>All movies</h2>
        </div>
        <input id="search" type="search" placeholder="Search titles..." />
      </div>
      <div id="movies" class="grid"></div>
    </main>

    <section id="about" class="about">
      <p class="eyebrow">ABOUT EARTH-EX</p>
      <h2>Your movies.<br><em>Your metadata.</em></h2>
      <p>
        Earth-Ex is a personal library styled like a private streaming app. Add movie URLs,
        poster art, descriptions, genres, and release details right from this browser.
      </p>
    </section>

    <dialog id="movieDialog">
      <button class="close" type="button" onclick="movieDialog.close()">×</button>
      <img id="dialogPoster" alt="Movie poster" />
      <div class="dialog-info">
        <p id="dialogMeta" class="eyebrow"></p>
        <h2 id="dialogTitle"></h2>
        <p id="dialogDescription"></p>
        <a id="watchLink" class="primary" target="_blank" rel="noopener noreferrer">Watch movie <span>↗</span></a>
      </div>
    </dialog>

    <dialog id="editorDialog">
      <form id="editorForm">
        <button type="button" class="close" onclick="editorDialog.close()">×</button>
        <p class="eyebrow">LOCAL LIBRARY EDITOR</p>
        <h2>Add or edit a movie</h2>

        <input name="title" placeholder="Title" required />
        <input name="year" placeholder="Year" />
        <input name="genre" placeholder="Genre" />
        <input name="poster" placeholder="Poster image URL" />
        <input name="video" placeholder="Movie URL (MP4/WebM)" required />
        <textarea name="description" placeholder="Description"></textarea>

        <div class="dialog-actions">
          <button type="button" class="outline" onclick="editorDialog.close()">Cancel</button>
          <button type="submit" class="primary">Save movie</button>
        </div>
      </form>
    </dialog>

    <script src="app.js"></script>
  </body>
</html>
