import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FastifyRequest } from 'fastify';
import {ResponseHTTP} from "../res/responseHttp.res";

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseHTTP<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseHTTP<T>> {
        const request = context.switchToHttp().getRequest<FastifyRequest>();

        return next.handle().pipe(
            map((data) => ({
                body: data,
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method,
                traceId: (request.raw as any).id || 'success-trace',
                message: 'Operação realizada com sucesso',
            })),
        );
    }
}