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
    rawReturnAllIfChangedPaths: string,
    rawChangedTfDirectories: string,
    rawTfDirectories: string,
): string[] => {
    const includedPaths = cleanPaths(rawIncludedPaths);
    const returnAllIfChangedPaths = cleanPaths(rawReturnAllIfChangedPaths);
    const inputTfDirectories = cleanPaths(rawTfDirectories);
    const inputChangedTfDirectories = cleanPaths(rawChangedTfDirectories);

    const hasReturnAllTrigger = returnAllIfChangedPaths.length !== 0
    const hasReturnAllTriggerChanges = inputChangedTfDirectories.some(changed => matchPaths(returnAllIfChangedPaths, changed))
    if (hasReturnAllTrigger && hasReturnAllTriggerChanges) {
        return inputTfDirectories.filter(dir => matchPaths(includedPaths, dir))
    }

    return inputChangedTfDirectories
        .filter(dir => inputTfDirectories.includes(dir))
        .filter(dir => matchPaths(includedPaths, dir))
}
