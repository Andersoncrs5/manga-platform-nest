import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import {ResponseHTTP} from "../res/responseHttp.res";

@Catch() // Captura todas as exceções
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();
        const request = ctx.getRequest<FastifyRequest>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.getResponse()
                : 'Internal server error';

        if (status >= 500 ) {
            this.logger.error(
                `Http Status: ${status} Error Details: ${JSON.stringify(message)}`,
                exception instanceof Error ? exception.stack : '',
            );
        }

        const responseHTTP: ResponseHTTP<any> = {
            body: null,
            message: typeof message === 'string' ? message : (message as any).message || message,
            path: request.url,
            method: request.method,
            traceId: request.id,
            timestamp: new Date().toISOString()
        }

        response.status(status).send(responseHTTP);
    }
}