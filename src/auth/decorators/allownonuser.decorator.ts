import { SetMetadata } from '@nestjs/common';

export const AllowNonUser = () => SetMetadata('allow-non-user', true);