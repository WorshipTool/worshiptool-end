export interface RequestResult<T>{
    statusCode: number,
    message: string,
    data: T
}

export const codes = {
    "Success": 0,
    "Unknown Error": 400,
    "Not Found": 404,
    "Email Already Exists": 471
}

export const messages = {
    [0] : "Success",
    [400] : "Unknown Error",
    [404] : "Not Found",
    [471] : "Email Already Exists"
}

export function formatted(data:any, statusCode?:number, message?:string) : RequestResult<any>{
    
    return {
        statusCode: (statusCode===undefined?0:statusCode),
        message: (message===undefined?
                    (statusCode===undefined?messages[0]:messages[statusCode]):message),
        data
    }
}