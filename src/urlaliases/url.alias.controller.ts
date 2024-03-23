import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { UrlAliasService } from './url.alias.service';
import { UrlAliasType } from '../database/entities/urlalias.entity';
import { GetVariantFromAliasInDto } from './url.alias.dto';
import { AllowNonUser } from '../auth/decorators/allownonuser.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Url Alias')
@Controller('alias')
export class UrlAliasController {
  constructor(private urlAliasService: UrlAliasService) {}

  @AllowNonUser()
  @Get('variant/:alias')
  async getVariantFromAlias(@Param() { alias }: GetVariantFromAliasInDto) {
    const guid = await this.urlAliasService.getValueFromAlias(
      alias,
      UrlAliasType.Variant,
    );

    if(!guid) throw new NotFoundException('Alias not found');

    return guid
  }
}
