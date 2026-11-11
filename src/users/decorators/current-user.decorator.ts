import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CURRENT_USER_KEY } from '../../utils/constants';
import { JWTPayloadType } from '../../utils/types';

// /current-user.decorator.ts
export const currentUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const payload: JWTPayloadType = request[CURRENT_USER_KEY];
    return payload;
  },
);
