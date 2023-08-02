import {filterFiles} from "./filter-files"

export default (
    rawIncludedPaths: string | undefined,
    rawIfThesePathsChangeReturnAllIncludedPaths: string | undefined,
    rawChangedDirectories: string | undefined,
    rawDirectories: string | undefined,
) =>
    filterFiles(
        rawIncludedPaths ?? "",
        rawIfThesePathsChangeReturnAllIncludedPaths ?? "",
        rawChangedDirectories ?? "",
        rawDirectories ?? "",
    )
