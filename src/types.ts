// src/types.ts
import { Response } from "express";

export type CommandParams = Record<string, any>;
export type CommandResult = Record<string, any> | undefined;

/**
 * Jeder Command bekommt die zusammengeführten Parameter (Query bei GET,
 * JSON-Body bei POST) sowie das Express-Response-Objekt für Sonderfälle
 * wie getphoto/getfile, die Binärdaten statt JSON zurückgeben.
 *
 * Normalfall: Handler gibt ein Objekt zurück -> Dispatcher sendet es als JSON.
 * Sonderfall: Handler schreibt selbst auf res und gibt undefined zurück.
 */
export type CommandHandler = (params: CommandParams, res: Response) => Promise<CommandResult>;
