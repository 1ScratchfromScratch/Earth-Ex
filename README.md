# Earth-Ex

A browser-based personal movie website.

## Use it

Open the GitHub Pages site and click **Add movie**. Choose a movie file from your device, add its metadata, and click **Save movie**. The movie can then be watched from the library. Use the search box to find titles and open a movie to delete it.

Movie files and metadata are stored locally in the browser using IndexedDB. They are not uploaded to GitHub, so the library is private to that browser/device. Large files are limited by the storage available in the browser. This is the only way for a GitHub Pages site to store files without a backend service.

For the live page, enable GitHub Pages in repository settings with **Deploy from a branch**, branch `main`, folder `/ (root)`.
