export interface RequestResult<T>{
    statusCode: number,
    message: string,
    data: T
}

export const codes = {
    "Success": 0,
    "Unknown Error": 1,
    "Bad Request": 400,
    "Unauthorized": 401,
    "Not Found": 404,
    "Already Added": 409,
    "This name is already taken": 410,
    "Email Already Exists": 471,
    "Not Implemented": 501,
}

export const messages = {
    [0] : "Success",
    [1] : "Unknown Error",
    [400] : "Bad Request",
    [401] : "Unauthorized",
    [404] : "Not Found",
    [409] : "Already Added",
    [410] : "This name is already taken",
    [471] : "Email Already Exists",
    [501] : "Not Implemented"
}

export function formatted<T>(data:T, statusCode?:number, message?:string) : RequestResult<any>{
    
    return {
        statusCode: (statusCode===undefined?0:statusCode),
        message: (message===undefined?
                    (statusCode===undefined?messages[0]:messages[statusCode]):message),
        data: data === null ? undefined : data
    }
}

export const isRequestSuccess = (req: RequestResult<any>) => {
    return req.statusCode==codes["Success"];
}
export const isRequestError = (req: RequestResult<any>) => {
    return !isRequestSuccess(req);
}