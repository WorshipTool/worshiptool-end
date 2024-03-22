import { Body, Controller, NotFoundException, Post } from '@nestjs/common';
import { PostEditVariantInDto } from './song.editing.dto';
import { SongEditingService } from './song.editing.service';
import { User as UserObject } from '../../database/entities/user.entity';
import { SongVariantService } from '../modules/variants/song.variant.service';
import { apiToVariantEditInDto } from './song.editing.map';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '../../auth/decorators/user.decorator';

@ApiTags('Song Editing')
@Controller('song/variant')
export class SongEditingController {
  constructor(
    private editingService: SongEditingService,
    private variantService: SongVariantService,
  ) {}

  @Post('edit')
  @ApiBearerAuth()
  async editVariant(
    @Body() api: PostEditVariantInDto,
    @User() user: UserObject,
  ) {
    const variant = await this.variantService.getVariantByGuid(api.guid, user, {
      createdBy: true,
      prefferedTitle: true,
    });
    if (!variant) throw new NotFoundException('Variant not found');

    const data = apiToVariantEditInDto(api);

    return await this.editingService.editVariant(variant, data, user);
  }
}
