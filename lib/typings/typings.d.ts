
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
}

export interface IProcessedData {
    padLeft: string;
    padRight: string;
    ignoreIfUndefined: boolean;
    ignoreIfUndefinedReplacement: string;
    switch?: IProcessedSwitch;
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
