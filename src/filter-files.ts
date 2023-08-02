import fspath from "path";
import minimatch from "minimatch";

function cleanPaths(input: string): string[] {
    return input
        .split(",")
        .flatMap(s => s.split(" "))
        .filter(s => s.length !== 0)
        .map(s => fspath.normalize(s))
        .filter(s => !fspath.isAbsolute(s))
        .map(s => s.replace(/^!\.\//g, "!"))
        .map(s => s.replace(/[/]$/g, ""));
}

function matchPaths(includedPaths: string[], directory: string): boolean {
    if (includedPaths.length === 0) return true;

    const positivePatterns = includedPaths.filter(path => path.match(/^[^!]+/));
    const matchesPositive = positivePatterns.some(path => minimatch(directory, path, {flipNegate: false}));

    const negativePatterns = includedPaths.filter(path => path.match(/^!/));
    const matchesNegative = negativePatterns.some(path => minimatch(directory, path, {flipNegate: true}));

    if (matchesPositive && !matchesNegative) {
        return true;
    }
    if (matchesNegative) {
        return false;
    }

    return positivePatterns.length === 0 && negativePatterns.length > 0;
}

export const filterFiles = (
    rawIncludedPaths: string,
    rawIfThesePathsChangeReturnAllIncludedPaths: string,
    rawChangedDirectories: string,
    rawDirectories: string,
): string[] => {
    const includedPaths = cleanPaths(rawIncludedPaths);
    const ifThesePathsChangeReturnAllIncludedPaths = cleanPaths(rawIfThesePathsChangeReturnAllIncludedPaths);
    const inputDirectories = cleanPaths(rawDirectories);
    const inputChangedDirectories = cleanPaths(rawChangedDirectories);

    const hasReturnAllIncludedTrigger = ifThesePathsChangeReturnAllIncludedPaths.length !== 0
    const hasReturnAllIncludedTriggerChanges = inputChangedDirectories.some(changed => matchPaths(ifThesePathsChangeReturnAllIncludedPaths, changed))
    if (hasReturnAllIncludedTrigger && hasReturnAllIncludedTriggerChanges) {
        return inputDirectories.filter(dir => matchPaths(includedPaths, dir))
    }

    return inputChangedDirectories
        .filter(dir => inputDirectories.includes(dir))
        .filter(dir => matchPaths(includedPaths, dir))
}
