const cosmiconfig = require("cosmiconfig");
const globby = require("globby");
const minimatch = require("minimatch");

// Expands the workspace globs into relative directory paths.
async function expandWorkspaces(wsGlobs) {
  return await globby(wsGlobs, {
    expandDirectories: false,
    onlyDirectories: true
  });
}

// Filters workspaces that match the specified pattern.
async function filterWorkspaces(pattern) {
  const wsGlobs = await getWorkspaces();
  const wsPaths = await expandWorkspaces(wsGlobs);
  return pattern ? minimatch.match(wsPaths, pattern) : wsPaths;
}

// Finds workspaces that match the given pattern. If no workspaces are defined, the pattern is used to glob for directories.
async function findWorkspaces(pattern) {
  const wsGlobs = await getWorkspaces();
  return wsGlobs ? filterWorkspaces(pattern) : expandWorkspaces(pattern || ".");
}

// Returns the defined workspaces.
async function getWorkspaces() {
  const search = await cosmiconfig("workspaces").search();
  return search ? search.config : null;
}

module.exports = {
  expandWorkspaces,
  filterWorkspaces,
  findWorkspaces,
  getWorkspaces
};
