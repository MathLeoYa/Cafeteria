import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ schema: "identity", name: "accounts" })
export class Account {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 254 })
  email!: string;

  @Column({ type: "varchar", length: 20, default: "customer" })
  role!: string;

  @Column({ name: "email_verified_at", type: "timestamptz", nullable: true })
  emailVerifiedAt!: Date | null;

  @Column({ name: "created_at", type: "timestamptz", default: () => "NOW()" })
  createdAt!: Date;

  @Column({ name: "updated_at", type: "timestamptz", default: () => "NOW()" })
  updatedAt!: Date;
}
