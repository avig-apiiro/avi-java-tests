import {Column, Entity, Generated, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

export enum UserRole {
    ADMIN = "admin",
    EDITOR = "editor",
    GHOST = "ghost"
}

export type UserRoleType = "admin" | "editor" | "ghost"

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: number;

    @PrimaryColumn()
    firstName: string;

    @Column("varchar", {length: 200})
    middleName: string;

    @PrimaryColumn()
    lastName: string;

    @Column()
    isActive: boolean;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.GHOST
    })
    roleEnum: UserRole;

    @Column({
        type: "enum",
        enum: ["admin", "editor", "ghost"],
        default: "ghost"
    })
    roleType: UserRoleType;

    @Column("simple-array")
    names: string[];

    @Column("int")
    score: number;

    @Column("simple-json")
    profile: { name: string, nickname: string };

    @Column()
    @Generated("uuid")
    uuid: string;
}
