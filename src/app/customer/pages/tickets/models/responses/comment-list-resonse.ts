import {Pagination} from '../../../../../shared/models/pagination';

export type CommentListResponse = {
  status?:     number;
  message?:    string;
  data?:       Comment[];
  pagination?: Pagination;
}

export type Comment = {
  id?:              string;
  created?:         Date;
  modified?:        Date;
  type?:            string;
  comment_text?:    string;
  author?:          Author;
  direction?:       string;
  attachments?:     Attachment[];
  has_attachments?: boolean;
}

export type Attachment = {
  url?:  string;
  name?: string;
}

export type Author = {
  name?: string;
  email?: string;
}
