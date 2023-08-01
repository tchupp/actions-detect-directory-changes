import {filterFiles} from "./filter-files"

export default (
    rawIncludedPaths: string | undefined,
    rawReturnAllIfChangedPaths: string | undefined,
    rawChangedTfDirectories: string | undefined,
    rawTfDirectories: string | undefined,
) =>
    filterFiles(
        rawIncludedPaths ?? "",
        rawReturnAllIfChangedPaths ?? "",
        rawChangedTfDirectories ?? "",
        rawTfDirectories ?? "",
    )
