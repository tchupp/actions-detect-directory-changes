import fspath, {dirname, extname} from "path";
import minimatch from "minimatch";


function normalizeExtension(extensionFilter: string) {
    const negative = extensionFilter.startsWith("!");
    if (negative) {
        extensionFilter = extensionFilter.slice(1);
    }
    extensionFilter = extensionFilter.replace(/^(\.|\*\.)/g, "");
    extensionFilter = `**/*.${fspath.normalize(extensionFilter)}`;
    if (negative) {
        return `!${extensionFilter}`;
    }
    return extensionFilter;
}

function cleanExtensions(input: string): string[] {
    return input
        .split(",")
        .flatMap(s => s.split(" "))
        .filter(s => s.length !== 0)
        .map(normalizeExtension)
        .filter(s => !fspath.isAbsolute(s))
}

function normalizeFilePath(filePathFilter: string) {
    filePathFilter = filePathFilter.replace(/\/$/g, "");
    const negativeMatch = filePathFilter.startsWith("!");
    if (negativeMatch) {
        filePathFilter = filePathFilter.slice(1);
        return "!" + fspath.normalize(filePathFilter);
    }
    return fspath.normalize(filePathFilter);
}

function cleanPaths(input: string): string[] {
    return input
        .split(",")
        .flatMap(s => s.split(" "))
        .filter(s => s.length !== 0)
        .map(normalizeFilePath)
        .filter(s => !fspath.isAbsolute(s))
}

function unique(changedDir: string, index: number, array: string[]): boolean {
    return array.indexOf(changedDir) === index;
}

function matchPaths(includedPatterns: string[], path: string): boolean {
    if (includedPatterns.length === 0) return true;

    console.log(`includedPatterns: ${includedPatterns}`);
    console.log(`path: ${path}`);

    const positivePatterns = includedPatterns.filter(pattern => pattern.match(/^[^!]+/));
    const matchesPositive = positivePatterns.some(pattern => minimatch(path, pattern, {flipNegate: false, dot: true}));

    const negativePatterns = includedPatterns.filter(pattern => pattern.match(/^!/));
    const matchesNegative = negativePatterns.some(pattern => minimatch(path, pattern, {flipNegate: true, dot: true}));

    console.log(`positivePatterns: [${positivePatterns}]`);
    console.log(`matchesPositive: ${matchesPositive}`);
    console.log(`negativePatterns: [${negativePatterns}]`);
    console.log(`matchesNegative: ${matchesNegative}`);
    if (matchesPositive && !matchesNegative) {
        return true;
    }
    if (matchesNegative) {
        return false;
    }

    return positivePatterns.length === 0 && negativePatterns.length > 0;
}

function filterDirectories(
    filesToFilter: string[],
    includedExtensions: string[],
    includedPaths: string[],
): string[] {
    return filesToFilter
        .filter(changedFile => matchPaths(includedExtensions, changedFile))
        .map(fspath.dirname)
        .filter(unique)
        .filter(dir => matchPaths(includedPaths, dir))
        .sort();
}

function determineWhichSetOfFilesToReturn(
    ifThesePathsChangeReturnAllIncludedPaths: string[],
    inputChangedFiles: string[],
    inputAllExistingFiles: string[],
): string[] {
    const inputAllExistingDirectories = inputAllExistingFiles
        .map(existingFile => dirname(existingFile))
        .filter(unique);

    const existingChangedFiles = inputChangedFiles
        .filter(changedFile =>  inputAllExistingDirectories.includes(dirname(changedFile)));

    const hasReturnAllIncludedTrigger = ifThesePathsChangeReturnAllIncludedPaths.length !== 0;
    if (hasReturnAllIncludedTrigger) {
        const existingChangedDirectories = existingChangedFiles
            .map(changedFile => dirname(changedFile))
            .filter(unique);

        const hasReturnAllIncludedTriggerChanges = existingChangedDirectories.some(changedDir => matchPaths(ifThesePathsChangeReturnAllIncludedPaths, changedDir));
        if (hasReturnAllIncludedTriggerChanges) {
            return inputAllExistingFiles;
        }
    }

    return existingChangedFiles;
}

function filterFilesInner(
    includedPaths: string[],
    includedExtensions: string[],
    ifThesePathsChangeReturnAllIncludedPaths: string[],
    inputChangedFiles: string[],
    inputAllExistingFiles: string[],
): string[] {
    const filesToReturn = determineWhichSetOfFilesToReturn(
        ifThesePathsChangeReturnAllIncludedPaths,
        inputChangedFiles,
        inputAllExistingFiles,
    );
    return filterDirectories(filesToReturn, includedExtensions, includedPaths);
}

export function filterFiles(
    rawIncludedPaths: string,
    rawIncludedExtensions: string,
    rawIfThesePathsChangeReturnAllIncludedPaths: string,
    rawChangedFiles: string,
    rawAllFiles: string,
): string[] {
    const includedPaths = cleanPaths(rawIncludedPaths);
    const includedExtensions = cleanExtensions(rawIncludedExtensions);
    const ifThesePathsChangeReturnAllIncludedPaths = cleanPaths(rawIfThesePathsChangeReturnAllIncludedPaths);
    const inputChangedFiles = cleanPaths(rawChangedFiles);
    const inputAllExistingFiles = cleanPaths(rawAllFiles);

    return filterFilesInner(includedPaths, includedExtensions, ifThesePathsChangeReturnAllIncludedPaths, inputChangedFiles, inputAllExistingFiles);
}
