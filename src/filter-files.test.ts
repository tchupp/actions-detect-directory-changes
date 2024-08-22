import filterFiles from "./index";

const allFiles = [
    ".circleci/config.yml",
    ".github/CODEOWNERS",
    ".github/settings.yml",
    ".github/stale.yml",
    ".github/workflows/terraform.yml",
    ".gitignore",
    ".config/.state",
    ".config/variables",
    "README.md",
    "_backend.tf",
    "examples/team_example.tf",
    "modules/README.md",
    "modules/admins/github.tf",
    "modules/admins/main.tf",
    "modules/admins/versions.tf",
    "modules/team/github.tf",
    "modules/team/main.tf",
    "modules/team/metadata.tf",
    "modules/team/pagerduty.tf",
    "modules/team/slack.tf",
    "modules/team/tfe.tf",
    "modules/team/versions.tf",
    "modules/team/engineers/main.tf",
    "modules/team/leads/main.tf",
    "provider.tf",
    "renovate.json",
    "scripts/github_team_members.sh",
    "teams.tf",
    "teams/fdsa.sh",
    "teams/README.md",
    "teams/shared/provider.tf",
    "teams/shared/versions.tf",
    "teams/team-a/main.tf",
    "teams/team-b/admins.tf",
    "teams/team-b/main.tf",
    "teams/team-c/main.tf",
    "teams/team-d/admins.tf",
    "teams/team-d/humans.tf",
    "teams/team-d/main.tf",
    "teams/team-e/main.tf",
    "teams/team-f/admins.tf",
    "teams/team-f/main.tf",
    "teams/team-g/main.tf",
    "teams/team-h/main.tf",
    "teams/team-i/main.tf",
    "teams/team-j/main.tf",
    "teams/team-k/main.tf",
    "teams/team-l/main.tf",
    "teams/team-m/main.tf",
    "teams/team-n/main.tf",
    "teams/team-o/main.tf",
    "teams/team-p/main.tf",
    "teams/team-q/admins.tf",
    "teams/team-r/main.tf",
    "teams/team-s/main.tf",
    "teams/team-t/main.tf",
    "teams/team-u/main.tf",
    "teams/team-v/admins.tf",
    "teams/team-w/main.tf",
    "teams/team-x/main.tf",
    "teams/team-y/main.tf",
    "teams/team-z/main.tf",
    "versions.tf",
];

const allModuleDirectories = [
    "modules/admins",
    "modules/team",
    "modules/team/engineers",
    "modules/team/leads",
];

const allTeamDirectories = [
    "teams/shared",
    "teams/team-a",
    "teams/team-b",
    "teams/team-c",
    "teams/team-d",
    "teams/team-e",
    "teams/team-f",
    "teams/team-g",
    "teams/team-h",
    "teams/team-i",
    "teams/team-j",
    "teams/team-k",
    "teams/team-l",
    "teams/team-m",
    "teams/team-n",
    "teams/team-o",
    "teams/team-p",
    "teams/team-q",
    "teams/team-r",
    "teams/team-s",
    "teams/team-t",
    "teams/team-u",
    "teams/team-v",
    "teams/team-w",
    "teams/team-x",
    "teams/team-y",
    "teams/team-z",
];

const allDirectories = [
    ".circleci",
    ".config",
    ".github",
    ".github/workflows",
    "examples",
    "modules",
    ...allModuleDirectories,
    "scripts",
    "teams",
    ...allTeamDirectories
];

describe("filterFiles", () => {
    describe("no include or exclude", () => {
        it("all undefined", () => {
            const result = filterFiles(
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
            );

            expect(result)
                .toStrictEqual([]);
        })

        it("all empty", () => {
            const result = filterFiles(
                "      ",
                "           ",
                "          ",
                "    ",
                "    ",
            );

            expect(result)
                .toStrictEqual([]);
        })

        it("all changes exist", () => {
            const result = filterFiles(
                "",
                "",
                "",
                allFiles.join(" "),
                allFiles.join(" "),
            );
            expect(result)
                .toStrictEqual([
                    ".",
                    ...allDirectories,
                ]);
        })

        it("removes directories that don't exist", () => {
            const result = filterFiles(
                "",
                "",
                "",
                allFiles.join(" "),
                allFiles.filter(f => !f.startsWith("teams/team")).join(" "),
            );

            expect(result)
                .toStrictEqual([
                    ".",
                    ...allDirectories.filter(d => !d.startsWith("teams/team")),
                ]);
        })

        it("keeps directories where only one file was removed", () => {
            const result = filterFiles(
                "",
                "",
                "",
                "modules/admins/github.tf",
                allFiles.filter(f => f != "modules/admins/github.tf").join(" "),
            );

            expect(result)
                .toStrictEqual([
                    "modules/admins",
                ]);
        })

        it("only includes directories that changed", () => {
            const result = filterFiles(
                "",
                "",
                "",
                [
                    "teams/team-a/main.tf",
                    "teams/team-b/admins.tf",
                    "teams/team-b/main.tf",
                    "teams/team-c/main.tf",
                    "teams/team-d/admins.tf",
                    "teams/team-d/humans.tf",
                    "teams/team-d/main.tf",
                    "teams/team-e/main.tf",
                    "teams/team-f/admins.tf",
                    "teams/team-f/main.tf",
                ].join(" "),
                allFiles.join(" "),
            );

            expect(result)
                .toStrictEqual([
                    "teams/team-a",
                    "teams/team-b",
                    "teams/team-c",
                    "teams/team-d",
                    "teams/team-e",
                    "teams/team-f",
                ]);
        })

        it("removes absolute paths", () => {
            const result = filterFiles(
                "",
                "",
                "",
                "/root non-root/thing.md",
                "/root non-root/thing.md",
            );

            expect(result)
                .toStrictEqual([
                    "non-root",
                ]);
        })

        it("normalizes path", () => {
            const result = filterFiles(
                "",
                "",
                "",
                "relative/path.md ./anchored/path.md",
                "relative/path.md ./anchored/path.md",
            );

            expect(result)
                .toStrictEqual([
                    "anchored",
                    "relative",
                ]);
        })
    })

    describe("includes", () => {
        it("returns a single directory (without './'), when a single directory is specified", () => {
            const result = filterFiles(
                "teams",
                "",
                "",
                allFiles.join(" "),
                allFiles.join(" "),
            );

            expect(result)
                .toStrictEqual([
                    "teams",
                ]);
        })

        it("returns multiple directories, when multiple directories are specified", () => {
            const result = filterFiles(
                ". teams",
                "",
                "",
                allFiles.join(" "),
                allFiles.join(" ")
            );

            expect(result)
                .toStrictEqual([
                    ".",
                    "teams",
                ]);
        })

        it.each([
            "./*",
            "*"
        ])("returns the immediate subdirectories, when using a single glob (%s)", (includedPaths) => {
            const result = filterFiles(
                includedPaths,
                "",
                "",
                allFiles.join(" "),
                allFiles.join(" ")
            );

            expect(result)
                .toStrictEqual(allDirectories.filter(d => !d.includes("/") && d !== "."));
        })

        it("returns immediate subdirectories of the specified single glob", () => {
            const result = filterFiles(
                "modules/*",
                "",
                "",
                allFiles.join(" "),
                allFiles.join(" ")
            );

            expect(result)
                .toStrictEqual([
                    "modules/admins",
                    "modules/team",
                ]);
        })

        it.each([
            "./**",
            "!. ./**",
        ])("returns all directories except the root, when using a double glob (%s)", (includedPaths) => {
            const result = filterFiles(
                includedPaths,
                "",
                "",
                allFiles.join(" "),
                allFiles.join(" ")
            );

            expect(result)
                .toStrictEqual(allDirectories.filter(d => d !== "."));
        })

        it.each([
            "!teams",
        ])("returns root directory, when using a negative double glob (%s)", (includedPaths) => {
            const result = filterFiles(
                includedPaths,
                "",
                "",
                allFiles.join(" "),
                allFiles.join(" ")
            );

            expect(result)
                .toStrictEqual([
                    ".",
                    ...allDirectories.filter(d => d !== "teams")
                ]);
        })

        it.each([
            "./** !teams",
            "** !teams",
        ])("does not return root directory, when using a double glob with a negative (%s)", (includedPaths) => {
            const result = filterFiles(
                includedPaths,
                "",
                "",
                allFiles.join(" "),
                allFiles.join(" ")
            );

            expect(result)
                .toStrictEqual(allDirectories.filter(d => d !== "teams"));
        })

        it.each([
            "./** !teams/ !./teams/**",
            "./** !teams !teams/**",
            "** !teams !teams/**",
        ])("matches double glob with a negative double glob (%s)", (includedPaths) => {
            const result = filterFiles(
                includedPaths,
                "",
                "",
                allFiles.join(" "),
                allFiles.join(" ")
            );

            expect(result)
                .toStrictEqual([
                    ".circleci",
                    ".config",
                    ".github",
                    ".github/workflows",
                    "examples",
                    "modules",
                    "modules/admins",
                    "modules/team",
                    "modules/team/engineers",
                    "modules/team/leads",
                    "scripts",
                ]);
        })

        it("returns all subdirectories of the specified double glob", () => {
            const result = filterFiles(
                "./modules/**",
                "",
                "",
                allFiles.join(" "),
                allFiles.join(" ")
            );

            expect(result)
                .toStrictEqual([
                    "modules/admins",
                    "modules/team",
                    "modules/team/engineers",
                    "modules/team/leads",
                ]);
        })

        it.each([
            "./modules/** !./modules/admins",
            "./modules/** !./modules/admins, ",
        ])("returns all subdirectories except excluded of the specified double glob (%s)", (includedPaths) => {
            const result = filterFiles(
                includedPaths,
                "",
                "",
                allFiles.join(" "),
                allFiles.join(" ")
            );

            expect(result)
                .toStrictEqual([
                    "modules/team",
                    "modules/team/engineers",
                    "modules/team/leads",
                ]);
        })
    });

    describe("excludes", () => {
        it("returns all directories except the exact exclusions", () => {
            const result = filterFiles(
                "!teams/shared, !modules/team",
                "",
                "",
                allFiles.join(" "),
                allFiles.join(" "),
            );

            expect(result)
                .toStrictEqual([
                    ".",
                    ...allDirectories.filter(d => d !== "teams/shared" && d !== "modules/team"),
                ]);
        })

        it("returns all directories except the immediate subdirectories, when single glob", () => {
            const result = filterFiles(
                "!./*",
                "",
                "",
                allFiles.join(" "),
                allFiles.join(" ")
            );

            expect(result)
                .toStrictEqual([
                    ".",
                    ...allDirectories.filter(d => d.includes("/")),
                ]);
        })

        it("returns all directories except the immediate subdirectories of the excluded, when single glob", () => {
            const result = filterFiles(
                "!modules/*",
                "",
                "",
                allFiles.join(" "),
                allFiles.join(" ")
            );

            expect(result)
                .toStrictEqual([
                    ".",
                    "modules",
                    "modules/team/engineers",
                    "modules/team/leads",
                    ...allDirectories.filter(d => !d.startsWith("modules")),
                ].sort());
        })

        it.each([
            "!**",
            "!./**",
        ])("return only root directory, when using double glob exclusion (%s)", (includedPaths) => {
            const result = filterFiles(
                includedPaths,
                "",
                "",
                allFiles.join(" "),
                allFiles.join(" ")
            );

            expect(result)
                .toStrictEqual([
                    ".",
                ]);
        })

        it("matches double glob at the root", () => {
            const result = filterFiles(
                "!**",
                "",
                "",
                allFiles.join(" "),
                allFiles.join(" ")
            );

            expect(result)
                .toStrictEqual([
                    ".",
                ]);
        })

        it("removes recursive directories, when using a double glob in a subdirectory", () => {
            const result = filterFiles(
                "!./modules/**",
                "",
                "",
                allFiles.join(" "),
                allFiles.join(" ")
            );

            expect(result)
                .toStrictEqual([
                    ".",
                    ...allDirectories.filter(d => !d.startsWith("modules/")),
                ].sort());
        })

        it("includes recursive directories, when using a double glob in a subdirectory", () => {
            const result = filterFiles(
                "./modules/**",
                "",
                "",
                allFiles.join(" "),
                allFiles.join(" ")
            );

            expect(result)
                .toStrictEqual([
                    "modules/admins",
                    "modules/team",
                    "modules/team/engineers",
                    "modules/team/leads"
                ]);
        })
    })

    describe("return all if changed", () => {
        it("returns empty when no changes", () => {
            const result = filterFiles(
                "",
                "",
                "teams/shared",
                "",
                allFiles.join(" ")
            );

            expect(result)
                .toStrictEqual([]);
        })

        it("returns all when included is empty and 'modules' has changes", () => {
            const result = filterFiles(
                "**",
                "",
                "modules/**",
                "modules/admins/main.tf",
                allFiles.join(" ")
            );

            expect(result)
                .toStrictEqual(allDirectories);
        })

        it("returns all included when 'modules' has changes", () => {
            const result = filterFiles(
                "teams/**",
                "",
                "modules/**",
                "modules/admins/main.tf",
                allFiles.join(" ")
            );

            expect(result)
                .toStrictEqual(allTeamDirectories);
        })

        it("returns all non-excluded when 'modules' has changes", () => {
            const result = filterFiles(
                "!. !./modules/**",
                "",
                "modules/**",
                "modules/admins/main.tf",
                allFiles.join(" ")
            );

            expect(result)
                .toStrictEqual(allDirectories.filter(d => !d.startsWith("modules/")));
        })

        it("returns all included when there are multiple 'return all' filters and 'modules' has changes", () => {
            const result = filterFiles(
                "teams/** !teams/shared",
                "",
                "modules/teams, modules/admins",
                "modules/admins/main.tf",
                allFiles.join(" ")
            );

            expect(result)
                .toStrictEqual(allTeamDirectories.filter(d => d !== "teams/shared"));
        })
    });

    describe("included extensions", () => {
        it("returns only directories with changed files with included extensions", () => {
            const result = filterFiles(
                "",
                "tf",
                "",
                allFiles.join(" "),
                allFiles.join(" ")
            );

            expect(result)
                .toStrictEqual([
                    ".",
                    "examples",
                    ...allModuleDirectories,
                    ...allTeamDirectories,
                ]);
        })

        it("returns all directories with tf files, when a GHA workflow changed", () => {
            const result = filterFiles(
                "",
                "tf",
                ".github/**",
                ".github/workflows/terraform.yml",
                allFiles.join(" ")
            );

            expect(result)
                .toStrictEqual([
                    ".",
                    "examples",
                    ...allModuleDirectories,
                    ...allTeamDirectories,
                ]);
        })

        it("returns all directories without md files, when a GHA workflow changed", () => {
            const result = filterFiles(
                "",
                "!.md",
                ".github/**",
                ".github/workflows/terraform.yml",
                allFiles.join(" ")
            );

            expect(result)
                .toStrictEqual([
                    ".",
                    ".circleci",
                    ".config",
                    ".github",
                    ".github/workflows",
                    "examples",
                    ...allModuleDirectories,
                    "scripts",
                    "teams",
                    ...allTeamDirectories,
                ]);
        })
    });
})
