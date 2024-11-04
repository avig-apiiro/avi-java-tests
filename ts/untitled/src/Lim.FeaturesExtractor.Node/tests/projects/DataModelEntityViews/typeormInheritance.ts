import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

abstract class Content {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

}

@Entity()
class Photo extends Content {

    @Column()
    size: string;

}

@Entity()
class Question extends Content {

    @Column()
    answersCount: number;

}

@Entity()
class Post extends Content {

    @Column()
    viewCount: number;

}

@NotEtntity()
class NotOrmClass {
    @Column()
    something: number;
}
