import {filterFiles} from "./filter-files";

export default (
    rawIncludedPaths: string | undefined,
    rawChangedDirectories: string | undefined,
    rawAllDirectories: string | undefined,
) =>
    filterFiles(
        rawIncludedPaths ?? "",
        rawChangedDirectories ?? "",
        rawAllDirectories ?? "",
    )
