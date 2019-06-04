# jobsite

> Tools for working with workspaces as defined by Yarn, Bolt, Lerna, etc.

```sh
npm i jobsite
```

## Usage

```sh
Usage: jobsite [options] [command]

Options:
  -w, --workspaces <glob>  Filters or finds workspaces that match the specified pattern.
  -h, --help               output usage information

Commands:
  get                      Returns the available workspaces.
  run <cmd> [args...]      Runs <cmd> in each workspace and passes in <options>.
```

## CLI

Global options:

- `-w, --workspaces <glob>` - Filters or finds workspaces that match the
  specified pattern. If `workspaces` are defined in your project (i.e.
  `package.json`), the pattern is used to filter them. If no `workspaces` are
  defined, it is used to glob for directories relative to the `cwd`. The `cwd`
  is used by default.

### `get`

> Returns the available workspaces.

```sh
$ jobsite get
$ jobsite get -w "packages/*"
```

### `run <cmd> [args...]`

> Runs <cmd> in each workspace and passes in <options>.

```sh
$ jobsite run ls
$ jobsite run -- ls -la
$ jobsite run -w "packages/*" -- ls -la
```

_It's recommended you use `--` so that you can pass arguments to the command you
want to run._

## API

You can also use `jobsite` as a module.

### `expandWorkspaces(wsGlobs)`

> Expands the workspace globs into relative directory paths.

```js
const { expandWorkspaces } = require("jobsite");

// ["packages/a", "packages/b"]
expandWorkspaces("packages/*");
```

### `async function filterWorkspaces(pattern)`

> Filters workspaces that match the specified pattern.

```js
const { filterWorkspaces } = require("jobsite");

// ["packages/a"]
filterWorkspaces("packages/a");
```

### `async function findWorkspaces(pattern)`

> Finds workspaces that match the given pattern. If no workspaces are defined,
> the pattern is used to glob for directories.

```js
const { findWorkspaces } = require("jobsite");

// ["packages/a", "packages/b"]
findWorkspaces("packages/*");
```

### `async function getWorkspaces()`

> Returns an array of the defined workspaces or null if none are specified.

```js
const { getWorkspaces } = require("jobsite");

// ["packages/*"]
getWorkspaces();
```
