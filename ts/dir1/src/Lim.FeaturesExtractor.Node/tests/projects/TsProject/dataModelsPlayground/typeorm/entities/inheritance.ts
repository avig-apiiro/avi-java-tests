import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

export abstract class Content {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

}

@Entity()
export class Photo extends Content {

    @Column()
    size: string;

}

@Entity()
export class PhotoWithSomething extends Photo {

    @Column()
    something: string;
}

@Entity()
export class Question extends Content {

    @Column()
    answersCount: number;

}

@Entity()
export class Post extends Content {

    @Column()
    viewCount: number;

}
