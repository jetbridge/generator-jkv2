interface PaginatedResponse {
    items?: any[]
    paginationData?: PaginationData
    statusCode?: number
    message?: string
}

interface PagesData {
    pageSize: number
    pageNumber: number
}

interface PaginationData {
    totalCount: number
    totalPages: number
    firstPage: number
    lastPage: number
    page: number
    previousPage?: number
    nextPage?: number
}

function getPageParams(query_params?: Object): PagesData {
    let pageSize = 25
    let pageNumber = 1
    if (query_params) {
        if ("pageSize" in query_params) {
            pageSize = Number(query_params["pageSize"])
        }
        if ("pageNumber" in query_params) {
            pageNumber = Number(query_params["pageNumber"])
        }
    }
    return {
        pageSize: pageSize,
        pageNumber: pageNumber,
    }
}

function getPaginationData(total_object_count: number, pageParams: PagesData): PaginationData {
    let totalPagesCount = Math.ceil(total_object_count / pageParams.pageSize)

    let paginationData: PaginationData = {
        "totalCount": total_object_count,
        "totalPages": totalPagesCount,
        "firstPage": 1,
        "lastPage": totalPagesCount,
        "page": pageParams.pageNumber,
    }

    if (pageParams.pageNumber !== 1) {
        paginationData.previousPage = pageParams.pageNumber - 1
    }
    if (pageParams.pageNumber !== totalPagesCount) {
        paginationData.nextPage = pageParams.pageNumber + 1
    }

    return paginationData
}

export { getPageParams, getPaginationData, PagesData, PaginatedResponse, PaginationData }
