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

  @Column()
  user_name: string = "";

  @Column()
  user_phone: string = "";

  @Column()
  spices: string = "";

  @Column()
  first_time: boolean = false;

  @Column()
  paid: boolean = false;

  @Column()
  payment_amount: number = 0;

  @Column()
  enter_date: string = "";
}
