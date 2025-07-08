import {Pagination} from '../../../shared/models/pagination';

export type ListFaqResponse = {
    status?:     number;
    message?:    string;
    data?:    Faq[];
    pagination?: Pagination;
}

export type Faq = {
    name?:    number;
    title?:   string;
    content?: string;
}
