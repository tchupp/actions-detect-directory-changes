import {filterFiles} from "./filter-files";

export default (
    rawIncludedPaths: string | undefined,
    rawIncludedExtensions: string | undefined,
    rawIfThesePathsChangeReturnAllIncludedPaths: string | undefined,
    rawChangedFiles: string | undefined,
    rawAllFiles: string | undefined,
) =>
    filterFiles(
        rawIncludedPaths ?? "",
        rawIncludedExtensions ?? "",
        rawIfThesePathsChangeReturnAllIncludedPaths ?? "",
        rawChangedFiles ?? "",
        rawAllFiles ?? "",
    )
