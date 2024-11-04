import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Tree,
    TreeChildren,
    TreeLevelColumn,
    TreeParent
} from "typeorm";

@Entity()
export class CategoryRelations {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @OneToMany(type => CategoryRelations, category => category.children)
    parent: CategoryRelations;

    @ManyToOne(type => CategoryRelations, category => category.parent)
    children: CategoryRelations;
}

@Entity()
@Tree("closure-table")
export class CategoryTree {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @TreeChildren()
    children: CategoryTree[];

    @TreeParent()
    parent: CategoryTree;

    @TreeLevelColumn()
    level: number;
}
