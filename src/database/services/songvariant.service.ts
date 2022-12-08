import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { SONG_VARIANTS_REPOSITORY } from "../constants";
import { SongVariant } from "../entities/songvariant.entity";

@Injectable()
export class SongVariantService {
  constructor(
    @Inject(SONG_VARIANTS_REPOSITORY)
    private variantsRepository: Repository<SongVariant>,
  ) {}

  async findAllBySong(guid: string): Promise<SongVariant[]> {
    return this.variantsRepository.createQueryBuilder()
      .where("songGUID = :guid", {guid: guid}).getMany();
  }
}