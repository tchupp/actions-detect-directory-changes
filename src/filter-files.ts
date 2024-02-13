import fspath, {dirname, extname} from "path";
import minimatch from "minimatch";


function normalizeExtension(s: string) {
    s = s.replace(/^\./g, "");
    // if (s.startsWith("!")) {
    //     return "!" + fspath.normalize(s.slice(1));
    // }
    return `.${fspath.normalize(s)}`;
}

function cleanExtensions(input: string): string[] {
    return input
        .split(",")
        .flatMap(s => s.split(" "))
        .filter(s => s.length !== 0)
        .map(normalizeExtension)
        .filter(s => !fspath.isAbsolute(s))
}

function normalizeFilePath(s: string) {
    s = s.replace(/\/$/g, "");
    const negativeMatch = s.startsWith("!");
    if (negativeMatch) {
        s = s.slice(1);
        return "!" + fspath.normalize(s);
    }
    return fspath.normalize(s);
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

function matchPaths(includedPaths: string[], directory: string): boolean {
    if (includedPaths.length === 0) return true;

    const positivePatterns = includedPaths.filter(path => path.match(/^[^!]+/));
    const matchesPositive = positivePatterns.some(path => minimatch(directory, path, {flipNegate: false, dot: true}));

    const negativePatterns = includedPaths.filter(path => path.match(/^!/));
    const matchesNegative = negativePatterns.some(path => minimatch(directory, path, {flipNegate: true, dot: true}));

    if (matchesPositive && !matchesNegative) {
        return true;
    }
    if (matchesNegative) {
        return false;
    }

    return positivePatterns.length === 0 && negativePatterns.length > 0;
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
    const inputAllFiles = cleanPaths(rawAllFiles);
    const inputChangedFiles = cleanPaths(rawChangedFiles);

    const allExistingDirectories = inputAllFiles.map(fspath.dirname).filter(unique).sort();

    const existingChangedDirectories = inputChangedFiles
        .filter(changedFile =>  includedExtensions.length === 0 || includedExtensions.some(ext => extname(changedFile) === ext))
        .map(changedFile => dirname(changedFile))
        .filter(changedDir => allExistingDirectories.includes(changedDir))
        .filter(unique);

    const hasReturnAllIncludedTrigger = ifThesePathsChangeReturnAllIncludedPaths.length !== 0;
    if (hasReturnAllIncludedTrigger) {
        const hasReturnAllIncludedTriggerChanges = existingChangedDirectories.some(changedDir => matchPaths(ifThesePathsChangeReturnAllIncludedPaths, changedDir));
        if (hasReturnAllIncludedTriggerChanges) {
            return allExistingDirectories.filter(dir => matchPaths(includedPaths, dir))
        }
    }

    return existingChangedDirectories
        .filter(changedDir => matchPaths(includedPaths, changedDir))
        .sort();
}
