import { Column, PrimaryColumn } from 'typeorm';

export class BaseTypeModelEntity {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'varchar', length: 32 })
  name: string;
}
