import {Column, Entity} from "typeorm";
import {Content} from "./inheritance";

@Entity
export class SomeOtherContent extends Content {
    @Column
    other: string;
}
