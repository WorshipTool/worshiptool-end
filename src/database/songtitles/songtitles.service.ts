import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SongTitle } from './songtitle.entity';

@Injectable()
export class SongTitlesService {
  constructor(
    @Inject('SONGS_REPO')
    private songRepository: Repository<SongTitle>,
  ) {}

  async findAll(): Promise<SongTitle[]> {
    return this.songRepository.find();
  }
}