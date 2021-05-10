<img src="https://cdn.edge.network/assets/img/edge-logo-green.svg" width="200">

# wallet

Web wallet for managing XE coin

## Contributor guidelines

### Design

For the design work, please use the `design` branch of `edge/wallet`.

### Git commit format

We use semantic prefixes for commit messages. These include:

- `feat:` for features
- `fix:` for fixes
- `chore:` for chores
- `docs:` for docs
- `refactor:` for refactoring
- `debug:` for debugging
- `test:` for tests/test related commits

In addition to this, we use imperitive messages, for example:

`feat: add create wallet functionality`

Finally, we keep all commit messages in lowercase, with no end of sentence punctuation.

### Vue/TailwindCSS/Heroicons

For this and future web applicationsm, we'll be using a combination of Vue 3, TailwindCSS, and Heroicons. This application has been setup and configured for this, and should work out of the box.

There are three npm scripts: `npm run dev`, `npm run build`, and of course `npm start`. The non-dev start script uses a local server, but working with the dev server should be sufficient.
