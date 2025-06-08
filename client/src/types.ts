
export type Appointment = {
    id: number;
    start: Date;
    end: Date;
    title: string;
    description: string;
};

export type Department = {
    id: number;
    name: string;
    description: string;
    manager: number;
}