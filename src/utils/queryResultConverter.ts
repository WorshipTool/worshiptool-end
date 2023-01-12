export interface RequestResult<T>{
    statusCode: number,
    message:string,
    data:T
}

export const codes = {
    [0]: 0,
    [50]: 50,
    [404]: 404
}
export const messages = {
    [0]: "Success",
    [50]: "Invalid input",
    [404]:"Not Found"
}

export function makeSuccessResult(data: any) : RequestResult<any>{
    return {
        statusCode: 0,
        message: messages[0],
        data
    }
}

export function makeResult(statusCode: number, message:string, data:any) : RequestResult<any>{
    return {
        statusCode,
        message,
        data
    }
}