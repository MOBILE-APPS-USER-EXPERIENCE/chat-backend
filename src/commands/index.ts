// src/commands/index.ts
import { CommandHandler } from "../types";
import { clear } from "./clear";
import { createchat } from "./createchat";
import { deletechat } from "./deletechat";
import { deleteuser } from "./deleteuser";
import { deregister } from "./deregister";
import { getchats } from "./getchats";
import { getfile } from "./getfile";
import { getinvites } from "./getinvites";
import { getmessages } from "./getmessages";
import { getphoto } from "./getphoto";
import { getprofiles } from "./getprofiles";
import { invite } from "./invite";
import { joinchat } from "./joinchat";
import { leavechat } from "./leavechat";
import { login } from "./login";
import { logout } from "./logout";
import { ping } from "./ping";
import { postmessage } from "./postmessage";
import { register } from "./register";
import { rejectinvite } from "./rejectinvite";
import { resetuser } from "./resetuser";
import { validatetoken } from "./validatetoken";

export const commands: Record<string, CommandHandler> = {
    ping,
    register,
    login,
    logout,
    validatetoken,
    deregister,
    createchat,
    getchats,
    deletechat,
    joinchat,
    leavechat,
    invite,
    getinvites,
    rejectinvite,
    postmessage,
    getmessages,
    getphoto,
    getfile,
    getprofiles,
    resetuser,
    deleteuser,
    clear,
};
