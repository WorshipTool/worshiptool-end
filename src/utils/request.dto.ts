export class RequestResultBase{
    statusCode: number
    message: string
}

export class RequestResult<T = undefined> extends RequestResultBase{
    data?: T
}
