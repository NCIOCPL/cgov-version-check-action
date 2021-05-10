# Cgov Version Check

Performs a number of checks on a package to ensure it can be published.

## Input Params

**Unless marked otherwise you will want to use GitHub Repo secrets to secure the input parameters!**
**All input parameters are required!**

- `package-type` - The type of package. For now, only "npm" is allowed.
- `checks-to-perform` - A comma separated lists of checks to perform. All of these checks will be evaluated to determine if the package can be published.
  - The valid "npm" checks are:
    - 'isGreaterVersion' - Is the package version greater than the previous commit.
    - 'hasNeverBeenPublished' - Ensures there is no package in the registry with the same version.
    - 'hasNeverBeenReleased' - Ensure there is no release tag for the same version
- `repo-token`: The GITHUB_TOKEN secret

## Developing

The package-types allowed are the direct folders under `src/lib`. Currently `npm` is the only allowed package types. (In the future we could allow for `nuget`)

The allowed `checks-to-perform` are defined by what the index.js in the `package-type` directory exports. For example the following is in `src/lib/npm/index.js`:

```
const isGreaterVersion = require('./is-greater-version');
const hasNeverBeenPublished = require('./has-never-been-published');
const hasNeverBeenReleased = require('./has-never-been-released');

module.exports = {
	isGreaterVersion,
	hasNeverBeenPublished,
	hasNeverBeenReleased,
};
```

So, just as the docs say, `isGreaterVersion`, `hasNeverBeenPublished` and `hasNeverBeenReleased` are the valid `npm` checks.

Each check module exports an async fuction that accepts 2 parameters:

1. `octokit` - an octokit client authenticated with the token passed in as repo-token
2. `context` - the actions's context. See the github.context from @actions/github for more details on the specific values.

The check should return true if the version is valid, and false if not.

### Make your own check

1. Create a js module under the package-type folder (e.g. `npm`)
   - The module should export a function that takes 2 parameters, octokit and context.
   - The funtion should return true if it is a valid version, or false if not
2. Make tests for your module
3. Re-export the module in the package-type folder's index.js

## Development Release instructions:

1. Create a branch
2. Make your changes
3. Before you commit, make sure you run `npm build` to create the dist
4. Create a PR for

## Integration Testing Hints

> _**NOTE:**_ The following works for simple tests. Understand @actions/github requires a whole lot more in the environment. You will need to see @actions/github/lib/context for more details on what exactly you need to set / what you expect to get.

Sometimes you just need to step through code or see the responses from Akamai. Github Action inputs are just environment variables, but, if the variable name has a dash then life gets complicated. You can use the following to execute a bash shell with all the environment vars setup. This is all one line.

```
env 'INPUT_PACKAGE-TYPE=npm' env 'INPUT_CHECKS-TO-PERFORM=' env 'INPUT_REPO-TOKEN=***' bash
```

Then inside the bash shell you can run `src/main.js`.

> **_Note:_** in the above all secrets have been masked.
