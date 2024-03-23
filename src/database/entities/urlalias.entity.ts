import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum UrlAliasType {
  Variant,
}

@Entity()
export class UrlAlias {
  @PrimaryGeneratedColumn('uuid')
  guid: string;

  @Column()
  alias: string;

  @Column()
  value: string;

  @Column()
  type: UrlAliasType;
}
