import { SetMetadata } from '@nestjs/common';

export const AllowOnlyAdmin = () => SetMetadata('allow-admin', true);