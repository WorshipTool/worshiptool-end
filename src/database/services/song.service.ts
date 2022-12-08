import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { SONG_REPOSITORY } from "../constants";
import { Song } from "../entities/song.entity";

@Injectable()
export class SongService {
  constructor(
    @Inject(SONG_REPOSITORY)
    private songRepository: Repository<Song>,
  ) {}

  async findOne(): Promise<Song> {
    return this.songRepository.createQueryBuilder().getOne();
  }

  async findByGUID(guid:string) : Promise<Song>{
    return this.songRepository.createQueryBuilder()
      .where("guid= :guid", {guid: guid}).getOne();
  }
}