# pwai.dev

[Open the project catalog](https://pwai.dev/).

A static gallery of Pete Wai's AI-generated personal research sites, experiments, and prototypes. Catalog refreshes are manual. GitHub Pages publishes the committed root from `main`.

Start with [AGENTS.md](AGENTS.md) for the complete workflow, discovery rules, screenshot recipe, illustration prompts, and release checks.

```sh
mise trust
mise install
mise exec -- npm ci
mise exec -- npm run discover
mise exec -- npm run images
mise exec -- npm run build
mise exec -- npm run check -- --discovery
mise exec -- npm test
mise exec -- npm run preview
```

Preview: http://127.0.0.1:4173. No runtime JavaScript or external services are required to read the catalog. `discover` reads GitHub and writes an ignored report; it never edits catalog entries automatically.

Authored metadata: `data/catalog.json`. Original artwork and captures: `sources/`. Shared art direction and exact generation prompts: `data/art-direction.json`. Optimized public images: `assets/images/`. Deployment and QA records: `maintenance/`.
