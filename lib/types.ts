export interface User {
    id: number;
    name: string;
    username: string;
    password: string;
    gender: string | null;
    birthday: Date | null;
    createAt: Date;
    updateAt: Date;
}