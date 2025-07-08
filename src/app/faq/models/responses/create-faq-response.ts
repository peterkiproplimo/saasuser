export type CreateFaqResponse = {
    status?:  number;
    message?: string;
    data?:    Faq;
}

export type Faq = {
    name?:     number;
    title?:    string;
    content?:  string;
    creation?: Date;
}
