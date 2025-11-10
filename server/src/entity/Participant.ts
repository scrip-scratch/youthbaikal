// src/entity/User.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity()
export class Participant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id: string = "";

  @Column({ nullable: true })
  user_name: string = "";

  @Column({ nullable: true })
  user_phone: string = "";

  @Column({ nullable: true })
  birth_date: string = "";

  @Column({ nullable: true })
  city: string = "";

  @Column({ nullable: true })
  church: string = "";

  @Column({ nullable: true })
  email: string = "";

  @Column({ nullable: true })
  billFile: string = "";

  @Column()
  first_time: boolean = false;

  @Column()
  paid: boolean = false;

  @Column({ default: 0 })
  payment_amount: number = 0;

  @Column({ nullable: true })
  promo_code: string = "";

  @Column({ nullable: true, default: 0 })
  promo_discount: number = 0;

  @Column({ nullable: true })
  enter_date: string = "";

  @Column({ nullable: true })
  payment_date: string = "";
}
