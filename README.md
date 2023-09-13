# web-engineering website via 11ty

This website is being build using [Eleventy](https://www.11ty.dev/) site generator (using the [v2.0.1 release](https://www.11ty.dev/blog/eleventy-v2/)).

[![Netlify Status](https://api.netlify.com/api/v1/badges/802669dd-d5f8-4d49-963d-6d57b257c2a2/deploy-status)](https://app.netlify.com/sites/eleventy-base-blog/deploys)

## Getting Started

* [Want a more generic/detailed getting started guide?](https://www.11ty.dev/docs/getting-started/)

1. Make a directory and navigate to it:

```
mkdir web-engineering
cd web-engineering
```

2. Clone this Repository

```
git clone https://github.com/gwagner57/web-engineering.git .
```

_Optional:_ Review `.eleventy.js` and `package.json` to configure the site’s options and data.

3. Install dependencies

```
npm install
```

4. Run Eleventy

Generate a production-ready build to the `_site` folder:

```
npx @11ty/eleventy
```

Or build and host on a local development server:

```
npx @11ty/eleventy --serve |or| npm start
```

Or you can run [debug mode](https://www.11ty.dev/docs/debugging/) to see all the internals.

## Features of 11ty

- Using [Eleventy v2.0.1](https://www.11ty.dev/blog/eleventy-v2/) with zero-JavaScript output.
	- Content is exclusively pre-rendered (this is a static site).
	- Can easily [deploy to a subfolder without changing any content](https://www.11ty.dev/docs/plugins/html-base/)
	- All URLs are decoupled from the content’s location on the file system.
	- Configure templates via the [Eleventy Data Cascade](https://www.11ty.dev/docs/data-cascade/)


## Deploy this site

Deploy this Eleventy site in just a few clicks on these services:

- [Get your own Eleventy web site on CloudFlare](https://dash.cloudflare.com/f747cb028932291046c8c10e1f27d3d8/workers-and-pages/create/pages)
- If you run Eleventy locally you can use `_site` folder to check the output of the website.
- Deployment of website by connecting to the GitHub Repository to CloudFlare.
- On the build configurations in CloudFlare edit as noted:
- Framework present: `Eleventy`
- Build command: `npx eleventy`
- Build output directory: `_site`
- Read more about [Deploying an Eleventy project](https://www.11ty.dev/docs/deployment/) to the web.

### Implementation Notes

- `src/index.html` is the main homepage.
- `/_includes/` has the all the blog posts, forum posts, tutorials and all other html files which are needed to build the website.
- The `_includes`, `assets` folders in your input directory will be copied to the output folder (via `addPassthroughCopy` in the `.eleventy.js` file). 
- This project uses two [Eleventy Layouts](https://www.11ty.dev/docs/layouts/):
	- `_includes/layouts/base.html`: the top level HTML structure
	- `_includes/layouts/basetutorials.html`: also top level HTML structure
- Also, you can find two "head" files which are used to build the webpages, and contain the CSS links.
    - `_includes/basehead.html`
	- `_includes/basehead.html`

