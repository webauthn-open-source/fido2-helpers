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

    /* begin helpers */
    function arrayBufferEquals(b1, b2) {
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
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

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

    var challengeStr = "abc123def456";
    var challengeBuf = str2ab(challengeStr);
    var clientDataJson = '{"challenge":"' + b64encode(challengeBuf) + '","origin":"http://localhost:9999","hashAlg":"S256"}';
    var clientData = JSON.parse(clientDataJson);
    // hashes can be generated with: http://www.xorbin.com/tools/sha256-hash-calculator
    var rpIdHashHex = "49960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d9763";
    var clientDataJsonBuf = str2ab(clientDataJson);
    var clientDataBase64 = b64encode(clientDataJsonBuf);
    var clientDataHashHex = "8f5e036f15c71efda91f28d208d78e606450005f94bb657f1566f71d007be73a";
    var packedSelfAttestation = new Uint8Array([
        0xA3,                                                                                                       // map(3)
            0x63,                                                                                                   // key(3)
                0x66, 0x6D, 0x74,                                                                                   // "alg"
            0x66,                                                                                                   // text(5)
                0x70, 0x61, 0x63, 0x6B, 0x65, 0x64,                                                                 // "packed"
            0x68,                                                                                                   // key(8)
                0x61, 0x75, 0x74, 0x68, 0x44, 0x61, 0x74, 0x61,                                                     // "authData"
            0x59, 0x01, 0x6D,                                                                                       // bytes(365)
                0x49, 0x96, 0x0D, 0xE5, 0x88, 0x0E, 0x8C, 0x68, 0x74, 0x34, 0x17, 0x0F, 0x64, 0x76, 0x60, 0x5B,     // [authenticator data]
                0x8F, 0xE4, 0xAE, 0xB9, 0xA2, 0x86, 0x32, 0xC7, 0x99, 0x5C, 0xF3, 0xBA, 0x83, 0x1D, 0x97, 0x63,     // ...
                0x41, 0x00, 0x00, 0x00, 0x01, 0xF1, 0xD0, 0xF1, 0xD0, 0xF1, 0xD0, 0xF1, 0xD0, 0xF1, 0xD0, 0xF1,     // ...
                0xD0, 0xF1, 0xD0, 0xF1, 0xD0, 0x00, 0x20, 0x08, 0x59, 0x20, 0x4C, 0xCC, 0x24, 0xED, 0xB3, 0xFE,     // ...
                0x45, 0x52, 0xC1, 0x67, 0x50, 0xCA, 0xB7, 0xA6, 0x96, 0x25, 0x61, 0xDA, 0x26, 0xFB, 0xE9, 0xC6,     // ...
                0xEC, 0xBD, 0xD2, 0x56, 0xF3, 0x27, 0x44, 0xA3, 0x63, 0x61, 0x6C, 0x67, 0x65, 0x52, 0x53, 0x32,     // ...
                0x35, 0x36, 0x61, 0x6E, 0x59, 0x01, 0x00, 0xA3, 0xC7, 0xEF, 0x14, 0xE2, 0xC5, 0x7E, 0xF3, 0x4A,     // ...
                0x11, 0xC1, 0xBC, 0xCA, 0x66, 0x19, 0xFD, 0x3D, 0x13, 0x01, 0xB4, 0x19, 0x6A, 0x5D, 0xF5, 0xAA,     // ...
                0x52, 0x97, 0xFC, 0xF8, 0xDB, 0xF4, 0xA0, 0x78, 0x89, 0xC0, 0x8A, 0x1C, 0x92, 0x8E, 0x30, 0x21,     // ...
                0x77, 0xE8, 0xA1, 0x03, 0x6E, 0xA8, 0x4B, 0x33, 0x7A, 0x74, 0xE3, 0x84, 0xF8, 0x52, 0x5A, 0x7B,     // ...
                0x71, 0x39, 0xD6, 0x71, 0x78, 0xCF, 0x46, 0x94, 0xB5, 0x6D, 0x55, 0x68, 0x88, 0x2D, 0xBA, 0xEA,     // ...
                0xDD, 0x01, 0x0B, 0x45, 0x54, 0xE1, 0xE1, 0x8A, 0x5A, 0xD1, 0xC5, 0x5E, 0x5B, 0x07, 0xFD, 0x52,     // ...
                0x95, 0x9C, 0x54, 0xDF, 0x2E, 0x29, 0x1D, 0x6C, 0xDB, 0xCA, 0x6E, 0x1D, 0xD1, 0xEE, 0xE7, 0xAE,     // ...
                0x87, 0x3F, 0xB7, 0x0D, 0x86, 0x68, 0x81, 0xDF, 0x37, 0x94, 0x46, 0xC0, 0x90, 0x49, 0xEE, 0xAE,     // ...
                0xBA, 0x09, 0xF7, 0x90, 0xDE, 0x90, 0xE8, 0xF2, 0x38, 0x66, 0x28, 0x04, 0x44, 0x4F, 0x64, 0x20,     // ...
                0xDF, 0x2E, 0x44, 0x9D, 0x9B, 0xBB, 0x4B, 0x0C, 0x22, 0x8D, 0x45, 0x4B, 0xCD, 0x18, 0xD8, 0x57,     // ...
                0x91, 0x22, 0x73, 0x7E, 0xE5, 0x6D, 0xC0, 0x82, 0x6C, 0xB7, 0x95, 0x73, 0x92, 0xB7, 0xBF, 0x37,     // ...
                0x36, 0x69, 0xCD, 0xE4, 0xC0, 0x17, 0xD4, 0x4D, 0x99, 0x64, 0x4F, 0xA1, 0xE4, 0xD2, 0x3E, 0x6F,     // ...
                0xF7, 0xE2, 0x5C, 0x6F, 0x3F, 0x80, 0xE0, 0xD0, 0x1D, 0x07, 0x2B, 0x3C, 0x77, 0xA9, 0x96, 0x4F,     // ...
                0x9C, 0x74, 0xCC, 0x88, 0x69, 0x0C, 0x77, 0x59, 0x00, 0x03, 0x00, 0x18, 0x3D, 0x0F, 0x28, 0x47,     // ...
                0x15, 0xD1, 0x65, 0xD3, 0xFC, 0x54, 0x94, 0x7C, 0xAE, 0x0E, 0x13, 0x58, 0x45, 0x20, 0x35, 0x92,     // ...
                0x6C, 0x07, 0xCA, 0x89, 0xD0, 0xB0, 0x73, 0x28, 0x7E, 0xE0, 0x03, 0x89, 0xB9, 0x01, 0xB9, 0x83,     // ...
                0x59, 0x2B, 0x7E, 0x43, 0x52, 0x82, 0xE7, 0x61, 0x65, 0x43, 0x01, 0x00, 0x01,                       // ...
            0x67,                                                                                                   // key(7)
                0x61, 0x74, 0x74, 0x53, 0x74, 0x6D, 0x74,                                                           // "attStmt"
            0xA2,                                                                                                   // map(2)
                0x63,                                                                                               // key(3)
                    0x61, 0x6C, 0x67,                                                                               // "alg"
                0x65,                                                                                               // text(5)
                    0x52, 0x53, 0x32, 0x35, 0x36,                                                                   // "RS256"
                0x63,                                                                                               // key(3)
                    0x73, 0x69, 0x67,                                                                               // "sig"
                0x59, 0x01, 0x00,                                                                                   // bytes(256)
                    0x99, 0x9D, 0x4D, 0x9A, 0xB3, 0x61, 0x96, 0xFB, 0x9E, 0x5F, 0xA0, 0xAC, 0x3A, 0xEA, 0x75, 0x89, // [RS256 signature]
                    0xEF, 0x6F, 0x70, 0x42, 0x42, 0x6C, 0x05, 0x3A, 0x8D, 0xF8, 0xFC, 0xA7, 0x58, 0x86, 0x4C, 0xC0, // ...
                    0xA4, 0xF3, 0xD6, 0x6B, 0x83, 0x54, 0x42, 0x40, 0x9C, 0x25, 0x11, 0x6D, 0xF1, 0x7B, 0x01, 0xD8, // ...
                    0xE9, 0xC1, 0x1F, 0x82, 0x93, 0x8A, 0x8E, 0x66, 0x54, 0x43, 0xF0, 0x8D, 0x99, 0xCF, 0x07, 0x16, // ...
                    0x26, 0x05, 0xBB, 0xA5, 0xF0, 0x71, 0x9A, 0x2A, 0xFD, 0xF0, 0x2E, 0xC8, 0xD3, 0x62, 0x04, 0xE6, // ...
                    0x13, 0x41, 0x82, 0xAE, 0x45, 0x47, 0x54, 0xF6, 0x97, 0xFD, 0xAB, 0xE2, 0x77, 0x92, 0xBA, 0x22, // ...
                    0xB8, 0xEB, 0x04, 0x54, 0xF0, 0xA4, 0xB6, 0x6A, 0xA0, 0x0D, 0xDB, 0x8A, 0xF6, 0xD9, 0xD1, 0x02, // ...
                    0x25, 0xC6, 0xFF, 0x61, 0x94, 0xF5, 0x95, 0x8B, 0xED, 0x20, 0xA0, 0x82, 0x79, 0xAE, 0x6F, 0x51, // ...
                    0xFF, 0xEA, 0xBC, 0x0D, 0xCD, 0xC1, 0xAB, 0x27, 0x99, 0x36, 0x7A, 0xFE, 0x99, 0xCF, 0x2B, 0x19, // ...
                    0x5A, 0x30, 0xD3, 0x13, 0xAC, 0xEC, 0xE9, 0x7C, 0x2F, 0x5E, 0x0A, 0x74, 0xE5, 0xEC, 0xF7, 0xE6, // ...
                    0x4B, 0x4E, 0xBA, 0xBF, 0x6A, 0xE0, 0xE3, 0x38, 0x6E, 0xA9, 0x68, 0x55, 0x39, 0xDF, 0xB4, 0x22, // ...
                    0x0D, 0xC5, 0x15, 0x5C, 0xA3, 0xC7, 0x5C, 0x27, 0x72, 0x9B, 0x91, 0xC7, 0xD9, 0x70, 0xAA, 0x14, // ...
                    0x65, 0x38, 0x42, 0x9E, 0xF9, 0xE6, 0x5E, 0xFC, 0x4B, 0x7E, 0xF8, 0xB6, 0xF8, 0x57, 0xF1, 0x83, // ...
                    0xF0, 0x02, 0xC4, 0xDA, 0x01, 0x41, 0x7C, 0xC5, 0x82, 0x06, 0x5D, 0x87, 0x0B, 0x6E, 0x73, 0x4F, // ...
                    0x39, 0xE7, 0xD6, 0x39, 0xE5, 0xD3, 0xE2, 0xB8, 0xD9, 0xF6, 0xAD, 0xE1, 0x7E, 0x21, 0xB0, 0x4B, // ...
                    0x19, 0x7B, 0x3A, 0xB4, 0xF0, 0xDF, 0xDF, 0xB7, 0x87, 0x0F, 0x3E, 0xA5, 0x10, 0x75, 0x4C, 0x84  // ...
        ]).buffer;

    return {
        userAccountInformation: {
            rpDisplayName: "PayPal",
            displayName: "John P. Smith",
            name: "johnpsmith@gmail.com",
            id: "1098237235409872",
            imageUri: "https://pics.paypal.com/00/p/aBjjjpqPb.png"
        },
        cryptoParams: [{
            type: "ScopedCred",
            algorithm: "RSASSA-PKCS1-v1_5",
        }],
        expectedCryptoParams: {
            type: "ScopedCred",
            algorithm: "RSASSA-PKCS1-v1_5",
        },
        opts: {},
        scopedCredentialType: "ScopedCred",

        /**
         * a challenge for makeCredential or getAttestation
         * @type {ArrayBuffer}
         */
        challenge: (Uint8Array.from(challengeStr.split("").map(function(ch) {return ch.charCodeAt(0)}))).buffer,

        /**
         * the string version of `challenge`
         * @type {String}
         */
        challengeBase64: "YWJjMTIzZGVmNDU2",

        /**
         * A typical response for the makeCredential() call, mostly based on ScopedCredentialInfo
         * @type {Object}
         */
        // makeCredentialResponse: {
        //     clientDataJSON: clientDataJsonBuf,

        // },

        /**
         * options for makeCredential or getAssertion that cause it to time out after 1 second
         * @type {Object}
         */
        timeoutOpts: {
            timeout: 1
        },

        /**
         * A self-attestation example
         * @type {Object}
         */
        makeCredentialSelfAttestationResponse: {
            clientDataJSON: clientDataJsonBuf,
            attestationObject: packedSelfAttestation
        },

        /**
         * Typical client data
         * @type {Object}
         * @see https://www.w3.org/TR/webauthn/#sec-client-data
         */
        clientData: clientData,

        /**
         * The example clientData, encoded as base64 JSON
         * @type {String}
         */
        clientDataBase64: clientDataBase64,
        clientDataJsonBuf: clientDataJsonBuf,

        /**
         * A SHA256 hash of the example clientDataBase64, encoded as a hex string
         * @type {String}
         */
        clientDataHashHex: clientDataHashHex,
        clientDataHash: hex2ab(clientDataHashHex),
        /**
         * the default relying party ID
         * @type {String}
         */
        rpId: "localhost",

        /**
         * the hash of the rpId ("localhost"), encoded as a hex string
         * @type {String}
         */
        rpIdHashHex: rpIdHashHex,
        rpIdHash: hex2ab(rpIdHashHex),
        packedSelfAttestation: packedSelfAttestation,
        /**
         * Typical authenticator data
         * @type {Object}
         * @see https://www.w3.org/TR/webauthn/#authenticatordata
         */
        authenticatorData: [],

        arrayBufferEquals: arrayBufferEquals,
        hex2ab: hex2ab,
        str2ab: str2ab,
        ab2str: ab2str,
        b64decode: b64decode,
        b64encode: b64encode
    };
})); /* end AMD module */

/* JSHINT */
/* exported server, authenticatorMakeCredentialCommandCbor, derEccPublicKey, credentialCbor, makeCredRespCbor, getAssertRespCbor */
/* globals define */