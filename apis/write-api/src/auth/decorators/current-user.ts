import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Payload } from "../class/payload.interface";

export const CurrentUser = createParamDecorator(
    (data: keyof Payload | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user as Payload;

        if (!user) return null;

        return data ? user[data] : user;
    },
);