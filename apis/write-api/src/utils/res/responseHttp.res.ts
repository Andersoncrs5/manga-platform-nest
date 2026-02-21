export interface ResponseHTTP<T> {
    body: T
    timestamp: string;
    path: string;
    method: string;
    message: string;
    traceId: string;
}