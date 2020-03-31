export interface IHeader {
    [k: string]: IData;
}

export interface IFullHeader {
    processed: IHeader;
    raw: string;
}

export interface IData {
    padLeft?: string;
    padRight?: string;
    ignoreIfUndefined?: boolean;
    ignoreIfUndefinedReplacement?: string;
    switch?: ISwitch;
    arrayJoin?: string;
}

export interface IProcessedData {
    padLeft: string;
    padRight: string;
    ignoreIfUndefined: boolean;
    ignoreIfUndefinedReplacement: string;
    switch?: IProcessedSwitch;
    arrayJoin: string;
}

export interface ISwitch {
    cases: {
        [k: string]: string;
    };
    default?: string;
}

export interface IProcessedSwitch {
    cases: {
        [k: string]: string;
    };
    default: string;
}
