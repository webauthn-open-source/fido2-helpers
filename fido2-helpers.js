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
    function hexToArrayBuffer(hex) {
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
    var rpIdHashHex = "49960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d9763";
    var clientDataBase64 = "ew0KImNoYWxsZW5nZSI6ICJhYmMxMjNkZWY0NTYiLA0KIm9yaWdpbiI6ICJsb2NhbGhvc3QiLA0KImhhc2hBbGciOiAiUzI1NiINCn0=";
    var clientDataJsonBuf = new Uint8Array([
        0x7b, 0x0d, 0x0a, 0x22, 0x63, 0x68, 0x61, 0x6c, 0x6c, 0x65, 0x6e, 0x67, 0x65, 0x22, 0x3a, 0x20,
        0x22, 0x61, 0x62, 0x63, 0x31, 0x32, 0x33, 0x64, 0x65, 0x66, 0x34, 0x35, 0x36, 0x22, 0x2c, 0x0d,
        0x0a, 0x22, 0x6f, 0x72, 0x69, 0x67, 0x69, 0x6e, 0x22, 0x3a, 0x20, 0x22, 0x6c, 0x6f, 0x63, 0x61,
        0x6c, 0x68, 0x6f, 0x73, 0x74, 0x22, 0x2c, 0x0d, 0x0a, 0x22, 0x68, 0x61, 0x73, 0x68, 0x41, 0x6c,
        0x67, 0x22, 0x3a, 0x20, 0x22, 0x53, 0x32, 0x35, 0x36, 0x22, 0x0d, 0x0a, 0x7d
    ]).buffer;
    var clientDataHashHex = "7CA8E7527A68F3034FB8D380C8726BCDE8EF25B8610996CC492EB7AA7B42DB44";
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
        challenge: new ArrayBuffer([
            0x61, 0x62, 0x63, 0x31, 0x32, 0x33, 0x64, 0x65, 0x66, 0x34, 0x35, 0x36
        ]),

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
        clientData: {
            challenge: "abc123def456",
            origin: "localhost",
            hashAlg: "S256",
            // tokenBinding: "",
            // extensions: {}
        },

        /**
         * The example clientData, encoded as base64 JSON
         * @type {String}
         */
        clientDataBase64: clientDataBase64,
        // {
        // "challenge": "abc123def456",
        // "origin": "localhost",
        // "hashAlg": "S256"
        // }

        /**
         * A SHA256 hash of the example clientDataBase64, encoded as a hex string
         * @type {String}
         */
        clientDataHashHex: clientDataHashHex,

        // clientDataHash: "42d3fc09b8448e7c3ef0e942d5410abe7b6122b095b54035f90aca467814e972",
        clientDataHash: (Uint8Array.from(clientDataHashHex.match(/.{2}/g), function(hex) {
            return parseInt(hex, 16);
        })).buffer,
        clientDataJsonBuf: clientDataJsonBuf,
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
        rpIdHash: hexToArrayBuffer(rpIdHashHex),
        packedSelfAttestation: packedSelfAttestation,
        /**
         * Typical authenticator data
         * @type {Object}
         * @see https://www.w3.org/TR/webauthn/#authenticatordata
         */
        authenticatorData: [],

        hexToArrayBuffer: hexToArrayBuffer,
    };
})); /* end AMD module */

/* JSHINT */
/* exported server, authenticatorMakeCredentialCommandCbor, derEccPublicKey, credentialCbor, makeCredRespCbor, getAssertRespCbor */
/* globals define */