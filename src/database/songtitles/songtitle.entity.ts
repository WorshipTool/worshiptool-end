import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SongTitle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  name: string;
}