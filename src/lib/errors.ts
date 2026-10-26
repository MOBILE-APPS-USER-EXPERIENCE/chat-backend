// src/lib/errors.ts

/**
 * Transportiert sowohl die Fehlermeldung als auch den Fehlercode, der laut
 * API-Doku 1:1 als HTTP-Status zurückgegeben wird (daher die unüblichen
 * Codes wie 451-469).
 */
export class ApiError extends Error {
    code: number;
    constructor(code: number, message: string) {
        super(message);
        this.code = code;
        this.name = "ApiError";
    }
}

export const Errors = {
    missingRequest: () => new ApiError(400, "Missing 'request' parameter"),
    unknownRequest: (name: string) => new ApiError(401, `Unknown request '${name}'`),
    illegalCharacters: (param: string) => new ApiError(402, `Illegal characters in parameter '${param}'`),
    missingParameter: (request: string, param: string, description: string) =>
        new ApiError(
            403,
            `Request '${request}' must contain a '${param}' parameter ('${description}')`
        ),
    emptyParameter: (param: string) => new ApiError(404, `Parameter '${param}' must not be empty`),
    notNumeric: (param: string) => new ApiError(405, `Parameter '${param}' is not numeric`),

    invalidUserId: () => new ApiError(451, "Wrong user id format"),
    userExists: () => new ApiError(452, "User already exists"),
    passwordTooShort: () => new ApiError(453, "Password too short (min 6 characters)"),
    unknownUser: () => new ApiError(454, "Unknown user"),
    wrongPassword: () => new ApiError(455, "Wrong password"),
    invalidToken: () => new ApiError(456, "Invalid token"),
    invalidPhotoId: () => new ApiError(457, "Invalid photoid"),
    invalidFileId: () => new ApiError(457, "Invalid fileid"),
    invalidChatId: (chatid?: number | string) =>
        new ApiError(458, chatid !== undefined ? `Invalid chatid: ${chatid}` : "Invalid chatid"),
    noAdmin: () => new ApiError(459, "No admin"),
    notChatOwner: () => new ApiError(460, "Not the chat owner"),
    cannotLeave: () => new ApiError(461, "May not leave this chat"),
    chatnameTooShort: () => new ApiError(462, "Chat name too short (min 2 characters)"),
    invalidUserHash: () => new ApiError(463, "Invalid user hash"),
    cannotLeaveMainChat: () => new ApiError(464, "Cannot leave the general chat (chatid 0)"),
    nicknameTooShort: () => new ApiError(466, "Nickname too short (min 2 characters)"),
    nicknameTooLong: () => new ApiError(467, "Nickname too long (max 30 characters)"),
    fullnameTooShort: () => new ApiError(468, "Full name too short (min 2 characters)"),
    fullnameTooLong: () => new ApiError(469, "Full name too long (max 30 characters)"),
};
