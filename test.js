const {
  expandWorkspaces,
  filterWorkspaces,
  findWorkspaces,
  getWorkspaces
} = require(".");
const fs = require("fs-extra");

afterEach(async () => {
  await fs.remove(".boltrc");
  await fs.remove(".workspacesrc");
  await fs.remove("lerna.json");
});

test("getWorkspaces() returns workspaces", async () => {
  await fs.outputFile(".workspacesrc", '["workspaces"]');
  expect(await getWorkspaces()).toEqual(["workspaces"]);
});

test("getWorkspaces() returns bolt.workspaces", async () => {
  await fs.outputFile(".boltrc", '{ "workspaces": ["bolt"] }');
  expect(await getWorkspaces()).toEqual(["bolt"]);
});

test("getWorkspaces() returns lerna.packages", async () => {
  await fs.outputFile("lerna.json", '{ "packages": ["lerna"] }');
  expect(await getWorkspaces()).toEqual(["lerna"]);
});

test("getWorkspaces() prefers workspaces -> lerna -> bolt", async () => {
  await fs.outputFile(".workspacesrc", '["workspaces"]');
  await fs.outputFile(".boltrc", '{ "workspaces": ["bolt"] }');
  await fs.outputFile("lerna.json", '{ "packages": ["lerna"] }');
  expect(await getWorkspaces()).toEqual(["workspaces"]);

  await fs.remove(".workspacesrc");
  expect(await getWorkspaces()).toEqual(["lerna"]);

  await fs.remove("lerna.json");
  expect(await getWorkspaces()).toEqual(["bolt"]);

  await fs.remove(".boltrc");
  expect(await getWorkspaces()).toEqual(null);
});
