export type CreateCommentResponse = {
  message?: Message;
}

export type Message = {
  success?:          boolean;
  message?:          string;
  comment_id?:       string;
  attachments?:      any[];
  attachment_count?: number;
  debug?:            Debug;
}

export type Debug = {
  files_received?:  any[];
  files_processed?: number;
}
