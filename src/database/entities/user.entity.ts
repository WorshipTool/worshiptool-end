import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum ROLES{
    "User",
    "Trustee",
    "Loader",
    "Admin"
}

@Entity()
export class User{
    @PrimaryGeneratedColumn("uuid")
    guid: string;
    
    @Column()
    firstName:string;  

    @Column()
    lastName:string; 

    @Column()
    email:string; 

    @Column()
    password:string; 

    @Column()
    role:ROLES; 
}