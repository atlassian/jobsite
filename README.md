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
