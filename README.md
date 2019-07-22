# jobsite

> Tools for working with [workspaces](https://yarnpkg.com/en/docs/workspaces) as
> defined by [Yarn](https://yarnpkg.com/en/), [Lerna](https://lerna.js.org/),
> [Bolt](http://boltpkg.com/), etc.

```sh
npm i jobsite
```

## Usage

```sh
Usage: jobsite [options] [command]

Options:
  -c, --concurrency [number]  The number of tasks to run at any given time. If true, then as many threads as possible are used.
  -p, --packages [glob]       Filters or finds workspaces that have a package.json and name that match the specified glob. If true, then it operates on all packages that have a name.
  -w, --workspaces <glob>     Filters or finds workspaces that have a path that match the specified glob.
  -h, --help                  output usage information

Commands:
  get                         Returns the available workspaces.
  run <cmd> [args...]         Runs <cmd> in each workspace and passes in <options>.
  npm <cmd> [args...]         Runs the specified npm commands, if they exist.
```

### `get`

> Returns the available workspaces.

```sh
$ jobsite get
$ jobsite get -w "packages/*"
```

### `run <cmd> [args...]`

> Runs `<cmd>` in each workspace and passes in `<options>`.

```sh
$ jobsite run ls
$ jobsite run -- ls -la
$ jobsite run -p "package*" -- ls -la
$ jobsite run -w "packages/*" -- ls -la
```

_It's recommended you use `--` so that you can pass arguments to the command you
want to run._

### `npm <cmd> [args...]`

> Runs the NPM script specified by `<cmd>` in all workspaces that have the
> specified script defined in their package.json.

```sh
$ jobsite npm test
$ jobsite npm -p "package*" test
$ jobsite npm -w "packages/*" test
```

## API

You can also use `jobsite` as a module.

A workspace can be defined as:

```ts
type Workspace = {
  path: string;
  package: null | { [s: string]: string };
};
```

For the following examples, let's assume that we have the following workspaces:

```js
const workspaces = [
  { path: "packages/a", package: { name: "a", scripts: { test: "jest" } } },
  { path: "packages/b", package: { name: "b", scripts: { test: "jest" } } }
];
```

And that we have a workspace definition in our `package.json` that looks like:

```json
{
  "workspaces": ["packages/*"]
}
```

Our directory structure looks like:

- packages
  - a/package.json
  - b/package.json

### `async getWorkspacesPatterns()`

> Returns an array of the defined workspaces or null if none are specified. It
> supports Bolt, Lerna and Yarn workspace definitions.

```js
const { getWorkspacesPatterns } = require("jobsite");

// ["packages/*"]
getWorkspacesPatterns().then(console.log);
```

_Not only does it support Bolt, Lerna and Yarn definitions, it supports anything
that [`cosmiconfig`])(https://github.com/davidtheclark/cosmiconfig) supports,
too. This means that you can define a `.workspacesrc` file next to several repos
if you wanted to, and manage them with jobsite!_

### `async getWorkspaces(glob: string | string[])`

> Expands the workspace glob into an array of `Workspace` objects.

If you don't specify `glob`, it will default to using `getWorkspacePatterns()`
instead.

```js
const { getWorkspaces } = require("jobsite");

// Uses what's defined in the workspaces spec.
getWorkspaces().then(console.log);

// Uses the explicit "packages/*" instead of what's defined in the
// workspaces spec.
getWorkspaces("packages/*").then(console.log);
```

## Filters

Filters are functions that return functions, than can be passed into
`Array.prototype.filter`.

### `filterByPackageName(glob: string)`

> Returns a function that filters the workspaces by matching the glob to the
> package name.

```js
const { filterByPackageName, getWorkspaces } = require("jobsite");

// Only returns package "b".
getWorkspaces()
  .then(filterByPackageName("b"))
  .then(console.log);
```

### `filterByPackageScript(script: string)`

> Returns a function that filters the workspaces that only have the specified
> script defined in their package.json, if one exists.

```js
const { filterByPackageScript, getWorkspaces } = require("jobsite");

// Returns both packages.
getWorkspaces()
  .then(filterByPackageScript("test"))
  .then(console.log);
```

### `filterByPath(glob: string)`

> Returns a function that filters the workspaces by matching their path to the
> package name.

```js
const { filterByPath, getWorkspaces } = require("jobsite");

// Only returns package "b".
getWorkspaces()
  .then(filterByPath("*/b"))
  .then(console.log);
```
