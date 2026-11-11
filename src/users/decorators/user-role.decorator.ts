import { SetMetadata } from '@nestjs/common';
import { UserType } from '../../utils/enum';

//roles methode decorator
export const Roles = (...roles: UserType[]) => SetMetadata('roles', roles);
