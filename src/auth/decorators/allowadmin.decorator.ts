import { SetMetadata } from '@nestjs/common';

export const AllowAdmin = () => SetMetadata('allow-admin', true);