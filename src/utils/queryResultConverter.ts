export interface QueryResult<T>{
    statusCode: number,
    message:string,
    data:T
}

export const codes = {
    [0]: 0,
    [404]: 404
}
export const messages = {
    [0]: "Success",
    [404]:"Not Found"
}

export function makeSuccessResult(data: any) : QueryResult<any>{
    return {
        statusCode: 0,
        message: messages[0],
        data
    }
}

export function makeResult(statusCode: number, message:string, data:any) : QueryResult<any>{
    return {
        statusCode,
        message,
        data
    }
}