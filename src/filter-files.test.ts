import filterFiles from "./index";

describe("filterFiles", () => {

    describe("no include or exclude", () => {

        it("all undefined", () => {
            const result = filterFiles(
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
                "          ",
                "    "
            );

            expect(result)
                .toStrictEqual([]);
        })

        it("all changes exist", () => {
            const result = filterFiles(
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
                "modules/teams/leads/",
                "modules/teams/leads"
            );

            expect(result)
                .toStrictEqual([
                    "modules/teams/leads",
                ]);
        })
    })

    const allDirectories = ". dev staging production modules/humans modules/teams/engineers modules/teams/leads";

    describe("includes", () => {
        it("matches multiple directories exactly", () => {
            const result = filterFiles(
                ". dev",
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
                allDirectories,
                allDirectories
            );

            expect(result)
                .toStrictEqual([
                    "dev",
                    "staging",
                    "production",
                ]);
        })

        it("matches single glob in a subdirectory", () => {
            const result = filterFiles(
                "modules/*",
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
                allDirectories,
                allDirectories
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

        it("matches double glob in a subdirectory", () => {
            const result = filterFiles(
                "./modules/**",
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
                allDirectories,
                allDirectories
            );

            expect(result)
                .toStrictEqual([
                    ".",
                    "production",
                    "modules/humans",
                    "modules/teams/engineers",
                    "modules/teams/leads",
                ]);
        })

        it("matches single glob", () => {
            const result = filterFiles(
                "!./*",
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

        it("matches double glob in a subdirectory", () => {
            const result = filterFiles(
                "!./modules/**",
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
})
