/* Universial Module (UMD) design pattern
 * https://github.com/umdjs/umd/blob/master/templates/returnExports.js
 */
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // register as an AMD anonymous module
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // use a node.js style export
        module.exports = factory();
    } else {
        // if this isn't running under Node or AMD, just set a global variable
        root.fido2Helpers = factory();
    }
    // the return value of this function is what becomes the AMD / CommonJS / Global export
}(this, function() {

    /********************************************************************************
     *********************************************************************************
     * FUNCTIONS
     *********************************************************************************
     *********************************************************************************/

    /* begin helpers */
    function printHex(msg, buf) {
        // if the buffer was a TypedArray (e.g. Uint8Array), grab its buffer and use that
        if (ArrayBuffer.isView(buf) && buf.buffer instanceof ArrayBuffer) {
            buf = buf.buffer;
        }

        // check the arguments
        if ((typeof msg != "string") ||
            (typeof buf != "object")) {
            console.log("Bad args to printHex");
            return;
        }
        if (!(buf instanceof ArrayBuffer)) {
            console.log("Attempted printHex with non-ArrayBuffer:", buf);
            return;
        }

        // print the buffer as a 16 byte long hex string
        var arr = new Uint8Array(buf);
        var len = buf.byteLength;
        var i, str = "";
        console.log(msg, `(${buf.byteLength} bytes)`);
        for (i = 0; i < len; i++) {
            var hexch = arr[i].toString(16);
            hexch = (hexch.length == 1) ? ("0" + hexch) : hexch;
            str += hexch.toUpperCase() + " ";
            if (i && !((i + 1) % 16)) {
                console.log(str);
                str = "";
            }
        }
        // print the remaining bytes
        if ((i) % 16) {
            console.log(str);
        }
    }

    function arrayBufferEquals(b1, b2) {
        if (!(b1 instanceof ArrayBuffer) ||
            !(b2 instanceof ArrayBuffer)) {
            console.log("arrayBufferEquals: not both ArrayBuffers");
            console.log("b1 instanceof ArrayBuffer", b1 instanceof ArrayBuffer);
            console.log("b2 instanceof ArrayBuffer", b2 instanceof ArrayBuffer);
            return false;
        }

        if (b1.byteLength !== b2.byteLength) return false;
        b1 = new Uint8Array(b1);
        b2 = new Uint8Array(b2);
        for (let i = 0; i < b1.byteLength; i++) {
            if (b1[i] !== b2[i]) return false;
        }
        return true;
    }

    function hex2ab(hex) {
        if (typeof hex !== 'string') {
            throw new TypeError('Expected input to be a string');
        }

        if ((hex.length % 2) !== 0) {
            throw new RangeError('Expected string to be an even number of characters');
        }

        var view = new Uint8Array(hex.length / 2);

        for (var i = 0; i < hex.length; i += 2) {
            view[i / 2] = parseInt(hex.substring(i, i + 2), 16);
        }

        return view.buffer;
    }

    function str2ab(str) {
        var buf = new ArrayBuffer(str.length);
        var bufView = new Uint8Array(buf);
        for (var i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

    // borrowed from:
    // https://github.com/niklasvh/base64-arraybuffer/blob/master/lib/base64-arraybuffer.js
    // modified to base64url by Yuriy :)
    /*
     * base64-arraybuffer
     * https://github.com/niklasvh/base64-arraybuffer
     *
     * Copyright (c) 2012 Niklas von Hertzen
     * Licensed under the MIT license.
     */
    // var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    // Use a lookup table to find the index.
    var lookup = new Uint8Array(256);
    for (var i = 0; i < chars.length; i++) {
        lookup[chars.charCodeAt(i)] = i;
    }

    function b64decode(base64) {
        var bufferLength = base64.length * 0.75,
            len = base64.length,
            i, p = 0,
            encoded1, encoded2, encoded3, encoded4;

        if (base64[base64.length - 1] === "=") {
            bufferLength--;
            if (base64[base64.length - 2] === "=") {
                bufferLength--;
            }
        }

        var arraybuffer = new ArrayBuffer(bufferLength),
            bytes = new Uint8Array(arraybuffer);

        for (i = 0; i < len; i += 4) {
            encoded1 = lookup[base64.charCodeAt(i)];
            encoded2 = lookup[base64.charCodeAt(i + 1)];
            encoded3 = lookup[base64.charCodeAt(i + 2)];
            encoded4 = lookup[base64.charCodeAt(i + 3)];

            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }

        return arraybuffer;
    }

    function b64encode(arraybuffer) {
        var bytes = new Uint8Array(arraybuffer),
            i, len = bytes.length,
            base64 = "";

        for (i = 0; i < len; i += 3) {
            base64 += chars[bytes[i] >> 2];
            base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
            base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
            base64 += chars[bytes[i + 2] & 63];
        }

        if ((len % 3) === 2) {
            base64 = base64.substring(0, base64.length - 1) + "=";
        } else if (len % 3 === 1) {
            base64 = base64.substring(0, base64.length - 2) + "==";
        }

        return base64;
    }

    function ab2str(buf) {
        return String.fromCharCode.apply(null, new Uint16Array(buf));
    }

    function bufEqual(a, b) {
        var len = a.length;

        if (len !== b.length) {
            console.log("length mismatch");
            console.log("a", a.length);
            console.log("b", b.length);
            return false;
        }

        for (var i = 0; i < len; i++) {
            if (a.readUInt8(i) !== b.readUInt8(i)) {
                console.log("byte mismatch at", i);
                return false;
            }
        }

        return true;
    }

    var functions = {
        printHex,
        arrayBufferEquals,
        hex2ab,
        str2ab,
        b64decode,
        b64encode,
        ab2str,
        bufEqual
    };

    /********************************************************************************
     *********************************************************************************
     * SERVER MSGS
     *********************************************************************************
     *********************************************************************************/

    var challengeRequestMsg = {
        body: {
            user: "bubba"
        }
    };

    var challengeResponseAttestationNoneMsg = {
        body: {
            "binaryEncoding": "base64",
            "username": "adam",
            "id": "AAii3V6sGoaozW7TbNaYlJaJ5br8TrBfRXnofZO6l2suc3a5tt/XFuFkFA/5eabU80S1PW0m4IZ79BS2kQO7Zcuy2vf0ESg18GTLG1mo5YSkIdqL2J44egt+6rcj7NedSEwxa/uuxUYBtHNnSQqDmtoUAfM9LSWLl65BjKVZNGUp9ao33mMSdVfQQ0bHze69JVQvLBf8OTiZUqJsOuKmpqUc",
            "response": {
                "attestationObject": "o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YVkBJkmWDeWIDoxodDQXD2R2YFuP5K65ooYyx5lc87qDHZdjQQAAAAAAAAAAAAAAAAAAAAAAAAAAAKIACKLdXqwahqjNbtNs1piUlonluvxOsF9Feeh9k7qXay5zdrm239cW4WQUD/l5ptTzRLU9bSbghnv0FLaRA7tly7La9/QRKDXwZMsbWajlhKQh2ovYnjh6C37qtyPs151ITDFr+67FRgG0c2dJCoOa2hQB8z0tJYuXrkGMpVk0ZSn1qjfeYxJ1V9BDRsfN7r0lVC8sF/w5OJlSomw64qampRylAQIDJiABIVgguxHN3W6ehp0VWXKaMNie1J82MVJCFZYScau74o17cx8iWCDb1jkTLi7lYZZbgwUwpqAk8QmIiPMTVQUVkhGEyGrKww==",
                "clientDataJSON": "eyJjaGFsbGVuZ2UiOiIzM0VIYXYtaloxdjlxd0g3ODNhVS1qMEFSeDZyNW8tWUhoLXdkN0M2alBiZDdXaDZ5dGJJWm9zSUlBQ2Vod2Y5LXM2aFhoeVNITy1ISFVqRXdaUzI5dyIsImNsaWVudEV4dGVuc2lvbnMiOnt9LCJoYXNoQWxnb3JpdGhtIjoiU0hBLTI1NiIsIm9yaWdpbiI6Imh0dHBzOi8vbG9jYWxob3N0Ojg0NDMiLCJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIn0="
            }
        }
    };

    // TODO: needs update
    var challengeResponseAttestationU2fMsg = {
        body: {
            "binaryEncoding": "base64",
            "username": "adam",
            "id": "vBWXdRT2VXSuW4pT/wh5lzSUgry4dZAyMWgF0huNj587MNywnnHk5/fQQc/bq8A4ZEgcvbJHQBp5OAHEuK4USg==",
            "response": {
                "attestationObject": "o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YVjESZYN5YgOjGh0NBcPZHZgW4/krrmihjLHmVzzuoMdl2NBAAAAAAAAAAAAAAAAAAAAAAAAAAAAQLwVl3UU9lV0rluKU/8IeZc0lIK8uHWQMjFoBdIbjY+fOzDcsJ5x5Of30EHP26vAOGRIHL2yR0AaeTgBxLiuFEqlAQIDJiABIVgguxfgReQylzXn7sreuilLMKYCxjQnLpyKMA2rsh0dcEIiWCCkdVG3htONUrHiLlDCqbNWI5dwIv/YlFI24v37Ne3r6w==",
                "clientDataJSON": "eyJjaGFsbGVuZ2UiOiJBQ1dSMVNIeUpRUVFBWG1ESlFjbV9mQmgxQXNLcU9qTWRQbW15clg4QUMwdElJU3VoMDBwZWFaV1V5N2RLR2xHVjUxOW1MQnVoNnFkY0pvdlpLNkd5USIsImNsaWVudEV4dGVuc2lvbnMiOnt9LCJoYXNoQWxnb3JpdGhtIjoiU0hBLTI1NiIsIm9yaWdpbiI6Imh0dHBzOi8vbG9jYWxob3N0Ojg0NDMiLCJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIn0="
            }
        }
    };


    // attestationObject
    // A3 63 66 6D 74 64 6E 6F 6E 65 67 61 74 74 53 74
    // 6D 74 A0 68 61 75 74 68 44 61 74 61 59 01 26 49
    // 96 0D E5 88 0E 8C 68 74 34 17 0F 64 76 60 5B 8F
    // E4 AE B9 A2 86 32 C7 99 5C F3 BA 83 1D 97 63 41
    // 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
    // 00 00 00 00 00 A2 00 08 A2 DD 5E AC 1A 86 A8 CD
    // 6E D3 6C D6 98 94 96 89 E5 BA FC 4E B0 5F 45 79
    // E8 7D 93 BA 97 6B 2E 73 76 B9 B6 DF D7 16 E1 64
    // 14 0F F9 79 A6 D4 F3 44 B5 3D 6D 26 E0 86 7B F4
    // 14 B6 91 03 BB 65 CB B2 DA F7 F4 11 28 35 F0 64
    // CB 1B 59 A8 E5 84 A4 21 DA 8B D8 9E 38 7A 0B 7E
    // EA B7 23 EC D7 9D 48 4C 31 6B FB AE C5 46 01 B4
    // 73 67 49 0A 83 9A DA 14 01 F3 3D 2D 25 8B 97 AE
    // 41 8C A5 59 34 65 29 F5 AA 37 DE 63 12 75 57 D0
    // 43 46 C7 CD EE BD 25 54 2F 2C 17 FC 39 38 99 52
    // A2 6C 3A E2 A6 A6 A5 1C A5 01 02 03 26 20 01 21
    // 58 20 BB 11 CD DD 6E 9E 86 9D 15 59 72 9A 30 D8
    // 9E D4 9F 36 31 52 42 15 96 12 71 AB BB E2 8D 7B
    // 73 1F 22 58 20 DB D6 39 13 2E 2E E5 61 96 5B 83
    // 05 30 A6 A0 24 F1 09 88 88 F3 13 55 05 15 92 11
    // 84 C8 6A CA C3

    // clientDataJson
    // 7B 22 63 68 61 6C 6C 65 6E 67 65 22 3A 22 33 33
    // 45 48 61 76 2D 6A 5A 31 76 39 71 77 48 37 38 33
    // 61 55 2D 6A 30 41 52 78 36 72 35 6F 2D 59 48 68
    // 2D 77 64 37 43 36 6A 50 62 64 37 57 68 36 79 74
    // 62 49 5A 6F 73 49 49 41 43 65 68 77 66 39 2D 73
    // 36 68 58 68 79 53 48 4F 2D 48 48 55 6A 45 77 5A
    // 53 32 39 77 22 2C 22 63 6C 69 65 6E 74 45 78 74
    // 65 6E 73 69 6F 6E 73 22 3A 7B 7D 2C 22 68 61 73
    // 68 41 6C 67 6F 72 69 74 68 6D 22 3A 22 53 48 41
    // 2D 32 35 36 22 2C 22 6F 72 69 67 69 6E 22 3A 22
    // 68 74 74 70 73 3A 2F 2F 6C 6F 63 61 6C 68 6F 73
    // 74 3A 38 34 34 33 22 2C 22 74 79 70 65 22 3A 22
    // 77 65 62 61 75 74 68 6E 2E 63 72 65 61 74 65 22
    // 7D

    var server = {
        challengeRequestMsg: challengeRequestMsg,
        challengeResponseAttestationNoneMsg: challengeResponseAttestationNoneMsg,
        challengeResponseAttestationU2fMsg: challengeResponseAttestationU2fMsg
    };

    /********************************************************************************
     *********************************************************************************
     * LIB PARAMS
     *********************************************************************************
     *********************************************************************************/

    var makeCredentialAttestationNoneResponse = {
        username: challengeResponseAttestationNoneMsg.body.username,
        id: challengeResponseAttestationNoneMsg.body.id,
        response: {
            attestationObject: b64decode(challengeResponseAttestationNoneMsg.body.response.attestationObject),
            clientDataJSON: b64decode(challengeResponseAttestationNoneMsg.body.response.clientDataJSON)
        }
    };

    var makeCredentialAttestationU2fResponse = {
        username: challengeResponseAttestationU2fMsg.body.username,
        id: challengeResponseAttestationU2fMsg.body.id,
        response: {
            attestationObject: b64decode(challengeResponseAttestationU2fMsg.body.response.attestationObject),
            clientDataJSON: b64decode(challengeResponseAttestationU2fMsg.body.response.clientDataJSON)
        }
    };

    var lib = {
        makeCredentialAttestationNoneResponse: makeCredentialAttestationNoneResponse,
        makeCredentialAttestationU2fResponse: makeCredentialAttestationU2fResponse
    };

    /********************************************************************************
     *********************************************************************************
     * NAKED FIELDS
     *********************************************************************************
     *********************************************************************************/
    var clientDataJsonBuf = makeCredentialAttestationNoneResponse.response.clientDataJSON;
    var clientDataJsonObj = {
        challenge: '33EHav-jZ1v9qwH783aU-j0ARx6r5o-YHh-wd7C6jPbd7Wh6ytbIZosIIACehwf9-s6hXhySHO-HHUjEwZS29w',
        clientExtensions: {},
        hashAlgorithm: 'SHA-256',
        origin: 'https://localhost:8443',
        type: 'webauthn.create'
    };
    var authDataNoneArray = [
        0x49, 0x96, 0x0D, 0xE5, 0x88, 0x0E, 0x8C, 0x68, 0x74, 0x34, 0x17, 0x0F, 0x64, 0x76, 0x60, 0x5B,
        0x8F, 0xE4, 0xAE, 0xB9, 0xA2, 0x86, 0x32, 0xC7, 0x99, 0x5C, 0xF3, 0xBA, 0x83, 0x1D, 0x97, 0x63,
        0x41, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xA2, 0x00, 0x08, 0xA2, 0xDD, 0x5E, 0xAC, 0x1A, 0x86, 0xA8,
        0xCD, 0x6E, 0xD3, 0x6C, 0xD6, 0x98, 0x94, 0x96, 0x89, 0xE5, 0xBA, 0xFC, 0x4E, 0xB0, 0x5F, 0x45,
        0x79, 0xE8, 0x7D, 0x93, 0xBA, 0x97, 0x6B, 0x2E, 0x73, 0x76, 0xB9, 0xB6, 0xDF, 0xD7, 0x16, 0xE1,
        0x64, 0x14, 0x0F, 0xF9, 0x79, 0xA6, 0xD4, 0xF3, 0x44, 0xB5, 0x3D, 0x6D, 0x26, 0xE0, 0x86, 0x7B,
        0xF4, 0x14, 0xB6, 0x91, 0x03, 0xBB, 0x65, 0xCB, 0xB2, 0xDA, 0xF7, 0xF4, 0x11, 0x28, 0x35, 0xF0,
        0x64, 0xCB, 0x1B, 0x59, 0xA8, 0xE5, 0x84, 0xA4, 0x21, 0xDA, 0x8B, 0xD8, 0x9E, 0x38, 0x7A, 0x0B,
        0x7E, 0xEA, 0xB7, 0x23, 0xEC, 0xD7, 0x9D, 0x48, 0x4C, 0x31, 0x6B, 0xFB, 0xAE, 0xC5, 0x46, 0x01,
        0xB4, 0x73, 0x67, 0x49, 0x0A, 0x83, 0x9A, 0xDA, 0x14, 0x01, 0xF3, 0x3D, 0x2D, 0x25, 0x8B, 0x97,
        0xAE, 0x41, 0x8C, 0xA5, 0x59, 0x34, 0x65, 0x29, 0xF5, 0xAA, 0x37, 0xDE, 0x63, 0x12, 0x75, 0x57,
        0xD0, 0x43, 0x46, 0xC7, 0xCD, 0xEE, 0xBD, 0x25, 0x54, 0x2F, 0x2C, 0x17, 0xFC, 0x39, 0x38, 0x99,
        0x52, 0xA2, 0x6C, 0x3A, 0xE2, 0xA6, 0xA6, 0xA5, 0x1C, 0xA5, 0x01, 0x02, 0x03, 0x26, 0x20, 0x01,
        0x21, 0x58, 0x20, 0xBB, 0x11, 0xCD, 0xDD, 0x6E, 0x9E, 0x86, 0x9D, 0x15, 0x59, 0x72, 0x9A, 0x30,
        0xD8, 0x9E, 0xD4, 0x9F, 0x36, 0x31, 0x52, 0x42, 0x15, 0x96, 0x12, 0x71, 0xAB, 0xBB, 0xE2, 0x8D,
        0x7B, 0x73, 0x1F, 0x22, 0x58, 0x20, 0xDB, 0xD6, 0x39, 0x13, 0x2E, 0x2E, 0xE5, 0x61, 0x96, 0x5B,
        0x83, 0x05, 0x30, 0xA6, 0xA0, 0x24, 0xF1, 0x09, 0x88, 0x88, 0xF3, 0x13, 0x55, 0x05, 0x15, 0x92,
        0x11, 0x84, 0xC8, 0x6A, 0xCA, 0xC3
    ];
    var authDataFromNone = new Uint8Array(authDataNoneArray).buffer;
    var authDataU2fArray = [];
    var authDataFromU2f = new Uint8Array(authDataU2fArray).buffer;

    var rpIdHashArray = [
        0x49, 0x96, 0x0D, 0xE5, 0x88, 0x0E, 0x8C, 0x68, 0x74, 0x34, 0x17, 0x0F, 0x64, 0x76, 0x60, 0x5B,
        0x8F, 0xE4, 0xAE, 0xB9, 0xA2, 0x86, 0x32, 0xC7, 0x99, 0x5C, 0xF3, 0xBA, 0x83, 0x1D, 0x97, 0x63
    ];
    var rpIdHash = new Uint8Array(rpIdHashArray).buffer;

    var naked = {
        clientDataJsonBuf,
        clientDataJsonObj,
        authDataFromNone,
        authDataFromU2f,
        rpIdHash
    };

    return {
        functions,
        server,
        lib,
        naked
    };
})); /* end AMD module */

/* JSHINT */
/* exported server, authenticatorMakeCredentialCommandCbor, derEccPublicKey, credentialCbor, makeCredRespCbor, getAssertRespCbor */
/* globals define */