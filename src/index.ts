import {filterFiles} from "./filter-files"

export default (
    rawIncludedPaths: string | undefined,
    rawReturnAllIfChangedPaths: string | undefined,
    rawIfThesePathsChangeReturnAllIncludedPaths: string | undefined,
    rawTfDirectories: string | undefined,
) =>
    filterFiles(
        rawIncludedPaths ?? "",
        rawReturnAllIfChangedPaths ?? "",
        rawIfThesePathsChangeReturnAllIncludedPaths ?? "",
        rawTfDirectories ?? "",
    )
