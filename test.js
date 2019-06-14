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
});

test("getWorkspaces() returns workspaces", async () => {
  await fs.outputFile(".workspacesrc", '["workspaces"]');
  expect(await getWorkspaces()).toEqual(["workspaces"]);
});

test("getWorkspaces() returns bolt.workspaces", async () => {
  await fs.outputFile(".boltrc", '{ workspaces: ["bolt"] }');
  expect(await getWorkspaces()).toEqual(["bolt"]);
});

test("getWorkspaces() prefers workspaces if both are specified", async () => {
  await fs.outputFile(".workspacesrc", '["workspaces"]');
  await fs.outputFile(".boltrc", '{ workspaces: ["bolt"] }');
  expect(await getWorkspaces()).toEqual(["workspaces"]);
  await fs.remove(".workspacesrc");
  await fs.remove(".boltrc");
});
