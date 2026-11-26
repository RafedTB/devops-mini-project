import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    console.log('before route handler');
    return next.handle().pipe(
      map((DataResponseFromRoute) => {
        if (
          DataResponseFromRoute &&
          typeof DataResponseFromRoute === 'object'
        ) {
          const otherData = { ...DataResponseFromRoute };
          delete otherData.password;
          return otherData;
        }
        return DataResponseFromRoute;
      }),
    );
  }
}
