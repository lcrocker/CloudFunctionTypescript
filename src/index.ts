/*
 * OTA firmware server
 */

import express from 'express';
import fs from 'fs';
import { Storage } from '@google-cloud/storage';

const bucketName = '<bucketname>';
const storage = new Storage();
const bucket = storage.bucket(bucketName);

async function getNames(): Promise<string[]> {
    const [ files ] = await bucket.getFiles();
    const names: string[] = [];
    files.forEach((file) => names.push(file.name));
    return names;
}

export async function firmwareSend(req: express.Request, res: express.Response): Promise<void> {
    const names = await getNames();
    res.set('Access-Control-Allow-Origin', '*');

    if ('' == req.path || '/' == req.path) {
        res.send('Firmware Server\n');
        return;
    }
    if ('/fw' != req.path) {
        res.status(401).send('Unknown path\n');
        return;
    }
    const version = req.query.v;
    if (! version) {
        res.json({ "available": names });
        return;
    }
    const fname = `v${version}.bin`;
    const chunks: Buffer[] = [];

    if (! names.includes(fname)) {
        res.status(404).send(`${fname} not found`);
        return;
    }
    bucket
        .file(fname)
        .createReadStream()
        .on('data', (chunk) => {
            chunks.push(Buffer.from(chunk));
        }).on('error', (err) => {
            res.status(500).send(`Server error: ${err}`);
        }).on('end', () => {
            res.set('Access-Control-Allow-Origin', '*');
            res.set('Content-Type', 'application/octet-stream');
            res.send(Buffer.concat(chunks));
        });
}

