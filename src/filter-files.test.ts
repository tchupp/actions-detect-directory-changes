import filterFiles from "./index";

describe("filterFiles", () => {

    describe("no include or exclude", () => {

        it("all undefined", () => {
            const result = filterFiles(
                undefined,
                undefined,
                undefined,
                undefined
            );

            expect(result)
                .toStrictEqual([]);
        })

        it("all empty", () => {
            const result = filterFiles(
                "      ",
                "           ",
                "          ",
                "    "
            );

            expect(result)
                .toStrictEqual([]);
        })

        it("all changes exist", () => {
            const result = filterFiles(
                "",
                "",
                "dev staging production modules/humans modules/teams/engineers modules/teams/leads",
                "dev staging production modules/humans modules/teams/engineers modules/teams/leads"
            );

            expect(result)
                .toStrictEqual([
                    "dev",
                    "staging",
                    "production",
                    "modules/humans",
                    "modules/teams/engineers",
                    "modules/teams/leads",
                ]);
        })

        it("removes directories that don't exist", () => {
            const result = filterFiles(
                "",
                "",
                "dev staging production modules/humans modules/teams/engineers modules/teams/leads",
                "dev staging production modules/humans modules/teams/engineers"
            );

            expect(result)
                .toStrictEqual([
                    "dev",
                    "staging",
                    "production",
                    "modules/humans",
                    "modules/teams/engineers",
                ]);
        })

        it("only includes directories that changed", () => {
            const result = filterFiles(
                "",
                "",
                "modules/humans modules/teams/engineers",
                "dev staging production modules/humans modules/teams/engineers modules/teams/leads"
            );

            expect(result)
                .toStrictEqual([
                    "modules/humans",
                    "modules/teams/engineers",
                ]);
        })

        it("removes absolute paths", () => {
            const result = filterFiles(
                "",
                "",
                "/root dev staging production modules/humans modules/teams/engineers modules/teams/leads",
                "/root dev staging production modules/humans modules/teams/engineers modules/teams/leads"
            );

            expect(result)
                .toStrictEqual([
                    "dev",
                    "staging",
                    "production",
                    "modules/humans",
                    "modules/teams/engineers",
                    "modules/teams/leads",
                ]);
        })

        it("normalizes paths", () => {
            const result = filterFiles(
                "",
                "",
                "modules/teams/leads/",
                "modules/teams/leads"
            );

            expect(result)
                .toStrictEqual([
                    "modules/teams/leads",
                ]);
        })
    })

    const allDirectories = ". ./dev ./staging ./production ./modules ./modules/humans ./modules/teams/engineers ./modules/teams/leads";

    describe("includes", () => {
        it("matches single directory (without './') exactly", () => {
            const result = filterFiles(
                "dev",
                "",
                "./dev",
                "./dev"
            );

            expect(result)
                .toStrictEqual([
                    "dev",
                ]);
        })

        it("matches multiple directories exactly", () => {
            const result = filterFiles(
                ". dev",
                "",
                allDirectories,
                allDirectories
            );

            expect(result)
                .toStrictEqual([
                    ".",
                    "dev",
                ]);
        })

        it("matches single glob", () => {
            const result = filterFiles(
                "./*",
                "",
                allDirectories,
                allDirectories
            );

            expect(result)
                .toStrictEqual([
                    "dev",
                    "staging",
                    "production",
                    "modules",
                ]);
        })

        it("matches single glob in a subdirectory", () => {
            const result = filterFiles(
                "modules/*",
                "",
                allDirectories,
                allDirectories
            );

            expect(result)
                .toStrictEqual([
                    "modules/humans",
                ]);
        })

        it("matches double glob", () => {
            const result = filterFiles(
                "./**",
                "",
                allDirectories,
                allDirectories
            );

            expect(result)
                .toStrictEqual([
                    "dev",
                    "staging",
                    "production",
                    "modules",
                    "modules/humans",
                    "modules/teams/engineers",
                    "modules/teams/leads",
                ]);
        })

        it("matches double glob in a subdirectory", () => {
            const result = filterFiles(
                "./modules/**",
                "",
                allDirectories,
                allDirectories
            );

            expect(result)
                .toStrictEqual([
                    "modules/humans",
                    "modules/teams/engineers",
                    "modules/teams/leads",
                ]);
        })

        it("matches double glob in a subdirectory with a negative", () => {
            const result = filterFiles(
                "./modules/** !./modules/humans",
                "",
                allDirectories,
                allDirectories
            );

            expect(result)
                .toStrictEqual([
                    "modules/teams/engineers",
                    "modules/teams/leads",
                ]);
        })

        it("handles trailing commas", () => {
            const result = filterFiles(
                "./modules/** !./modules/humans, ",
                "",
                allDirectories,
                allDirectories
            );

            expect(result)
                .toStrictEqual([
                    "modules/teams/engineers",
                    "modules/teams/leads",
                ]);
        })
    })

    describe("excludes", () => {
        it("matches multiple directories exactly", () => {
            const result = filterFiles(
                "!dev, !staging",
                "",
                allDirectories,
                allDirectories
            );

            expect(result)
                .toStrictEqual([
                    ".",
                    "production",
                    "modules",
                    "modules/humans",
                    "modules/teams/engineers",
                    "modules/teams/leads",
                ]);
        })

        it("matches single glob", () => {
            const result = filterFiles(
                "!./*",
                "",
                allDirectories,
                allDirectories
            );

            expect(result)
                .toStrictEqual([
                    ".",
                    "modules/humans",
                    "modules/teams/engineers",
                    "modules/teams/leads",
                ]);
        })

        it("matches single glob in a subdirectory", () => {
            const result = filterFiles(
                "!modules/*",
                "",
                allDirectories,
                allDirectories
            );

            expect(result)
                .toStrictEqual([
                    ".",
                    "dev",
                    "staging",
                    "production",
                    "modules/teams/engineers",
                    "modules/teams/leads",
                ]);
        })

        it("matches double glob", () => {
            const result = filterFiles(
                "!./**",
                "",
                allDirectories,
                allDirectories
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
                allDirectories,
                allDirectories
            );

            expect(result)
                .toStrictEqual([
                    ".",
                ]);
        })

        it("matches double glob in a subdirectory", () => {
            const result = filterFiles(
                "!./modules/**",
                "",
                allDirectories,
                allDirectories
            );

            expect(result)
                .toStrictEqual([
                    ".",
                    "dev",
                    "staging",
                    "production",
                ]);
        })
    })

    describe("return all if changed", () => {
        it("returns empty when no changes", () => {
            const result = filterFiles(
                "",
                "dev",
                "",
                allDirectories
            );

            expect(result)
                .toStrictEqual([]);
        })

        it("returns all when included is empty and 'modules' has changes", () => {
            const result = filterFiles(
                "",
                "modules/**",
                "modules/humans",
                allDirectories
            );

            expect(result)
                .toStrictEqual([
                    ".",
                    "dev",
                    "staging",
                    "production",
                    "modules",
                    "modules/humans",
                    "modules/teams/engineers",
                    "modules/teams/leads",
                ]);
        })

        it("returns all included when 'modules' has changes", () => {
            const result = filterFiles(
                "dev staging production",
                "modules/**",
                "modules/humans",
                allDirectories
            );

            expect(result)
                .toStrictEqual([
                    "dev",
                    "staging",
                    "production",
                ]);
        })

        it("returns all non-excluded when 'modules' has changes", () => {
            const result = filterFiles(
                "!.,!./modules/**",
                "modules/**",
                "modules/humans",
                allDirectories
            );

            expect(result)
                .toStrictEqual([
                    "dev",
                    "staging",
                    "production",
                ]);
        })

        it("returns all included when there are multiple 'return all' filters and 'modules' has changes", () => {
            const result = filterFiles(
                "dev staging production",
                "modules/teams, modules/humans",
                "modules/humans",
                allDirectories
            );

            expect(result)
                .toStrictEqual([
                    "dev",
                    "staging",
                    "production",
                ]);
        })
    })
})
