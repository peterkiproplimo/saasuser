export type LoginResponse = {
    status?:        number;
    message?:       string;
    user?:          User;
    access_token?:  string;
    refresh_token?: string;
}

export type User = {
    name?:       string;
    email?:      string;
    first_name?: string;
    last_name?:  string;
    last_login?: Date;
    role?:       string[];
}
