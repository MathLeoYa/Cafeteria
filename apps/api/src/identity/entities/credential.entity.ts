import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ schema: "identity", name: "credentials" })
export class Credential {
  @PrimaryColumn("uuid", { name: "account_id" })
  accountId!: string;

  @Column({ name: "password_hash", type: "text" })
  passwordHash!: string;

  @Column({
    name: "password_changed_at",
    type: "timestamptz",
    default: () => "NOW()",
  })
  passwordChangedAt!: Date;
}
