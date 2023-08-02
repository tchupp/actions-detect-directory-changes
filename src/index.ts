import {filterFiles} from "./filter-files";

export default (
    rawIncludedPaths: string | undefined,
    rawIfThesePathsChangeReturnAllIncludedPaths: string | undefined,
    rawChangedDirectories: string | undefined,
    rawAllDirectories: string | undefined,
) =>
    filterFiles(
        rawIncludedPaths ?? "",
        rawIfThesePathsChangeReturnAllIncludedPaths ?? "",
        rawChangedDirectories ?? "",
        rawAllDirectories ?? "",
    )
