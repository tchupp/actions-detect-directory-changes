# GitHub Actions: Detect Directory Changes

GitHub Action for gathering directories with changed files.

## Usage

This action can be used as follows:

```yaml
      - uses: tchupp/actions-detect-directory-changes@v1
        with:
          included-paths: ""
          included-extensions: ""
          if-these-paths-change-return-all-included-paths: ""
```

## Background

### [Shut up and show me the copy/paste](#examples)

There are many existing GitHub Actions that allow you to detect the files that have changed:

- https://github.com/tj-actions/changed-files
- https://github.com/trilom/file-changes-action
- https://github.com/UnicornGlobal/has-changes-action

However, none of the existing solutions will group these changes files by the directory that changed.

Some projects have multiple sub-projects with separate builds in one git repository.  
Let's say your repo looked like this:

```bash
$ tree
.
├── my-awesome-nodejs-app
│   ├── index.ts
│   └── package.json
└── a-neat-rust-project
    ├── Cargo.toml
    └── main.rs

2 directories, 4 files
```

It would be fairly reasonable to configure a GitHub Actions workflow that ran the build for each of your sub-projects:

```yaml
on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
    paths:
      - '.github/workflows/build.yml'

jobs:
  build:
    name: "Build sub-projects"
    runs-on: ubuntu-latest
    strategy:
      matrix:
        project:
          - my-awesome-nodejs-app
          - a-neat-rust-project
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Build ${{ matrix.project }}
        working-directory: ./${{ matrix.project }}
        run: ./build.sh
```

With this type of setup, you end up waiting for all your sub-projects to build every push; causing you to spend a huge
amount on CI time for sub-projects that didn't even change!

### That's where this action comes into play.

Using this action, you can detect the paths of files that have changed since your last push!  
You can use the output of this action to determine which sub-projects need to build.

```yaml
on: <omitted for brevity, same as above>

jobs:
  detect-directory-changes:
    name: "Detect Directory Changes"
    runs-on: ubuntu-latest
    outputs:
      changed: ${{ steps.detect.outputs.changed }}
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Detect Directory Changes
        id: detect
        uses: tchupp/actions-detect-directory-changes@v1

  build:
    name: "Build sub-projects"
    runs-on: ubuntu-latest
    strategy:
      matrix:
        project: ${{ fromJSON(needs.detect-directory-changes.outputs.changed) }}
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Build ${{ matrix.project }}
        working-directory: ./${{ matrix.project }}
        run: ./build.sh
```

Given our original repo layout, let's say a commit gets pushed where only `my-awesome-nodejs-app` is changed.  
When the example workflow runs, this action would output a JSON array containing a list of the changed paths:

```json
[
  "my-awesome-nodejs-app"
]
```

This is then used to build the `matrix` for the job that runs the build.  
By using this action, we have saved tons of CI time by skipping the build for configuration sets that didn't change!

## Full Usage

This action can be used as follows:

```yaml
      - uses: tchupp/actions-detect-directory-changes@v1
        with:
          included-paths: ""
          included-extensions: "" // ex. "md,txt" OR "java,kotlin" etc.
```

### Assumptions

The most common cause for issues involves a mismatch in expectations.  
Please read below to make sure your setup aligns with the assumptions made by this action.

#### Setup

This action expects that the repo has been checked out.  
The following snippet from an example job, [which can be found below](#simple-setup).

```yaml
...
steps:
  - name: Checkout
    uses: actions/checkout@v2
...
```

#### Repo Layout

This action is only really useful when you have multiple projects in a single repo.  
For instance if your repo only had a project set, this action might be overkill:

```bash
$ tree
.
└── my-awesome-nodejs-app
    ├── index.ts
    └── package.json

1 directories, 2 files
```

With a simple repo layout like this, it's sufficient to use `path` filters with GitHub Actions.

### Inputs

Given the number of possible combinations of inputs, some possible use-cases may not be explicitly covered below.

#### included-paths

**Optional**. Comma-separated paths to narrow down the search for changes.  
Respects "unix style" path globbing.  
Defaults to all if not specified.

There are a lot of interesting use-cases for this input.

#### included-extensions

**Optional**. Comma-separated file extensions to narrow down the search for changes. Defaults to all if not specified.

There are a lot of interesting use-cases for this input.

#### if-these-paths-change-return-all-included-paths

**Note: I know the name is long and a little clunky, but it somewhat accurately describes how it works. Naming is hard.**

**Optional**. Comma-separated paths to act as an override for the "changed" paths.  
For example you may want to rebuild everything if a change is detected in your CI configuration, 
or you may want to rebuild everything if a change is detected in a shared library.  
The possibilities are endless!


Respects "unix style" path globbing.  
Defaults to all if not specified.

There are a lot of interesting use-cases for this input.

## Examples

### Simple Setup

This is a simplified example based on the setup at the beginning. If your repo has multiple sub-projects sets and
doesn't have any top-level build:

```bash
$ tree
.
├── my-awesome-nodejs-app
│   ├── index.ts
│   └── package.json
└── a-neat-rust-project
    ├── Cargo.toml
    └── main.rs

2 directories, 4 files
```

Then your `.github/workflows/build.yml` file could use this:

```yaml
on: <omitted for brevity, same as above>

jobs:
  detect-directory-changes:
    name: "Detect Directory Changes"
    runs-on: ubuntu-latest
    outputs:
      changed: ${{ steps.detect.outputs.changed }}
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Detect Directory Changes
        id: detect
        uses: tchupp/actions-detect-directory-changes@v1

  build:
    name: "Build sub-projects"
    runs-on: ubuntu-latest
    strategy:
      matrix:
        project: ${{ fromJSON(needs.detect-directory-changes.outputs.changed) }}
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Build ${{ matrix.project }}
        working-directory: ./${{ matrix.project }}
        run: ./build.sh
```

### Simple Setup with CI Configuration

This is a slightly more complete use-case.
If you were to include this action in your repo, you would likely have a `.github` directory that wouldn't contain a `./build.sh` script.

```bash
$ tree
.
├── .github
│   └── workflows
│       └── build.yml
├── my-awesome-nodejs-app
│   ├── index.ts
│   └── package.json
└── a-neat-rust-project
    ├── Cargo.toml
    └── main.rs

4 directories, 5 files
```

There are a few possible ways to handle this situation:

#### Option 1: Use `included-extensions`

You could use `included-extensions` to ignore changes to `.yml` files, however this might prevent detection of changes in project-level `.yml` files:

```yaml
on: <omitted for brevity, same as above>

jobs:
  detect-directory-changes:
    name: "Detect Directory Changes"
    runs-on: ubuntu-latest
    outputs:
      changed: ${{ steps.detect.outputs.changed }}
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Detect Directory Changes
        id: detect
        uses: tchupp/actions-detect-directory-changes@v1
        with:
          included-extensions: "!*.yml"

  build: <omitted for brevity, same as above>
```

#### Option 2: Use `included-paths`

You could use `included-paths` to only detect changes in the sub-projects, however this would require you to change some sub-project files anytime you wanted to trigger a rebuild:

```yaml
on: <omitted for brevity, same as above>

jobs:
  detect-directory-changes:
    name: "Detect Directory Changes"
    runs-on: ubuntu-latest
    outputs:
      changed: ${{ steps.detect.outputs.changed }}
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Detect Directory Changes
        id: detect
        uses: tchupp/actions-detect-directory-changes@v1
        with:
          included-paths: "!./.github/**"

  build: <omitted for brevity, same as above>
```


#### Option 3: Use `if-these-paths-change-return-all-included-paths`

With this configuration, the action would still correctly detect changes in the sub-projects,
but would also trigger a rebuild on **all** sub-projects if any changes were detected in the `.github` directory:

```yaml
on: <omitted for brevity, same as above>

jobs:
  detect-directory-changes:
    name: "Detect Directory Changes"
    runs-on: ubuntu-latest
    outputs:
      changed: ${{ steps.detect.outputs.changed }}
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Detect Directory Changes
        id: detect
        uses: tchupp/actions-detect-directory-changes@v1
        with:
          included-paths: "!./.github/**"
          if-these-paths-change-return-all-included-paths: "./.github/**"

  build: <omitted for brevity, same as above>
```
