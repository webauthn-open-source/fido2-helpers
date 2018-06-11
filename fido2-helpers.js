"use strict";

/* Universial Module (UMD) design pattern
 * https://github.com/umdjs/umd/blob/master/templates/returnExports.js
 */
(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        // register as an AMD anonymous module
        define([], factory);
    } else if (typeof module === "object" && module.exports) {
        // use a node.js style export
        module.exports = factory();
    } else {
        // if this isn't running under Node or AMD, just set a global variable
        root.fido2Helpers = factory();
    }
    // the return value of this function is what becomes the AMD / CommonJS / Global export
}(this, function() { // eslint-disable-line no-invalid-this

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
            console.log("Bad args to printHex"); // eslint-disable-line no-console
            return;
        }
        if (!(buf instanceof ArrayBuffer)) {
            console.log("Attempted printHex with non-ArrayBuffer:", buf); // eslint-disable-line no-console
            return;
        }

        // print the buffer as a 16 byte long hex string
        var arr = new Uint8Array(buf);
        var len = buf.byteLength;
        var i, str = "";
        console.log(msg, `(${buf.byteLength} bytes)`); // eslint-disable-line no-console
        for (i = 0; i < len; i++) {
            var hexch = arr[i].toString(16);
            hexch = (hexch.length == 1) ? ("0" + hexch) : hexch;
            str += hexch.toUpperCase() + " ";
            if (i && !((i + 1) % 16)) {
                console.log(str); // eslint-disable-line no-console
                str = "";
            }
        }
        // print the remaining bytes
        if ((i) % 16) {
            console.log(str); // eslint-disable-line no-console
        }
    }

    function arrayBufferEquals(b1, b2) {
        if (!(b1 instanceof ArrayBuffer) ||
            !(b2 instanceof ArrayBuffer)) {
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
        if (typeof hex !== "string") {
            throw new TypeError("Expected input to be a string");
        }

        if ((hex.length % 2) !== 0) {
            throw new RangeError("Expected string to be an even number of characters");
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
    for (let i = 0; i < chars.length; i++) {
        lookup[chars.charCodeAt(i)] = i;
    }

    function b64decode(base64) {
        if (typeof base64 !== "string") {
            throw new TypeError("exepcted base64 to be string, got: " + base64);
        }

        base64 = base64.replace(/-/g, "+").replace(/_/g, "/");
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
        return String.fromCharCode.apply(null, new Uint8Array(buf));
    }

    function bufEqual(a, b) {
        var len = a.length;

        if (!(a instanceof Buffer) ||
            !(b instanceof Buffer)) {
            throw new TypeError("bad args: expected Buffers");
        }

        if (len !== b.length) {
            return false;
        }

        for (let i = 0; i < len; i++) {
            if (a.readUInt8(i) !== b.readUInt8(i)) {
                return false;
            }
        }

        return true;
    }

    function abEqual(a, b) {
        var len = a.byteLength;

        if (len !== b.byteLength) {
            return false;
        }

        a = new Uint8Array(a);
        b = new Uint8Array(b);
        for (let i = 0; i < len; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }

        return true;
    }

    function cloneObject(obj) {
        if (obj === undefined) {
            throw new TypeError("obj was undefined");
        }
        return JSON.parse(JSON.stringify(obj));
    }

    function coerceToArrayBuffer(buf, name) {
        if (typeof buf === "string") {
            // base64url to base64
            buf = buf.replace(/-/g, "+").replace(/_/g, "/");
            // base64 to Buffer
            buf = Buffer.from(buf, "base64");
        }

        // Buffer or Array to Uint8Array
        if (buf instanceof Buffer || Array.isArray(buf)) {
            buf = new Uint8Array(buf);
        }

        // Uint8Array to ArrayBuffer
        if (buf instanceof Uint8Array) {
            buf = buf.buffer;
        }

        // error if none of the above worked
        if (!(buf instanceof ArrayBuffer)) {
            throw new TypeError(`could not coerce '${name}' to ArrayBuffer`);
        }

        return buf;
    }

    var functions = {
        printHex,
        arrayBufferEquals,
        hex2ab,
        str2ab,
        b64decode,
        b64encode,
        ab2str,
        bufEqual,
        abEqual,
        cloneObject,
        coerceToArrayBuffer
    };


    /********************************************************************************
     *********************************************************************************
     * CTAP2 MSGS
     *********************************************************************************
     *********************************************************************************/

    // var makeCredReq = "AaQBWCAmxXQY29T5II0ouvR1rOW0iHKXRtx5dKEFO_8Ezgl51gKiYmlkc2h0dHBzOi8vZXhhbXBsZS5jb21kbmFtZXgYVGhlIEV4YW1wbGUgQ29ycG9yYXRpb24hA6RiaWRYIIt5GedNcaaY_GSTvnLIEagifkIT4fV8oCd_eAf6MivpZGljb254KGh0dHBzOi8vcGljcy5hY21lLmNvbS8wMC9wL2FCampqcHFQYi5wbmdkbmFtZXZqb2hucHNtaXRoQGV4YW1wbGUuY29ta2Rpc3BsYXlOYW1lbUpvaG4gUC4gU21pdGgEgqJjYWxnJmR0eXBlanB1YmxpYy1rZXmiY2FsZzkBAGR0eXBlanB1YmxpYy1rZXk";
    // var ctap2ClientData = "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoibU11LVlVUU85amZYZWIyaWNIeXlJRWJRelN1VFJNbXFlR3hka3R3UVZ6dyIsIm9yaWdpbiI6Imh0dHBzOi8vZXhhbXBsZS5jb20ifQ";
    // var makeCredResp = "AKMBZnBhY2tlZAJZAMQQBoCtVGzmpXf0L1LfM7TP3KdWhZ5mS4194ymxUNCc6UEAAAQE-KAR84wKTRWABhcRH57cfQBAVnYjWrbswoCsYrv7iPDzl1-2Q9ACivVIhP2p_GumWw-HFo5Q7Tlo0vdiHk7E2Bc_u32IpTDK4nhBu5GPRWfXeKUBAgMmIAEhWCB2k630Xmpgcw1Hs0-h6uyOTCDFfIjLCQ6CBNnuHi7B4iJYIBHcfy7jcKW1eZE5LqbFSu3Mq8i100Pt1dM4uXljlSO2A6NjYWxnJmNzaWdYRzBFAiAAzt45GP_n-VK_xdKDrdsPdSLLPN_8tIQ5Gjloi5vSzAIhAICTWwvWjdvehi2v5g7kk48t0mZWudF1zJkMvKrl2hCWY3g1Y4FZAZcwggGTMIIBOKADAgECAgkAhZtybLJLTCkwCgYIKoZIzj0EAwIwRzELMAkGA1UEBhMCVVMxFDASBgNVBAoMC1l1YmljbyBUZXN0MSIwIAYDVQQLDBlBdXRoZW50aWNhdG9yIEF0dGVzdGF0aW9uMB4XDTE2MTIwNDExNTUwMFoXDTI2MTIwMjExNTUwMFowRzELMAkGA1UEBhMCVVMxFDASBgNVBAoMC1l1YmljbyBUZXN0MSIwIAYDVQQLDBlBdXRoZW50aWNhdG9yIEF0dGVzdGF0aW9uMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAErRHrDohS5TrV3-2GtB5hNKGOxOGvjyIaPH1uY2yA6hPD1QT_LnYhG7RFJbGWxEy0hJl5z2-Jbs0ruGDeG_Q3a6MNMAswCQYDVR0TBAIwADAKBggqhkjOPQQDAgNJADBGAiEA6aOfGwMZdSX3Nz4QznfngCFzG5TQwD8_2h_SLbPQMOcCIQDE-uw0Raggz0MSnNsAqr79muLYdPnF00PLLxE9ojcj8w";

    // var getAssertionReq = "AqMBc2h0dHBzOi8vZXhhbXBsZS5jb20CWCAzxPe7r0xKXYUt1EQReyXHwOpvEmNkDb9PmQcxRMU58QOBomJpZFhAVnYjWrbswoCsYrv7iPDzl1-2Q9ACivVIhP2p_GumWw-HFo5Q7Tlo0vdiHk7E2Bc_u32IpTDK4nhBu5GPRWfXeGR0eXBlanB1YmxpYy1rZXkeyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiVU9mREVnbThrMWRfaU5UM2ZXdDFkZVloSDRrT3JPS1BpV2xCNmYyNGRjTSIsIm9yaWdpbiI6Imh0dHBzOi8vZXhhbXBsZS5jb20ifQ";
    // var getAssertionResp = "AKMBomJpZFhAVnYjWrbswoCsYrv7iPDzl1-2Q9ACivVIhP2p_GumWw-HFo5Q7Tlo0vdiHk7E2Bc_u32IpTDK4nhBu5GPRWfXeGR0eXBlanB1YmxpYy1rZXkCWQAlEAaArVRs5qV39C9S3zO0z9ynVoWeZkuNfeMpsVDQnOkBAAAEBQNYRjBEAiAIFzgGvsa1zUOkoirFZ6KpeXFuX5NgvRenz47_kySpIgIgDMnl-UfMYfA9OQwbkSQd2qJvbPIF4XZZVX1NNKzuwEw";


    /********************************************************************************
     *********************************************************************************
     * SERVER MSGS
     *********************************************************************************
     *********************************************************************************/

    var creationOptionsRequest = {
        username: "bubba",
        displayName: "Bubba Smith",
        authenticatorSelection: {
            authenticatorAttachment: "cross-platform",
            requireResidentKey: false,
            userVerification: "preferred"
        },
        attestation: "none"
    };

    var basicCreationOptions = {
        status: "ok",
        challenge: "sP4MiwodjreC8-80IMjcyWNlo_Y1SJXmFgQNBilnjdf30WRsjFDhDYmfY4-4uhq2HFjYREbXdr6Vjuvz2XvTjA==",
        rp: {
            name: "My RP"
        },
        user: {
            id: "YWRhbQ==",
            displayName: "Adam Powers",
            name: "apowers"
        },
        pubKeyCredParams: [{
            alg: -7,
            type: "public-key"
        }]
    };

    var completeCreationOptions = {
        status: "ok",
        challenge: "sP4MiwodjreC8-80IMjcyWNlo_Y1SJXmFgQNBilnjdf30WRsjFDhDYmfY4-4uhq2HFjYREbXdr6Vjuvz2XvTjA==",
        rp: {
            name: "My RP",
            id: "TXkgUlA=",
            icon: "aWNvbnBuZ2RhdGFibGFoYmxhaGJsYWg="
        },
        user: {
            id: "YWRhbQ==",
            displayName: "Adam Powers",
            name: "apowers",
            icon: "aWNvbnBuZ2RhdGFibGFoYmxhaGJsYWg="
        },
        pubKeyCredParams: [{
            alg: -7,
            type: "public-key"
        }],
        timeout: 30000,
        excludeCredentials: [{
            type: "public-key",
            id: "AAhH7cnPRBkcukjnc2G2GM1H5dkVs9P1q2VErhD57pkzKVjBbixdsufjXhUOfiD27D0VA-fPKUVYNGE2XYcjhihtYODQv-xEarplsa7Ix6hK13FA6uyRxMgHC3PhTbx-rbq_RMUbaJ-HoGVt-c820ifdoagkFR02Van8Vr9q67Bn6zHNDT_DNrQbtpIUqqX_Rg2p5o6F7bVO3uOJG9hUNgUb",
            transports: ["usb", "nfc", "ble"]
        }],
        authenticatorSelection: {
            authenticatorAttachment: "platform",
            requireResidentKey: true,
            userVerification: "required"
        },
        attestation: "direct",
        extensions: {}
    };

    var challengeResponseAttestationNoneMsgB64Url = {
        "rawId": "AAii3V6sGoaozW7TbNaYlJaJ5br8TrBfRXnofZO6l2suc3a5tt_XFuFkFA_5eabU80S1PW0m4IZ79BS2kQO7Zcuy2vf0ESg18GTLG1mo5YSkIdqL2J44egt-6rcj7NedSEwxa_uuxUYBtHNnSQqDmtoUAfM9LSWLl65BjKVZNGUp9ao33mMSdVfQQ0bHze69JVQvLBf8OTiZUqJsOuKmpqUc",
        "id": "AAii3V6sGoaozW7TbNaYlJaJ5br8TrBfRXnofZO6l2suc3a5tt_XFuFkFA_5eabU80S1PW0m4IZ79BS2kQO7Zcuy2vf0ESg18GTLG1mo5YSkIdqL2J44egt-6rcj7NedSEwxa_uuxUYBtHNnSQqDmtoUAfM9LSWLl65BjKVZNGUp9ao33mMSdVfQQ0bHze69JVQvLBf8OTiZUqJsOuKmpqUc",
        "response": {
            "attestationObject": "o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YVkBJkmWDeWIDoxodDQXD2R2YFuP5K65ooYyx5lc87qDHZdjQQAAAAAAAAAAAAAAAAAAAAAAAAAAAKIACKLdXqwahqjNbtNs1piUlonluvxOsF9Feeh9k7qXay5zdrm239cW4WQUD_l5ptTzRLU9bSbghnv0FLaRA7tly7La9_QRKDXwZMsbWajlhKQh2ovYnjh6C37qtyPs151ITDFr-67FRgG0c2dJCoOa2hQB8z0tJYuXrkGMpVk0ZSn1qjfeYxJ1V9BDRsfN7r0lVC8sF_w5OJlSomw64qampRylAQIDJiABIVgguxHN3W6ehp0VWXKaMNie1J82MVJCFZYScau74o17cx8iWCDb1jkTLi7lYZZbgwUwpqAk8QmIiPMTVQUVkhGEyGrKww==",
            "clientDataJSON": "eyJjaGFsbGVuZ2UiOiIzM0VIYXYtaloxdjlxd0g3ODNhVS1qMEFSeDZyNW8tWUhoLXdkN0M2alBiZDdXaDZ5dGJJWm9zSUlBQ2Vod2Y5LXM2aFhoeVNITy1ISFVqRXdaUzI5dyIsImNsaWVudEV4dGVuc2lvbnMiOnt9LCJoYXNoQWxnb3JpdGhtIjoiU0hBLTI1NiIsIm9yaWdpbiI6Imh0dHBzOi8vbG9jYWxob3N0Ojg0NDMiLCJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIn0="
        }
    };

    var getOptionsRequest = {
        username: "bubba",
        displayName: "Bubba Smith"
    };

    var basicGetOptions = {
        status: "ok",
        challenge: "sP4MiwodjreC8-80IMjcyWNlo_Y1SJXmFgQNBilnjdf30WRsjFDhDYmfY4-4uhq2HFjYREbXdr6Vjuvz2XvTjA=="
    };

    var completeGetOptions = {
        status: "ok",
        challenge: "sP4MiwodjreC8-80IMjcyWNlo_Y1SJXmFgQNBilnjdf30WRsjFDhDYmfY4-4uhq2HFjYREbXdr6Vjuvz2XvTjA==",
        timeout: 60000,
        rpId: "My RP",
        allowCredentials: [{
            type: "public-key",
            id: "AAhH7cnPRBkcukjnc2G2GM1H5dkVs9P1q2VErhD57pkzKVjBbixdsufjXhUOfiD27D0VA-fPKUVYNGE2XYcjhihtYODQv-xEarplsa7Ix6hK13FA6uyRxMgHC3PhTbx-rbq_RMUbaJ-HoGVt-c820ifdoagkFR02Van8Vr9q67Bn6zHNDT_DNrQbtpIUqqX_Rg2p5o6F7bVO3uOJG9hUNgUb",
            transports: ["usb", "nfc", "ble"]
        }],
        userVerification: "discouraged",
        extensions: {}
    };

    var challengeResponseAttestationU2fMsgB64Url = {
        // "binaryEncoding": "base64",
        "username": "adam",
        "rawId": "Bo-VjHOkJZy8DjnCJnIc0Oxt9QAz5upMdSJxNbd-GyAo6MNIvPBb9YsUlE0ZJaaWXtWH5FQyPS6bT_e698IirQ==",
        "id": "Bo-VjHOkJZy8DjnCJnIc0Oxt9QAz5upMdSJxNbd-GyAo6MNIvPBb9YsUlE0ZJaaWXtWH5FQyPS6bT_e698IirQ==",
        "response": {
            "attestationObject": "o2NmbXRoZmlkby11MmZnYXR0U3RtdKJjc2lnWEgwRgIhAO-683ISJhKdmUPmVbQuYZsp8lkD7YJcInHS3QOfbrioAiEAzgMJ499cBczBw826r1m55Jmd9mT4d1iEXYS8FbIn8MpjeDVjgVkCSDCCAkQwggEuoAMCAQICBFVivqAwCwYJKoZIhvcNAQELMC4xLDAqBgNVBAMTI1l1YmljbyBVMkYgUm9vdCBDQSBTZXJpYWwgNDU3MjAwNjMxMCAXDTE0MDgwMTAwMDAwMFoYDzIwNTAwOTA0MDAwMDAwWjAqMSgwJgYDVQQDDB9ZdWJpY28gVTJGIEVFIFNlcmlhbCAxNDMyNTM0Njg4MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAESzMfdz2BRLmZXL5FhVF-F1g6pHYjaVy-haxILIAZ8sm5RnrgRbDmbxMbLqMkPJH9pgLjGPP8XY0qerrnK9FDCaM7MDkwIgYJKwYBBAGCxAoCBBUxLjMuNi4xLjQuMS40MTQ4Mi4xLjUwEwYLKwYBBAGC5RwCAQEEBAMCBSAwCwYJKoZIhvcNAQELA4IBAQCsFtmzbrazqbdtdZSzT1n09z7byf3rKTXra0Ucq_QdJdPnFhTXRyYEynKleOMj7bdgBGhfBefRub4F226UQPrFz8kypsr66FKZdy7bAnggIDzUFB0-629qLOmeOVeAMmOrq41uxICn3whK0sunt9bXfJTD68CxZvlgV8r1_jpjHqJqQzdio2--z0z0RQliX9WvEEmqfIvHaJpmWemvXejw1ywoglF0xQ4Gq39qB5CDe22zKr_cvKg1y7sJDvHw2Z4Iab_p5WdkxCMObAV3KbAQ3g7F-czkyRwoJiGOqAgau5aRUewWclryqNled5W8qiJ6m5RDIMQnYZyq-FTZgpjXaGF1dGhEYXRhWMRJlg3liA6MaHQ0Fw9kdmBbj-SuuaKGMseZXPO6gx2XY0EAAAAAAAAAAAAAAAAAAAAAAAAAAABABo-VjHOkJZy8DjnCJnIc0Oxt9QAz5upMdSJxNbd-GyAo6MNIvPBb9YsUlE0ZJaaWXtWH5FQyPS6bT_e698IiraUBAgMmIAEhWCA1c9AIeH5sN6x1Q-2qR7v255tkeGbWs0ECCDw35kJGBCJYIBjTUxruadjFFMnWlR5rPJr23sBJT9qexY9PCc9o8hmT",
            "clientDataJSON": "eyJjaGFsbGVuZ2UiOiJWdTh1RHFua3dPamQ4M0tMajZTY24yQmdGTkxGYkdSN0txX1hKSndRbm5hdHp0VVI3WElCTDdLOHVNUENJYVFtS3cxTUNWUTVhYXpOSkZrN05ha2dxQSIsImNsaWVudEV4dGVuc2lvbnMiOnt9LCJoYXNoQWxnb3JpdGhtIjoiU0hBLTI1NiIsIm9yaWdpbiI6Imh0dHBzOi8vbG9jYWxob3N0Ojg0NDMiLCJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIn0="
        }
    };

    var challengeResponseAttestationU2fHypersecuB64UrlMsg = {
        "rawId": "HRiuOZKJ6yNnBrSnocnFuGgsjcAZICl4-0uEDAQHCIXncWQCkYUBvvUzZQovrxmeB9Qm23hmj6PnzWyoiWtt8w",
        "id": "HRiuOZKJ6yNnBrSnocnFuGgsjcAZICl4-0uEDAQHCIXncWQCkYUBvvUzZQovrxmeB9Qm23hmj6PnzWyoiWtt8w",
        "response":
            {
                "clientDataJSON": "eyJjaGFsbGVuZ2UiOiJwU0c5ejZHZDVtNDhXV3c5ZTAzQUppeGJLaWEweW5FcW03b185S0VrUFkwemNhWGhqbXhvQ2hDNVFSbks0RTZYSVQyUUZjX3VHeWNPNWxVTXlnZVpndyIsImNsaWVudEV4dGVuc2lvbnMiOnt9LCJoYXNoQWxnb3JpdGhtIjoiU0hBLTI1NiIsIm9yaWdpbiI6Imh0dHBzOi8vd2ViYXV0aG4ub3JnIiwidHlwZSI6IndlYmF1dGhuLmNyZWF0ZSJ9",
                "attestationObject": "o2NmbXRoZmlkby11MmZnYXR0U3RtdKJjc2lnWEgwRgIhANsxYs-ntdvXjEaGTl-T91fmoSQCCzLEmXpzwuIqSrzUAiEA2vnx_cP4Ck9ASruZ7NdCtHKleCfd0NwCHcv2cMj175JjeDVjgVkBQDCCATwwgeSgAwIBAgIKOVGHiTh4UmRUCTAKBggqhkjOPQQDAjAXMRUwEwYDVQQDEwxGVCBGSURPIDAxMDAwHhcNMTQwODE0MTgyOTMyWhcNMjQwODE0MTgyOTMyWjAxMS8wLQYDVQQDEyZQaWxvdEdudWJieS0wLjQuMS0zOTUxODc4OTM4Nzg1MjY0NTQwOTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABIeOKoi1TAiEYdCsb8XIAncH9Ko9EuGkXEugACIy1mV0fefgs7ZA4hnz5X3CS67eUWgMASZzpwKHVybohhppKGAwCgYIKoZIzj0EAwIDRwAwRAIg6BuIpLPxP_wPNiOJZJiqKKKlBUB2CgCwMYibSjki5S8CIOPFCx-Y1JKxbJ7nDs96PsvjDcRfpynzvswDG_V6VuK0aGF1dGhEYXRhWMSVaQiPHs7jIylUA129ENfK45EwWidRtVm7j9fLsim91EEAAAAAAAAAAAAAAAAAAAAAAAAAAABAHRiuOZKJ6yNnBrSnocnFuGgsjcAZICl4-0uEDAQHCIXncWQCkYUBvvUzZQovrxmeB9Qm23hmj6PnzWyoiWtt86UBAgMmIAEhWCCHjiqItUwIhGHQrG_FyAJ3B_SqPRLhpFxLoAAiMtZldCJYIH3n4LO2QOIZ8-V9wkuu3lFoDAEmc6cCh1cm6IYaaShg"
            }

    };

    var challengeResponseAttestationPackedB64UrlMsg = {
        "rawId": "sL39APyTmisrjh11vghaqNfuruLQmCfR0c1ryKtaQ81jkEhNa5u9xLTnkibvXC9YpzBLFwWEZ3k9CR_sxzm_pWYbBOtKxeZu9z2GT8b6QW4iQvRlyumCT3oENx_8401r",
        "id": "sL39APyTmisrjh11vghaqNfuruLQmCfR0c1ryKtaQ81jkEhNa5u9xLTnkibvXC9YpzBLFwWEZ3k9CR_sxzm_pWYbBOtKxeZu9z2GT8b6QW4iQvRlyumCT3oENx_8401r",
        "response": {
            "clientDataJSON": "eyJjaGFsbGVuZ2UiOiJ1Vlg4OElnUmEwU1NyTUlSVF9xN2NSY2RmZ2ZSQnhDZ25fcGtwVUFuWEpLMnpPYjMwN3dkMU9MWFEwQXVOYU10QlIzYW1rNkhZenAtX1Z4SlRQcHdHdyIsIm9yaWdpbiI6Imh0dHBzOi8vd2ViYXV0aG4ub3JnIiwidG9rZW5CaW5kaW5nIjp7InN0YXR1cyI6Im5vdC1zdXBwb3J0ZWQifSwidHlwZSI6IndlYmF1dGhuLmNyZWF0ZSJ9",
            "attestationObject": "o2NmbXRmcGFja2VkZ2F0dFN0bXSjY2FsZyZjc2lnWEgwRgIhAIsK0Wr9tmud-waIYoQw20UWi7DL_gDx_PNG3PB57eHLAiEAtRyd-4JI2pCVX-dDz4mbHc_AkvC3d_4qnBBa3n2I_hVjeDVjg1kCRTCCAkEwggHooAMCAQICEBWfe8LNiRjxKGuTSPqfM-IwCgYIKoZIzj0EAwIwSTELMAkGA1UEBhMCQ04xHTAbBgNVBAoMFEZlaXRpYW4gVGVjaG5vbG9naWVzMRswGQYDVQQDDBJGZWl0aWFuIEZJRE8yIENBLTEwIBcNMTgwNDExMDAwMDAwWhgPMjAzMzA0MTAyMzU5NTlaMG8xCzAJBgNVBAYTAkNOMR0wGwYDVQQKDBRGZWl0aWFuIFRlY2hub2xvZ2llczEiMCAGA1UECwwZQXV0aGVudGljYXRvciBBdHRlc3RhdGlvbjEdMBsGA1UEAwwURlQgQmlvUGFzcyBGSURPMiBVU0IwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAASABnVcWfvJSbAVqNIKkliXvoMKsu_oLPiP7aCQlmPlSMcfEScFM7QkRnidTP7hAUOKlOmDPeIALC8qHddvTdtdo4GJMIGGMB0GA1UdDgQWBBR6VIJCgGLYiuevhJglxK-RqTSY8jAfBgNVHSMEGDAWgBRNO9jEZxUbuxPo84TYME-daRXAgzAMBgNVHRMBAf8EAjAAMBMGCysGAQQBguUcAgEBBAQDAgUgMCEGCysGAQQBguUcAQEEBBIEEEI4MkVENzNDOEZCNEU1QTIwCgYIKoZIzj0EAwIDRwAwRAIgJEtFo76I3LfgJaLGoxLP-4btvCdKIsEFLjFIUfDosIcCIDQav04cJPILGnPVPazCqfkVtBuyOmsBbx_v-ODn-JDAWQH_MIIB-zCCAaCgAwIBAgIQFZ97ws2JGPEoa5NI-p8z4TAKBggqhkjOPQQDAjBLMQswCQYDVQQGEwJDTjEdMBsGA1UECgwURmVpdGlhbiBUZWNobm9sb2dpZXMxHTAbBgNVBAMMFEZlaXRpYW4gRklETyBSb290IENBMCAXDTE4MDQxMDAwMDAwMFoYDzIwMzgwNDA5MjM1OTU5WjBJMQswCQYDVQQGEwJDTjEdMBsGA1UECgwURmVpdGlhbiBUZWNobm9sb2dpZXMxGzAZBgNVBAMMEkZlaXRpYW4gRklETzIgQ0EtMTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABI5-YAnswRZlzKD6w-lv5Qg7lW1XJRHrWzL01mc5V91n2LYXNR3_S7mA5gupuTO5mjQw8xfqIRMHVr1qB3TedY-jZjBkMB0GA1UdDgQWBBRNO9jEZxUbuxPo84TYME-daRXAgzAfBgNVHSMEGDAWgBTRoZhNgX_DuWv2B2e9UBL-kEXxVDASBgNVHRMBAf8ECDAGAQH_AgEAMA4GA1UdDwEB_wQEAwIBBjAKBggqhkjOPQQDAgNJADBGAiEA-3-j0kBHoRFQwnhWbSHMkBaY7KF_TztINFN5ymDkwmUCIQDrCkPBiMHXvYg-kSRgVsKwuVtYonRvC588qRwpLStZ7FkB3DCCAdgwggF-oAMCAQICEBWfe8LNiRjxKGuTSPqfM9YwCgYIKoZIzj0EAwIwSzELMAkGA1UEBhMCQ04xHTAbBgNVBAoMFEZlaXRpYW4gVGVjaG5vbG9naWVzMR0wGwYDVQQDDBRGZWl0aWFuIEZJRE8gUm9vdCBDQTAgFw0xODA0MDEwMDAwMDBaGA8yMDQ4MDMzMTIzNTk1OVowSzELMAkGA1UEBhMCQ04xHTAbBgNVBAoMFEZlaXRpYW4gVGVjaG5vbG9naWVzMR0wGwYDVQQDDBRGZWl0aWFuIEZJRE8gUm9vdCBDQTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABJ3wCm47zF9RMtW-pPlkEHTVTLfSYBlsidz7zOAUiuV6k36PvtKAI_-LZ8MiC9BxQUfUrfpLY6klw344lwLq7POjQjBAMB0GA1UdDgQWBBTRoZhNgX_DuWv2B2e9UBL-kEXxVDAPBgNVHRMBAf8EBTADAQH_MA4GA1UdDwEB_wQEAwIBBjAKBggqhkjOPQQDAgNIADBFAiEAt7E9ZQYxnhfsSk6c1dSmFNnJGoU3eJiycs2DoWh7-IoCIA9iWJH8h-UOAaaPK66DtCLe6GIxdpIMv3kmd1PRpWqsaGF1dGhEYXRhWOSVaQiPHs7jIylUA129ENfK45EwWidRtVm7j9fLsim91EEAAAABQjgyRUQ3M0M4RkI0RTVBMgBgsL39APyTmisrjh11vghaqNfuruLQmCfR0c1ryKtaQ81jkEhNa5u9xLTnkibvXC9YpzBLFwWEZ3k9CR_sxzm_pWYbBOtKxeZu9z2GT8b6QW4iQvRlyumCT3oENx_8401rpQECAyYgASFYIFkdweEE6mWiIAYPDoKz3881Aoa4sn8zkTm0aPKKYBvdIlggtlG32lxrang8M0tojYJ36CL1VMv2pZSzqR_NfvG88bA"
        }
    };

    var challengeResponseAttestationTpmB64UrlMsg = {
        "rawId": "hWzdFiPbOMQ5KNBsMhs-Zeh8F0iTHrH63YKkrxJFgjQ",
        "id": "hWzdFiPbOMQ5KNBsMhs-Zeh8F0iTHrH63YKkrxJFgjQ",
        "response": {
            "clientDataJSON": "ew0KCSJ0eXBlIiA6ICJ3ZWJhdXRobi5jcmVhdGUiLA0KCSJjaGFsbGVuZ2UiIDogIndrNkxxRVhBTUFacHFjVFlsWTJ5b3I1RGppeUlfYjFneTluRE90Q0IxeUdZbm1fNFdHNFVrMjRGQXI3QXhUT0ZmUU1laWdrUnhPVExaTnJMeEN2Vl9RIiwNCgkib3JpZ2luIiA6ICJodHRwczovL3dlYmF1dGhuLm9yZyIsDQoJInRva2VuQmluZGluZyIgOiANCgl7DQoJCSJzdGF0dXMiIDogInN1cHBvcnRlZCINCgl9DQp9",
            "attestationObject": "o2NmbXRjdHBtaGF1dGhEYXRhWQFnlWkIjx7O4yMpVANdvRDXyuORMFonUbVZu4_Xy7IpvdRFAAAAAAiYcFjK3EuBtuEw3lDcvpYAIIVs3RYj2zjEOSjQbDIbPmXofBdIkx6x-t2CpK8SRYI0pAEDAzkBACBZAQDF2m9Nk1e94gL1xVjNCjFW0lTy4K2atXkx-YJrdH3hrE8p1gcIdNzleRDhmERJnY5CRwM5sXDQIrUBq4jpwvTtMC5HGccN6-iEJAPtm9_CJzCmGhtw9hbF8bcAys94RhN9xLLUaajhWqtPrYZXCEAi0o9E2QdTIxJrcAfJgZOf33JMr0--R1BAQxpOoGRDC8ss-tfQW9ufZLWw4JUuz4Z5Jz1sbfqBYB8UUDMWoT0HgsMaPmvd7T17xGvB-pvvDf-Dt96vFGtYLEZEgho8Yu26pr5CK_BOQ-2vX9N4MIYVPXNhogMGGmKYqybhM3yhye0GdBpZBUd5iOcgME6uGJ1_IUMBAAFnYXR0U3RtdKZjdmVyYzIuMGNhbGc5__5jc2lnWQEAcV1izWGUWIs0DEOZNQGdriNNXo6nbrGDLzEAeswCK9njYGCLmOkHVgSyafhsjCEMZkQmuPUmEOMDKosqxup_tiXQwG4yCW9TyWoINWGayQ4vcr6Ys-l6KMPkg__d2VywhfonnTJDBfE_4BIRD60GR0qBzTarthDHQFMqRtoUtuOsTF5jedU3EQPojRA5iCNC2naCCZuMSURdlPmhlW5rAaRZVF41ZZECi5iFOM2rO0UpGuQSLUvr1MqQOsDytMf7qWZMvwT_5_8BF6GNdB2l2VzmIJBbV6g8z7dj0fRkjlCXBp8UG2LvTq5SsfugrRWXOJ8BkdMplPfl0mz6ssU_n2N4NWOCWQS2MIIEsjCCA5qgAwIBAgIQEyidpWZzRxOSMNfrAvV1fzANBgkqhkiG9w0BAQsFADBBMT8wPQYDVQQDEzZOQ1UtTlRDLUtFWUlELTE1OTFENEI2RUFGOThEMDEwNDg2NEI2OTAzQTQ4REQwMDI2MDc3RDMwHhcNMTgwNTIwMTYyMDQ0WhcNMjgwNTIwMTYyMDQ0WjAAMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvQ6XK2ujM11E7x4SL34p252ncyQTd3-4r5ALQhBbFKS95gUsuENTG-48GBQwu48i06cckm3eH20TUeJvn4-pj6i8LFOrIK14T3P3GFzbxgQLq1KVm63JWDdEXk789JgzQjHNO7DZFKWTEiktwmBUPUA88TjQcXOtrR5EXTrt1FzGzabOepFann3Ny_XtxI8lDZ3QLwPLJfmk7puGtkGNaXOsRC7GLAnoEB7UWvjiyKG6HAtvVTgxcW5OQnHFb9AHycU5QdukXrP0njdCpLCRR0Nq6VMKmVU3MaGh-DCwYEB32sPNPdDkPDWyk16ItwcmXqfSBV5ZOr8ifvcXbCWUWwIDAQABo4IB5TCCAeEwDgYDVR0PAQH_BAQDAgeAMAwGA1UdEwEB_wQCMAAwbQYDVR0gAQH_BGMwYTBfBgkrBgEEAYI3FR8wUjBQBggrBgEFBQcCAjBEHkIAVABDAFAAQQAgACAAVAByAHUAcwB0AGUAZAAgACAAUABsAGEAdABmAG8AcgBtACAAIABJAGQAZQBuAHQAaQB0AHkwEAYDVR0lBAkwBwYFZ4EFCAMwSgYDVR0RAQH_BEAwPqQ8MDoxODAOBgVngQUCAwwFaWQ6MTMwEAYFZ4EFAgIMB05QQ1Q2eHgwFAYFZ4EFAgEMC2lkOjRFNTQ0MzAwMB8GA1UdIwQYMBaAFMISqVvO-lb4wMFvsVvdAzRHs3qjMB0GA1UdDgQWBBSv4kXTSA8i3NUM0q57lrWpM8p_4TCBswYIKwYBBQUHAQEEgaYwgaMwgaAGCCsGAQUFBzAChoGTaHR0cHM6Ly9hemNzcHJvZG5jdWFpa3B1Ymxpc2guYmxvYi5jb3JlLndpbmRvd3MubmV0L25jdS1udGMta2V5aWQtMTU5MWQ0YjZlYWY5OGQwMTA0ODY0YjY5MDNhNDhkZDAwMjYwNzdkMy8zYjkxOGFlNC0wN2UxLTQwNTktOTQ5MS0wYWQyNDgxOTA4MTguY2VyMA0GCSqGSIb3DQEBCwUAA4IBAQAs-vqdkDX09fNNYqzbv3Lh0vl6RgGpPGl-MYgO8Lg1I9UKvEUaaUHm845ABS8m7r9p22RCWO6TSEPS0YUYzAsNuiKiGVna4nB9JWZaV9GDS6aMD0nJ8kNciorDsV60j0Yb592kv1VkOKlbTF7-Z10jaapx0CqhxEIUzEBb8y9Pa8oOaQf8ORhDHZp-mbn_W8rUzXSDS0rFbWKaW4tGpVoKGRH-f9vIeXxGlxVS0wqqRm_r-h1aZInta0OOiL_S4367gZyeLL3eUnzdd-eYySYn2XINPbVacK8ZifdsLMwiNtz5uM1jbqpEn2UoB3Hcdn0hc12jTLPWFfg7GiKQ0hk9WQXsMIIF6DCCA9CgAwIBAgITMwAAAQDiBsSROVGXhwAAAAABADANBgkqhkiG9w0BAQsFADCBjDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjE2MDQGA1UEAxMtTWljcm9zb2Z0IFRQTSBSb290IENlcnRpZmljYXRlIEF1dGhvcml0eSAyMDE0MB4XDTE3MDIwMTE3NDAyNFoXDTI5MTIzMTE3NDAyNFowQTE_MD0GA1UEAxM2TkNVLU5UQy1LRVlJRC0xNTkxRDRCNkVBRjk4RDAxMDQ4NjRCNjkwM0E0OEREMDAyNjA3N0QzMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA9IwUMSiQUbrQR0NLkKR-9RB8zfHYdlmDB0XN_m8qrNHKRJ__lBOR-mwU_h3MFRZF6X3ZZwka1DtwBdzLFV8lVu33bc15stjSd6B22HRRKQ3sIns5AYQxg0eX2PtWCJuIhxdM_jDjP2hq9Yvx-ibt1IO9UZwj83NGxXc7Gk2UvCs9lcFSp6U8zzl5fGFCKYcxIKH0qbPrzjlyVyZTKwGGSTeoMMEdsZiq-m_xIcrehYuHg-FAVaPLLTblS1h5cu80-ruFUm5Xzl61YjVU9tAV_Y4joAsJ5QP3VPocFhr5YVsBVYBiBcQtr5JFdJXZWWEgYcFLdAFUk8nJERS7-5xLuQIDAQABo4IBizCCAYcwCwYDVR0PBAQDAgGGMBsGA1UdJQQUMBIGCSsGAQQBgjcVJAYFZ4EFCAMwFgYDVR0gBA8wDTALBgkrBgEEAYI3FR8wEgYDVR0TAQH_BAgwBgEB_wIBADAdBgNVHQ4EFgQUwhKpW876VvjAwW-xW90DNEezeqMwHwYDVR0jBBgwFoAUeowKzi9IYhfilNGuVcFS7HF0pFYwcAYDVR0fBGkwZzBloGOgYYZfaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIwVFBNJTIwUm9vdCUyMENlcnRpZmljYXRlJTIwQXV0aG9yaXR5JTIwMjAxNC5jcmwwfQYIKwYBBQUHAQEEcTBvMG0GCCsGAQUFBzAChmFodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NlcnRzL01pY3Jvc29mdCUyMFRQTSUyMFJvb3QlMjBDZXJ0aWZpY2F0ZSUyMEF1dGhvcml0eSUyMDIwMTQuY3J0MA0GCSqGSIb3DQEBCwUAA4ICAQAKc9z1UUBAaybIVnK8yL1N1iGJFFFFw_PpkxW76hgQhUcCxNFQskfahfFzkBD05odVC1DKyk2PyOle0G86FCmZiJa14MtKNsiu66nVqk2hr8iIcu-cYEsgb446yIGd1NblQKA1C_28F2KHm8YRgcFtRSkWEMuDiVMa0HDU8aI6ZHO04Naj86nXeULJSZsA0pQwNJ04-QJP3MFQzxQ7md6D-pCx-LVA-WUdGxT1ofaO5NFxq0XjubnZwRjQazy_m93dKWp19tbBzTUKImgUKLYGcdmVWXAxUrkxHN2FbZGOYWfmE2TGQXS2Z-g4YAQo1PleyOav3HNB8ti7u5HpI3t9a73xuECy2gFcZQ24DJuBaQe4mU5I_hPiAa-822nPPL6w8m1eegxhHf7ziRW_hW8s1cvAZZ5Jpev96zL_zRv34MsRWhKwLbu2oOCSEYYh8D8DbQZjmsxlUYR_q1cP8JKiIo6NNJ85g7sjTZgXxeanA9wZwqwJB-P98VdVslC17PmVu0RHOqRtxrht7OFT7Z10ecz0tj9ODXrv5nmBktmbgHRirRMl84wp7-PJhTXdHbxZv-OoL4HP6FxyDbHxLB7QmR4-VoEZN0vsybb1A8KEj2pkNY_tmxHH6k87euM99bB8FHrW9FNrXCGL1p6-PYtiky52a5YQZGT8Hz-ZnxobTmhjZXJ0SW5mb1ih_1RDR4AXACIAC7xZ9N_ZpqQtw7hmr_LfDRmCa78BS2erCtbrsXYwa4AHABSsnz8FacZi-wkUkfHu4xjG8MPfmwAAAAGxWkjHaED549jznwUBqeDEpT-7xBMAIgALcSGuv6a5r9BwMvQvCSXg7GdAjdWZpXv6D4DH8VYBCE8AIgALAVI0eQ_AAZjNvrhUEMK2q4wxuwIFOnHIDF0Qljhf47RncHViQXJlYVkBNgABAAsABgRyACCd_8vzbDg65pn7mGjcbcuJ1xU4hL4oA5IsEkFYv60irgAQABAIAAAAAAABAMXab02TV73iAvXFWM0KMVbSVPLgrZq1eTH5gmt0feGsTynWBwh03OV5EOGYREmdjkJHAzmxcNAitQGriOnC9O0wLkcZxw3r6IQkA-2b38InMKYaG3D2FsXxtwDKz3hGE33EstRpqOFaq0-thlcIQCLSj0TZB1MjEmtwB8mBk5_fckyvT75HUEBDGk6gZEMLyyz619Bb259ktbDglS7PhnknPWxt-oFgHxRQMxahPQeCwxo-a93tPXvEa8H6m-8N_4O33q8Ua1gsRkSCGjxi7bqmvkIr8E5D7a9f03gwhhU9c2GiAwYaYpirJuEzfKHJ7QZ0GlkFR3mI5yAwTq4YnX8"
        }
    };


    var assertionResponseMsgB64Url = {
        "rawId": "AAhH7cnPRBkcukjnc2G2GM1H5dkVs9P1q2VErhD57pkzKVjBbixdsufjXhUOfiD27D0VA-fPKUVYNGE2XYcjhihtYODQv-xEarplsa7Ix6hK13FA6uyRxMgHC3PhTbx-rbq_RMUbaJ-HoGVt-c820ifdoagkFR02Van8Vr9q67Bn6zHNDT_DNrQbtpIUqqX_Rg2p5o6F7bVO3uOJG9hUNgUb",
        "id": "AAhH7cnPRBkcukjnc2G2GM1H5dkVs9P1q2VErhD57pkzKVjBbixdsufjXhUOfiD27D0VA-fPKUVYNGE2XYcjhihtYODQv-xEarplsa7Ix6hK13FA6uyRxMgHC3PhTbx-rbq_RMUbaJ-HoGVt-c820ifdoagkFR02Van8Vr9q67Bn6zHNDT_DNrQbtpIUqqX_Rg2p5o6F7bVO3uOJG9hUNgUb",
        "response": {
            "clientDataJSON": "eyJjaGFsbGVuZ2UiOiJlYVR5VU5ueVBERGRLOFNORWdURVV2ejFROGR5bGtqalRpbVlkNVg3UUFvLUY4X1oxbHNKaTNCaWxVcEZaSGtJQ05EV1k4cjlpdm5UZ1c3LVhaQzNxUSIsImNsaWVudEV4dGVuc2lvbnMiOnt9LCJoYXNoQWxnb3JpdGhtIjoiU0hBLTI1NiIsIm9yaWdpbiI6Imh0dHBzOi8vbG9jYWxob3N0Ojg0NDMiLCJ0eXBlIjoid2ViYXV0aG4uZ2V0In0=",
            "authenticatorData": "SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2MBAAABaw==",
            "signature": "MEYCIQD6dF3B0ZoaLA0r78oyRdoMNR0bN93Zi4cF_75hFAH6pQIhALY0UIsrh03u_f4yKOwzwD6Cj3_GWLJiioTT9580s1a7",
            "userHandle": ""
        }
    };

    var assertionResponseWindowsHelloMsgB64Url = {
        "rawId": "AwVUFfSwuMV1DRHfYmNry1IUGW03wEw9aTAR7kJM1nw",
        "id": "AwVUFfSwuMV1DRHfYmNry1IUGW03wEw9aTAR7kJM1nw",
        "response": {
            "clientDataJSON": "ew0KCSJ0eXBlIiA6ICJ3ZWJhdXRobi5nZXQiLA0KCSJjaGFsbGVuZ2UiIDogIm03WlUwWi1fSWl3dmlGbkYxSlhlSmpGaFZCaW5jVzY5RTFDdGo4QVEtWWJiMXVjNDFiTUh0SXRnNkpBQ2gxc09qX1pYam9udzJhY2pfSkQyaS1heEVRIiwNCgkib3JpZ2luIiA6ICJodHRwczovL3dlYmF1dGhuLm9yZyIsDQoJInRva2VuQmluZGluZyIgOiANCgl7DQoJCSJzdGF0dXMiIDogInN1cHBvcnRlZCINCgl9DQp9",
            "authenticatorData": "lWkIjx7O4yMpVANdvRDXyuORMFonUbVZu4_Xy7IpvdQFAAAAAQ",
            "signature": "ElyXBPkS6ps0aod8pSEwdbaeG04SUSoucEHaulPrK3eBk3R4aePjTB-SjiPbya5rxzbuUIYO0UnqkpZrb19ZywWqwQ7qVxZzxSq7BCZmJhcML7j54eK_2nszVwXXVgO7WxpBcy_JQMxjwjXw6wNAxmnJ-H3TJJO82x4-9pDkno-GjUH2ObYk9NtkgylyMcENUaPYqajSLX-q5k14T2g839UC3xzsg71xHXQSeHgzPt6f3TXpNxNNcBYJAMm8-exKsoMkxHPDLkzK1wd5giietdoT25XQ72i8fjSSL8eiS1gllEjwbqLJn5zMQbWlgpSzJy3lK634sdeZtmMpXbRtMA",
            "userHandle": "YWs"
        }
    };

    var successServerResponse = {
        status: "ok",
        errorMessage: ""
    };

    var errorServerResponse = {
        status: "failed",
        errorMessage: "out of memory"
    };

    var server = {
        creationOptionsRequest,
        basicCreationOptions,
        completeCreationOptions,
        getOptionsRequest,
        challengeResponseAttestationNoneMsgB64Url,
        challengeResponseAttestationU2fMsgB64Url,
        challengeResponseAttestationU2fHypersecuB64UrlMsg,
        challengeResponseAttestationPackedB64UrlMsg,
        challengeResponseAttestationTpmB64UrlMsg,
        basicGetOptions,
        completeGetOptions,
        assertionResponseMsgB64Url,
        // assertionResponseMsg,
        successServerResponse,
        errorServerResponse
    };

    /********************************************************************************
     *********************************************************************************
     * LIB PARAMS
     *********************************************************************************
     *********************************************************************************/

    var makeCredentialAttestationNoneResponse = {
        username: challengeResponseAttestationNoneMsgB64Url.username,
        rawId: b64decode(challengeResponseAttestationNoneMsgB64Url.rawId),
        response: {
            attestationObject: b64decode(challengeResponseAttestationNoneMsgB64Url.response.attestationObject),
            clientDataJSON: b64decode(challengeResponseAttestationNoneMsgB64Url.response.clientDataJSON)
        }
    };

    var makeCredentialAttestationU2fResponse = {
        username: challengeResponseAttestationU2fMsgB64Url.username,
        rawId: b64decode(challengeResponseAttestationU2fMsgB64Url.rawId),
        response: {
            attestationObject: b64decode(challengeResponseAttestationU2fMsgB64Url.response.attestationObject),
            clientDataJSON: b64decode(challengeResponseAttestationU2fMsgB64Url.response.clientDataJSON)
        }
    };

    var makeCredentialAttestationHypersecuU2fResponse = {
        rawId: b64decode(challengeResponseAttestationU2fHypersecuB64UrlMsg.rawId),
        response: {
            attestationObject: b64decode(challengeResponseAttestationU2fHypersecuB64UrlMsg.response.attestationObject),
            clientDataJSON: b64decode(challengeResponseAttestationU2fHypersecuB64UrlMsg.response.clientDataJSON)
        }
    };

    var makeCredentialAttestationPackedResponse = {
        rawId: b64decode(challengeResponseAttestationPackedB64UrlMsg.rawId),
        response: {
            attestationObject: b64decode(challengeResponseAttestationPackedB64UrlMsg.response.attestationObject),
            clientDataJSON: b64decode(challengeResponseAttestationPackedB64UrlMsg.response.clientDataJSON)
        }
    };

    var makeCredentialAttestationTpmResponse = {
        rawId: b64decode(challengeResponseAttestationTpmB64UrlMsg.rawId),
        response: {
            attestationObject: b64decode(challengeResponseAttestationTpmB64UrlMsg.response.attestationObject),
            clientDataJSON: b64decode(challengeResponseAttestationTpmB64UrlMsg.response.clientDataJSON)
        }
    };

    var assertionResponse = {
        rawId: b64decode(assertionResponseMsgB64Url.rawId),
        response: {
            clientDataJSON: b64decode(assertionResponseMsgB64Url.response.clientDataJSON),
            authenticatorData: b64decode(assertionResponseMsgB64Url.response.authenticatorData),
            signature: b64decode(assertionResponseMsgB64Url.response.signature),
            userHandle: assertionResponseMsgB64Url.response.userHandle
        }
    };

    var assertionResponseWindowsHello = {
        rawId: b64decode(assertionResponseWindowsHelloMsgB64Url.rawId),
        response: {
            clientDataJSON: b64decode(assertionResponseWindowsHelloMsgB64Url.response.clientDataJSON),
            authenticatorData: b64decode(assertionResponseWindowsHelloMsgB64Url.response.authenticatorData),
            signature: b64decode(assertionResponseWindowsHelloMsgB64Url.response.signature),
            userHandle: assertionResponseWindowsHelloMsgB64Url.response.userHandle
        }
    };

    var assnPublicKey =
        "-----BEGIN PUBLIC KEY-----\n" +
        "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAERez9aO2wBAWO54MuGbEqSdWahSnG\n" +
        "MAg35BCNkaE3j8Q+O/ZhhKqTeIKm7El70EG6ejt4sg1ZaoQ5ELg8k3ywTg==\n" +
        "-----END PUBLIC KEY-----\n";

    var assnPublicKeyWindowsHello =
        "-----BEGIN PUBLIC KEY-----\n" +
        "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2zT9pxqfMK3SNWvasEpd\n" +
        "5/IcnjKGUJcUOGWjNJ3oszlvOlkpiWjCwYqnVH0Fy4ohm0rGzOOw4kyQh6i/X2qX\n" +
        "dA0C2UNpuq29wpLBxl5ZiePVpnetJJVFRKiwA9WoDvlU3zX7QpFKzbEeRKSmI9r0\n" +
        "gvJfCPOYWDhmiYxRZ4/u8hfSQ/Qg7NiV0K7jLv1m/2qtPEHVko7UGmXjWk0KANNe\n" +
        "Xi2bwhQTU938I5aXtUQzDaURHbxCpmm86sKNgOWT1CVOGMuRqHBdyt5qKeu5N0DB\n" +
        "aRFRRFVkcx6N0fU8y7DHXYnry0T+2Ln8rDZMZrfjQ/+b48CibGU9GwomshQE32pt\n" +
        "/QIDAQAB\n" +
        "-----END PUBLIC KEY-----\n";

    var lib = {
        makeCredentialAttestationNoneResponse,
        makeCredentialAttestationU2fResponse,
        makeCredentialAttestationHypersecuU2fResponse,
        makeCredentialAttestationPackedResponse,
        makeCredentialAttestationTpmResponse,
        assertionResponse,
        assertionResponseWindowsHello,
        assnPublicKey,
        assnPublicKeyWindowsHello,
    };

    /********************************************************************************
     *********************************************************************************
     * CERTS
     *********************************************************************************
     *********************************************************************************/

    var yubiKeyAttestation = new Uint8Array([
        0x30, 0x82, 0x02, 0x44, 0x30, 0x82, 0x01, 0x2E, 0xA0, 0x03, 0x02, 0x01, 0x02, 0x02, 0x04, 0x55,
        0x62, 0xBE, 0xA0, 0x30, 0x0B, 0x06, 0x09, 0x2A, 0x86, 0x48, 0x86, 0xF7, 0x0D, 0x01, 0x01, 0x0B,
        0x30, 0x2E, 0x31, 0x2C, 0x30, 0x2A, 0x06, 0x03, 0x55, 0x04, 0x03, 0x13, 0x23, 0x59, 0x75, 0x62,
        0x69, 0x63, 0x6F, 0x20, 0x55, 0x32, 0x46, 0x20, 0x52, 0x6F, 0x6F, 0x74, 0x20, 0x43, 0x41, 0x20,
        0x53, 0x65, 0x72, 0x69, 0x61, 0x6C, 0x20, 0x34, 0x35, 0x37, 0x32, 0x30, 0x30, 0x36, 0x33, 0x31,
        0x30, 0x20, 0x17, 0x0D, 0x31, 0x34, 0x30, 0x38, 0x30, 0x31, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30,
        0x5A, 0x18, 0x0F, 0x32, 0x30, 0x35, 0x30, 0x30, 0x39, 0x30, 0x34, 0x30, 0x30, 0x30, 0x30, 0x30,
        0x30, 0x5A, 0x30, 0x2A, 0x31, 0x28, 0x30, 0x26, 0x06, 0x03, 0x55, 0x04, 0x03, 0x0C, 0x1F, 0x59,
        0x75, 0x62, 0x69, 0x63, 0x6F, 0x20, 0x55, 0x32, 0x46, 0x20, 0x45, 0x45, 0x20, 0x53, 0x65, 0x72,
        0x69, 0x61, 0x6C, 0x20, 0x31, 0x34, 0x33, 0x32, 0x35, 0x33, 0x34, 0x36, 0x38, 0x38, 0x30, 0x59,
        0x30, 0x13, 0x06, 0x07, 0x2A, 0x86, 0x48, 0xCE, 0x3D, 0x02, 0x01, 0x06, 0x08, 0x2A, 0x86, 0x48,
        0xCE, 0x3D, 0x03, 0x01, 0x07, 0x03, 0x42, 0x00, 0x04, 0x4B, 0x33, 0x1F, 0x77, 0x3D, 0x81, 0x44,
        0xB9, 0x99, 0x5C, 0xBE, 0x45, 0x85, 0x51, 0x7E, 0x17, 0x58, 0x3A, 0xA4, 0x76, 0x23, 0x69, 0x5C,
        0xBE, 0x85, 0xAC, 0x48, 0x2C, 0x80, 0x19, 0xF2, 0xC9, 0xB9, 0x46, 0x7A, 0xE0, 0x45, 0xB0, 0xE6,
        0x6F, 0x13, 0x1B, 0x2E, 0xA3, 0x24, 0x3C, 0x91, 0xFD, 0xA6, 0x02, 0xE3, 0x18, 0xF3, 0xFC, 0x5D,
        0x8D, 0x2A, 0x7A, 0xBA, 0xE7, 0x2B, 0xD1, 0x43, 0x09, 0xA3, 0x3B, 0x30, 0x39, 0x30, 0x22, 0x06,
        0x09, 0x2B, 0x06, 0x01, 0x04, 0x01, 0x82, 0xC4, 0x0A, 0x02, 0x04, 0x15, 0x31, 0x2E, 0x33, 0x2E,
        0x36, 0x2E, 0x31, 0x2E, 0x34, 0x2E, 0x31, 0x2E, 0x34, 0x31, 0x34, 0x38, 0x32, 0x2E, 0x31, 0x2E,
        0x35, 0x30, 0x13, 0x06, 0x0B, 0x2B, 0x06, 0x01, 0x04, 0x01, 0x82, 0xE5, 0x1C, 0x02, 0x01, 0x01,
        0x04, 0x04, 0x03, 0x02, 0x05, 0x20, 0x30, 0x0B, 0x06, 0x09, 0x2A, 0x86, 0x48, 0x86, 0xF7, 0x0D,
        0x01, 0x01, 0x0B, 0x03, 0x82, 0x01, 0x01, 0x00, 0xAC, 0x16, 0xD9, 0xB3, 0x6E, 0xB6, 0xB3, 0xA9,
        0xB7, 0x6D, 0x75, 0x94, 0xB3, 0x4F, 0x59, 0xF4, 0xF7, 0x3E, 0xDB, 0xC9, 0xFD, 0xEB, 0x29, 0x35,
        0xEB, 0x6B, 0x45, 0x1C, 0xAB, 0xF4, 0x1D, 0x25, 0xD3, 0xE7, 0x16, 0x14, 0xD7, 0x47, 0x26, 0x04,
        0xCA, 0x72, 0xA5, 0x78, 0xE3, 0x23, 0xED, 0xB7, 0x60, 0x04, 0x68, 0x5F, 0x05, 0xE7, 0xD1, 0xB9,
        0xBE, 0x05, 0xDB, 0x6E, 0x94, 0x40, 0xFA, 0xC5, 0xCF, 0xC9, 0x32, 0xA6, 0xCA, 0xFA, 0xE8, 0x52,
        0x99, 0x77, 0x2E, 0xDB, 0x02, 0x78, 0x20, 0x20, 0x3C, 0xD4, 0x14, 0x1D, 0x3E, 0xEB, 0x6F, 0x6A,
        0x2C, 0xE9, 0x9E, 0x39, 0x57, 0x80, 0x32, 0x63, 0xAB, 0xAB, 0x8D, 0x6E, 0xC4, 0x80, 0xA7, 0xDF,
        0x08, 0x4A, 0xD2, 0xCB, 0xA7, 0xB7, 0xD6, 0xD7, 0x7C, 0x94, 0xC3, 0xEB, 0xC0, 0xB1, 0x66, 0xF9,
        0x60, 0x57, 0xCA, 0xF5, 0xFE, 0x3A, 0x63, 0x1E, 0xA2, 0x6A, 0x43, 0x37, 0x62, 0xA3, 0x6F, 0xBE,
        0xCF, 0x4C, 0xF4, 0x45, 0x09, 0x62, 0x5F, 0xD5, 0xAF, 0x10, 0x49, 0xAA, 0x7C, 0x8B, 0xC7, 0x68,
        0x9A, 0x66, 0x59, 0xE9, 0xAF, 0x5D, 0xE8, 0xF0, 0xD7, 0x2C, 0x28, 0x82, 0x51, 0x74, 0xC5, 0x0E,
        0x06, 0xAB, 0x7F, 0x6A, 0x07, 0x90, 0x83, 0x7B, 0x6D, 0xB3, 0x2A, 0xBF, 0xDC, 0xBC, 0xA8, 0x35,
        0xCB, 0xBB, 0x09, 0x0E, 0xF1, 0xF0, 0xD9, 0x9E, 0x08, 0x69, 0xBF, 0xE9, 0xE5, 0x67, 0x64, 0xC4,
        0x23, 0x0E, 0x6C, 0x05, 0x77, 0x29, 0xB0, 0x10, 0xDE, 0x0E, 0xC5, 0xF9, 0xCC, 0xE4, 0xC9, 0x1C,
        0x28, 0x26, 0x21, 0x8E, 0xA8, 0x08, 0x1A, 0xBB, 0x96, 0x91, 0x51, 0xEC, 0x16, 0x72, 0x5A, 0xF2,
        0xA8, 0xD9, 0x5E, 0x77, 0x95, 0xBC, 0xAA, 0x22, 0x7A, 0x9B, 0x94, 0x43, 0x20, 0xC4, 0x27, 0x61,
        0x9C, 0xAA, 0xF8, 0x54, 0xD9, 0x82, 0x98, 0xD7
    ]).buffer;

    var yubicoRoot = new Uint8Array([
        0x30, 0x82, 0x03, 0x1e, 0x30, 0x82, 0x02, 0x06, 0xa0, 0x03, 0x02, 0x01, 0x02, 0x02, 0x04, 0x1b,
        0x40, 0x53, 0xf7, 0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x0b,
        0x05, 0x00, 0x30, 0x2e, 0x31, 0x2c, 0x30, 0x2a, 0x06, 0x03, 0x55, 0x04, 0x03, 0x13, 0x23, 0x59,
        0x75, 0x62, 0x69, 0x63, 0x6f, 0x20, 0x55, 0x32, 0x46, 0x20, 0x52, 0x6f, 0x6f, 0x74, 0x20, 0x43,
        0x41, 0x20, 0x53, 0x65, 0x72, 0x69, 0x61, 0x6c, 0x20, 0x34, 0x35, 0x37, 0x32, 0x30, 0x30, 0x36,
        0x33, 0x31, 0x30, 0x20, 0x17, 0x0d, 0x31, 0x34, 0x30, 0x38, 0x30, 0x31, 0x30, 0x30, 0x30, 0x30,
        0x30, 0x30, 0x5a, 0x18, 0x0f, 0x32, 0x30, 0x35, 0x30, 0x30, 0x39, 0x30, 0x34, 0x30, 0x30, 0x30,
        0x30, 0x30, 0x30, 0x5a, 0x30, 0x2e, 0x31, 0x2c, 0x30, 0x2a, 0x06, 0x03, 0x55, 0x04, 0x03, 0x13,
        0x23, 0x59, 0x75, 0x62, 0x69, 0x63, 0x6f, 0x20, 0x55, 0x32, 0x46, 0x20, 0x52, 0x6f, 0x6f, 0x74,
        0x20, 0x43, 0x41, 0x20, 0x53, 0x65, 0x72, 0x69, 0x61, 0x6c, 0x20, 0x34, 0x35, 0x37, 0x32, 0x30,
        0x30, 0x36, 0x33, 0x31, 0x30, 0x82, 0x01, 0x22, 0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86,
        0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00, 0x03, 0x82, 0x01, 0x0f, 0x00, 0x30, 0x82, 0x01, 0x0a,
        0x02, 0x82, 0x01, 0x01, 0x00, 0xbf, 0x8f, 0x06, 0x2e, 0x84, 0x15, 0x65, 0xa9, 0xa8, 0x98, 0x58,
        0x43, 0x2c, 0xad, 0x61, 0x62, 0xb2, 0x02, 0x7e, 0x3e, 0xd3, 0x3d, 0xd5, 0xe4, 0xab, 0xa4, 0x8e,
        0x13, 0x2b, 0xb5, 0x39, 0xde, 0x6c, 0x02, 0x21, 0xac, 0x12, 0x0c, 0x7c, 0xbc, 0xbd, 0x49, 0xa4,
        0xe4, 0xdd, 0x8a, 0x02, 0x3f, 0x5a, 0x6e, 0xf4, 0xfd, 0x34, 0xfe, 0x52, 0x31, 0x2d, 0x61, 0x42,
        0x2d, 0xee, 0xb3, 0x1a, 0x18, 0x1a, 0x89, 0xd7, 0x42, 0x07, 0xce, 0xe9, 0x95, 0xf2, 0x50, 0x0f,
        0x5a, 0xf8, 0xa0, 0x24, 0xa9, 0xd1, 0x67, 0x06, 0x79, 0x72, 0xba, 0x04, 0x9e, 0x08, 0xe7, 0xa9,
        0xf0, 0x47, 0x59, 0x15, 0xfb, 0x1a, 0x44, 0x5b, 0x4c, 0x8e, 0x4c, 0x33, 0xe4, 0x67, 0x33, 0xd8,
        0xfc, 0xb8, 0xbc, 0x86, 0x2f, 0x09, 0xd3, 0x07, 0x3e, 0xdc, 0x1a, 0xcf, 0x46, 0xd5, 0xbb, 0x39,
        0xde, 0xb9, 0xe2, 0x04, 0xcf, 0xa4, 0xe7, 0x42, 0x31, 0x3a, 0xdd, 0x17, 0x6d, 0xdb, 0x36, 0xf0,
        0x9d, 0xe6, 0xf0, 0x4c, 0x6e, 0x59, 0xc9, 0xb7, 0x96, 0x4b, 0x06, 0xf3, 0xcb, 0xe0, 0x49, 0xdf,
        0x86, 0x47, 0x71, 0x48, 0x4f, 0x01, 0x8f, 0x3d, 0xc8, 0x94, 0x17, 0xb8, 0x4d, 0x08, 0xcc, 0xc6,
        0x45, 0x70, 0x40, 0x5b, 0x3c, 0xd4, 0x5b, 0x58, 0x40, 0x91, 0x2a, 0x08, 0xea, 0xff, 0xfa, 0x93,
        0xf6, 0x79, 0x83, 0x38, 0x55, 0x65, 0x49, 0x10, 0xad, 0xdb, 0x08, 0xaa, 0x3d, 0x2c, 0xe5, 0xbb,
        0x09, 0xfe, 0xbf, 0xeb, 0x2e, 0x40, 0x40, 0x6c, 0x52, 0x34, 0xc6, 0x30, 0x47, 0x76, 0xe6, 0xd2,
        0x97, 0x5d, 0x39, 0x0d, 0x5b, 0x6d, 0x70, 0x21, 0x66, 0xf1, 0x79, 0x2c, 0x94, 0xa1, 0x35, 0xf0,
        0x2e, 0xf1, 0x92, 0xeb, 0x19, 0x70, 0x41, 0x28, 0x0d, 0xa6, 0x4d, 0xaa, 0x5d, 0x8c, 0x1f, 0xf2,
        0x25, 0xe0, 0xed, 0x55, 0x99, 0x02, 0x03, 0x01, 0x00, 0x01, 0xa3, 0x42, 0x30, 0x40, 0x30, 0x1d,
        0x06, 0x03, 0x55, 0x1d, 0x0e, 0x04, 0x16, 0x04, 0x14, 0x20, 0x22, 0xfc, 0xf4, 0x6c, 0xd1, 0x89,
        0x86, 0x38, 0x29, 0x4e, 0x89, 0x2c, 0xc8, 0xaa, 0x4f, 0xf7, 0x1b, 0xfd, 0xa0, 0x30, 0x0f, 0x06,
        0x03, 0x55, 0x1d, 0x13, 0x04, 0x08, 0x30, 0x06, 0x01, 0x01, 0xff, 0x02, 0x01, 0x00, 0x30, 0x0e,
        0x06, 0x03, 0x55, 0x1d, 0x0f, 0x01, 0x01, 0xff, 0x04, 0x04, 0x03, 0x02, 0x01, 0x06, 0x30, 0x0d,
        0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x0b, 0x05, 0x00, 0x03, 0x82, 0x01,
        0x01, 0x00, 0x8e, 0xf8, 0xee, 0x38, 0xc0, 0xd2, 0x6b, 0xe2, 0x57, 0x14, 0x22, 0xf2, 0x04, 0xab,
        0x32, 0x71, 0x7b, 0x41, 0x55, 0x9b, 0x09, 0xe1, 0x47, 0xb7, 0x2d, 0xb6, 0x84, 0xb0, 0xf6, 0x38,
        0x31, 0x83, 0x7f, 0x84, 0x84, 0x39, 0x64, 0xce, 0x69, 0xec, 0x48, 0xdf, 0x72, 0x73, 0x06, 0xe0,
        0x2b, 0x58, 0x90, 0xdb, 0x1f, 0x34, 0x77, 0x34, 0x02, 0x10, 0x4b, 0x76, 0xae, 0x39, 0xae, 0x74,
        0xfc, 0xee, 0xaf, 0xfa, 0x3b, 0x7b, 0xd4, 0x12, 0xd3, 0x4c, 0x69, 0xf6, 0xe1, 0x53, 0xa9, 0x2d,
        0x85, 0x7e, 0xd8, 0xfb, 0xd5, 0xc5, 0x37, 0xd3, 0x69, 0x99, 0x8c, 0x6b, 0xf9, 0xe9, 0x15, 0x63,
        0x9c, 0x4e, 0xc6, 0x2f, 0x21, 0xf4, 0x90, 0xc8, 0x82, 0x83, 0x0f, 0xe1, 0x50, 0x75, 0xb9, 0x2d,
        0x1a, 0xba, 0x72, 0xf5, 0x20, 0x6a, 0xab, 0x36, 0x8a, 0x0b, 0xf6, 0x69, 0x85, 0x9c, 0xbd, 0xa4,
        0x2d, 0x55, 0x5e, 0x7b, 0xaf, 0xd5, 0x47, 0xa0, 0xb9, 0xf8, 0xa4, 0x93, 0x08, 0xc0, 0x96, 0xa6,
        0x93, 0x2e, 0x24, 0x86, 0x48, 0x23, 0x6b, 0xfd, 0xa3, 0x87, 0x64, 0xa1, 0x9f, 0x18, 0xed, 0x04,
        0x63, 0x42, 0x52, 0xdf, 0x63, 0x37, 0x77, 0xa8, 0x6b, 0x4a, 0x6f, 0x0e, 0xf1, 0x68, 0x5d, 0x54,
        0xb0, 0x6f, 0xf9, 0xc5, 0x46, 0xff, 0x06, 0xdc, 0x1b, 0xd9, 0x7d, 0xa0, 0xe0, 0x89, 0xe9, 0x88,
        0x1f, 0xf2, 0xb7, 0xfd, 0xc2, 0xa5, 0x05, 0xe9, 0x89, 0x65, 0xff, 0x2b, 0x89, 0x81, 0xbd, 0x42,
        0xa2, 0x1a, 0x7d, 0x39, 0x66, 0xca, 0x9e, 0x63, 0x58, 0x31, 0xe2, 0x0d, 0x31, 0x2c, 0x1a, 0x9c,
        0x53, 0xda, 0x6c, 0x9b, 0x23, 0xf3, 0x2b, 0xe5, 0x6c, 0x83, 0x0d, 0xa3, 0x79, 0x14, 0x39, 0x26,
        0x52, 0x83, 0xca, 0xa1, 0x34, 0x85, 0xe6, 0xdf, 0x0b, 0x5b, 0x6f, 0x16, 0xed, 0x02, 0x0a, 0xb2,
        0x45, 0x73
    ]).buffer;

    var feitianFido2 = new Uint8Array([
        0x30, 0x82, 0x02, 0x41, 0x30, 0x82, 0x01, 0xE8, 0xA0, 0x03, 0x02, 0x01, 0x02, 0x02, 0x10, 0x15,
        0x9F, 0x7B, 0xC2, 0xCD, 0x89, 0x18, 0xF1, 0x28, 0x6B, 0x93, 0x48, 0xFA, 0x9F, 0x33, 0xE2, 0x30,
        0x0A, 0x06, 0x08, 0x2A, 0x86, 0x48, 0xCE, 0x3D, 0x04, 0x03, 0x02, 0x30, 0x49, 0x31, 0x0B, 0x30,
        0x09, 0x06, 0x03, 0x55, 0x04, 0x06, 0x13, 0x02, 0x43, 0x4E, 0x31, 0x1D, 0x30, 0x1B, 0x06, 0x03,
        0x55, 0x04, 0x0A, 0x0C, 0x14, 0x46, 0x65, 0x69, 0x74, 0x69, 0x61, 0x6E, 0x20, 0x54, 0x65, 0x63,
        0x68, 0x6E, 0x6F, 0x6C, 0x6F, 0x67, 0x69, 0x65, 0x73, 0x31, 0x1B, 0x30, 0x19, 0x06, 0x03, 0x55,
        0x04, 0x03, 0x0C, 0x12, 0x46, 0x65, 0x69, 0x74, 0x69, 0x61, 0x6E, 0x20, 0x46, 0x49, 0x44, 0x4F,
        0x32, 0x20, 0x43, 0x41, 0x2D, 0x31, 0x30, 0x20, 0x17, 0x0D, 0x31, 0x38, 0x30, 0x34, 0x31, 0x31,
        0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x5A, 0x18, 0x0F, 0x32, 0x30, 0x33, 0x33, 0x30, 0x34, 0x31,
        0x30, 0x32, 0x33, 0x35, 0x39, 0x35, 0x39, 0x5A, 0x30, 0x6F, 0x31, 0x0B, 0x30, 0x09, 0x06, 0x03,
        0x55, 0x04, 0x06, 0x13, 0x02, 0x43, 0x4E, 0x31, 0x1D, 0x30, 0x1B, 0x06, 0x03, 0x55, 0x04, 0x0A,
        0x0C, 0x14, 0x46, 0x65, 0x69, 0x74, 0x69, 0x61, 0x6E, 0x20, 0x54, 0x65, 0x63, 0x68, 0x6E, 0x6F,
        0x6C, 0x6F, 0x67, 0x69, 0x65, 0x73, 0x31, 0x22, 0x30, 0x20, 0x06, 0x03, 0x55, 0x04, 0x0B, 0x0C,
        0x19, 0x41, 0x75, 0x74, 0x68, 0x65, 0x6E, 0x74, 0x69, 0x63, 0x61, 0x74, 0x6F, 0x72, 0x20, 0x41,
        0x74, 0x74, 0x65, 0x73, 0x74, 0x61, 0x74, 0x69, 0x6F, 0x6E, 0x31, 0x1D, 0x30, 0x1B, 0x06, 0x03,
        0x55, 0x04, 0x03, 0x0C, 0x14, 0x46, 0x54, 0x20, 0x42, 0x69, 0x6F, 0x50, 0x61, 0x73, 0x73, 0x20,
        0x46, 0x49, 0x44, 0x4F, 0x32, 0x20, 0x55, 0x53, 0x42, 0x30, 0x59, 0x30, 0x13, 0x06, 0x07, 0x2A,
        0x86, 0x48, 0xCE, 0x3D, 0x02, 0x01, 0x06, 0x08, 0x2A, 0x86, 0x48, 0xCE, 0x3D, 0x03, 0x01, 0x07,
        0x03, 0x42, 0x00, 0x04, 0x80, 0x06, 0x75, 0x5C, 0x59, 0xFB, 0xC9, 0x49, 0xB0, 0x15, 0xA8, 0xD2,
        0x0A, 0x92, 0x58, 0x97, 0xBE, 0x83, 0x0A, 0xB2, 0xEF, 0xE8, 0x2C, 0xF8, 0x8F, 0xED, 0xA0, 0x90,
        0x96, 0x63, 0xE5, 0x48, 0xC7, 0x1F, 0x11, 0x27, 0x05, 0x33, 0xB4, 0x24, 0x46, 0x78, 0x9D, 0x4C,
        0xFE, 0xE1, 0x01, 0x43, 0x8A, 0x94, 0xE9, 0x83, 0x3D, 0xE2, 0x00, 0x2C, 0x2F, 0x2A, 0x1D, 0xD7,
        0x6F, 0x4D, 0xDB, 0x5D, 0xA3, 0x81, 0x89, 0x30, 0x81, 0x86, 0x30, 0x1D, 0x06, 0x03, 0x55, 0x1D,
        0x0E, 0x04, 0x16, 0x04, 0x14, 0x7A, 0x54, 0x82, 0x42, 0x80, 0x62, 0xD8, 0x8A, 0xE7, 0xAF, 0x84,
        0x98, 0x25, 0xC4, 0xAF, 0x91, 0xA9, 0x34, 0x98, 0xF2, 0x30, 0x1F, 0x06, 0x03, 0x55, 0x1D, 0x23,
        0x04, 0x18, 0x30, 0x16, 0x80, 0x14, 0x4D, 0x3B, 0xD8, 0xC4, 0x67, 0x15, 0x1B, 0xBB, 0x13, 0xE8,
        0xF3, 0x84, 0xD8, 0x30, 0x4F, 0x9D, 0x69, 0x15, 0xC0, 0x83, 0x30, 0x0C, 0x06, 0x03, 0x55, 0x1D,
        0x13, 0x01, 0x01, 0xFF, 0x04, 0x02, 0x30, 0x00, 0x30, 0x13, 0x06, 0x0B, 0x2B, 0x06, 0x01, 0x04,
        0x01, 0x82, 0xE5, 0x1C, 0x02, 0x01, 0x01, 0x04, 0x04, 0x03, 0x02, 0x05, 0x20, 0x30, 0x21, 0x06,
        0x0B, 0x2B, 0x06, 0x01, 0x04, 0x01, 0x82, 0xE5, 0x1C, 0x01, 0x01, 0x04, 0x04, 0x12, 0x04, 0x10,
        0x42, 0x38, 0x32, 0x45, 0x44, 0x37, 0x33, 0x43, 0x38, 0x46, 0x42, 0x34, 0x45, 0x35, 0x41, 0x32,
        0x30, 0x0A, 0x06, 0x08, 0x2A, 0x86, 0x48, 0xCE, 0x3D, 0x04, 0x03, 0x02, 0x03, 0x47, 0x00, 0x30,
        0x44, 0x02, 0x20, 0x24, 0x4B, 0x45, 0xA3, 0xBE, 0x88, 0xDC, 0xB7, 0xE0, 0x25, 0xA2, 0xC6, 0xA3,
        0x12, 0xCF, 0xFB, 0x86, 0xED, 0xBC, 0x27, 0x4A, 0x22, 0xC1, 0x05, 0x2E, 0x31, 0x48, 0x51, 0xF0,
        0xE8, 0xB0, 0x87, 0x02, 0x20, 0x34, 0x1A, 0xBF, 0x4E, 0x1C, 0x24, 0xF2, 0x0B, 0x1A, 0x73, 0xD5,
        0x3D, 0xAC, 0xC2, 0xA9, 0xF9, 0x15, 0xB4, 0x1B, 0xB2, 0x3A, 0x6B, 0x01, 0x6F, 0x1F, 0xEF, 0xF8,
        0xE0, 0xE7, 0xF8, 0x90, 0xC0,
    ]).buffer;

    var tpmAttestation = new Uint8Array([
        0x30, 0x82, 0x04, 0xB2, 0x30, 0x82, 0x03, 0x9A, 0xA0, 0x03, 0x02, 0x01, 0x02, 0x02, 0x10, 0x13,
        0x28, 0x9D, 0xA5, 0x66, 0x73, 0x47, 0x13, 0x92, 0x30, 0xD7, 0xEB, 0x02, 0xF5, 0x75, 0x7F, 0x30,
        0x0D, 0x06, 0x09, 0x2A, 0x86, 0x48, 0x86, 0xF7, 0x0D, 0x01, 0x01, 0x0B, 0x05, 0x00, 0x30, 0x41,
        0x31, 0x3F, 0x30, 0x3D, 0x06, 0x03, 0x55, 0x04, 0x03, 0x13, 0x36, 0x4E, 0x43, 0x55, 0x2D, 0x4E,
        0x54, 0x43, 0x2D, 0x4B, 0x45, 0x59, 0x49, 0x44, 0x2D, 0x31, 0x35, 0x39, 0x31, 0x44, 0x34, 0x42,
        0x36, 0x45, 0x41, 0x46, 0x39, 0x38, 0x44, 0x30, 0x31, 0x30, 0x34, 0x38, 0x36, 0x34, 0x42, 0x36,
        0x39, 0x30, 0x33, 0x41, 0x34, 0x38, 0x44, 0x44, 0x30, 0x30, 0x32, 0x36, 0x30, 0x37, 0x37, 0x44,
        0x33, 0x30, 0x1E, 0x17, 0x0D, 0x31, 0x38, 0x30, 0x35, 0x32, 0x30, 0x31, 0x36, 0x32, 0x30, 0x34,
        0x34, 0x5A, 0x17, 0x0D, 0x32, 0x38, 0x30, 0x35, 0x32, 0x30, 0x31, 0x36, 0x32, 0x30, 0x34, 0x34,
        0x5A, 0x30, 0x00, 0x30, 0x82, 0x01, 0x22, 0x30, 0x0D, 0x06, 0x09, 0x2A, 0x86, 0x48, 0x86, 0xF7,
        0x0D, 0x01, 0x01, 0x01, 0x05, 0x00, 0x03, 0x82, 0x01, 0x0F, 0x00, 0x30, 0x82, 0x01, 0x0A, 0x02,
        0x82, 0x01, 0x01, 0x00, 0xBD, 0x0E, 0x97, 0x2B, 0x6B, 0xA3, 0x33, 0x5D, 0x44, 0xEF, 0x1E, 0x12,
        0x2F, 0x7E, 0x29, 0xDB, 0x9D, 0xA7, 0x73, 0x24, 0x13, 0x77, 0x7F, 0xB8, 0xAF, 0x90, 0x0B, 0x42,
        0x10, 0x5B, 0x14, 0xA4, 0xBD, 0xE6, 0x05, 0x2C, 0xB8, 0x43, 0x53, 0x1B, 0xEE, 0x3C, 0x18, 0x14,
        0x30, 0xBB, 0x8F, 0x22, 0xD3, 0xA7, 0x1C, 0x92, 0x6D, 0xDE, 0x1F, 0x6D, 0x13, 0x51, 0xE2, 0x6F,
        0x9F, 0x8F, 0xA9, 0x8F, 0xA8, 0xBC, 0x2C, 0x53, 0xAB, 0x20, 0xAD, 0x78, 0x4F, 0x73, 0xF7, 0x18,
        0x5C, 0xDB, 0xC6, 0x04, 0x0B, 0xAB, 0x52, 0x95, 0x9B, 0xAD, 0xC9, 0x58, 0x37, 0x44, 0x5E, 0x4E,
        0xFC, 0xF4, 0x98, 0x33, 0x42, 0x31, 0xCD, 0x3B, 0xB0, 0xD9, 0x14, 0xA5, 0x93, 0x12, 0x29, 0x2D,
        0xC2, 0x60, 0x54, 0x3D, 0x40, 0x3C, 0xF1, 0x38, 0xD0, 0x71, 0x73, 0xAD, 0xAD, 0x1E, 0x44, 0x5D,
        0x3A, 0xED, 0xD4, 0x5C, 0xC6, 0xCD, 0xA6, 0xCE, 0x7A, 0x91, 0x5A, 0x9E, 0x7D, 0xCD, 0xCB, 0xF5,
        0xED, 0xC4, 0x8F, 0x25, 0x0D, 0x9D, 0xD0, 0x2F, 0x03, 0xCB, 0x25, 0xF9, 0xA4, 0xEE, 0x9B, 0x86,
        0xB6, 0x41, 0x8D, 0x69, 0x73, 0xAC, 0x44, 0x2E, 0xC6, 0x2C, 0x09, 0xE8, 0x10, 0x1E, 0xD4, 0x5A,
        0xF8, 0xE2, 0xC8, 0xA1, 0xBA, 0x1C, 0x0B, 0x6F, 0x55, 0x38, 0x31, 0x71, 0x6E, 0x4E, 0x42, 0x71,
        0xC5, 0x6F, 0xD0, 0x07, 0xC9, 0xC5, 0x39, 0x41, 0xDB, 0xA4, 0x5E, 0xB3, 0xF4, 0x9E, 0x37, 0x42,
        0xA4, 0xB0, 0x91, 0x47, 0x43, 0x6A, 0xE9, 0x53, 0x0A, 0x99, 0x55, 0x37, 0x31, 0xA1, 0xA1, 0xF8,
        0x30, 0xB0, 0x60, 0x40, 0x77, 0xDA, 0xC3, 0xCD, 0x3D, 0xD0, 0xE4, 0x3C, 0x35, 0xB2, 0x93, 0x5E,
        0x88, 0xB7, 0x07, 0x26, 0x5E, 0xA7, 0xD2, 0x05, 0x5E, 0x59, 0x3A, 0xBF, 0x22, 0x7E, 0xF7, 0x17,
        0x6C, 0x25, 0x94, 0x5B, 0x02, 0x03, 0x01, 0x00, 0x01, 0xA3, 0x82, 0x01, 0xE5, 0x30, 0x82, 0x01,
        0xE1, 0x30, 0x0E, 0x06, 0x03, 0x55, 0x1D, 0x0F, 0x01, 0x01, 0xFF, 0x04, 0x04, 0x03, 0x02, 0x07,
        0x80, 0x30, 0x0C, 0x06, 0x03, 0x55, 0x1D, 0x13, 0x01, 0x01, 0xFF, 0x04, 0x02, 0x30, 0x00, 0x30,
        0x6D, 0x06, 0x03, 0x55, 0x1D, 0x20, 0x01, 0x01, 0xFF, 0x04, 0x63, 0x30, 0x61, 0x30, 0x5F, 0x06,
        0x09, 0x2B, 0x06, 0x01, 0x04, 0x01, 0x82, 0x37, 0x15, 0x1F, 0x30, 0x52, 0x30, 0x50, 0x06, 0x08,
        0x2B, 0x06, 0x01, 0x05, 0x05, 0x07, 0x02, 0x02, 0x30, 0x44, 0x1E, 0x42, 0x00, 0x54, 0x00, 0x43,
        0x00, 0x50, 0x00, 0x41, 0x00, 0x20, 0x00, 0x20, 0x00, 0x54, 0x00, 0x72, 0x00, 0x75, 0x00, 0x73,
        0x00, 0x74, 0x00, 0x65, 0x00, 0x64, 0x00, 0x20, 0x00, 0x20, 0x00, 0x50, 0x00, 0x6C, 0x00, 0x61,
        0x00, 0x74, 0x00, 0x66, 0x00, 0x6F, 0x00, 0x72, 0x00, 0x6D, 0x00, 0x20, 0x00, 0x20, 0x00, 0x49,
        0x00, 0x64, 0x00, 0x65, 0x00, 0x6E, 0x00, 0x74, 0x00, 0x69, 0x00, 0x74, 0x00, 0x79, 0x30, 0x10,
        0x06, 0x03, 0x55, 0x1D, 0x25, 0x04, 0x09, 0x30, 0x07, 0x06, 0x05, 0x67, 0x81, 0x05, 0x08, 0x03,
        0x30, 0x4A, 0x06, 0x03, 0x55, 0x1D, 0x11, 0x01, 0x01, 0xFF, 0x04, 0x40, 0x30, 0x3E, 0xA4, 0x3C,
        0x30, 0x3A, 0x31, 0x38, 0x30, 0x0E, 0x06, 0x05, 0x67, 0x81, 0x05, 0x02, 0x03, 0x0C, 0x05, 0x69,
        0x64, 0x3A, 0x31, 0x33, 0x30, 0x10, 0x06, 0x05, 0x67, 0x81, 0x05, 0x02, 0x02, 0x0C, 0x07, 0x4E,
        0x50, 0x43, 0x54, 0x36, 0x78, 0x78, 0x30, 0x14, 0x06, 0x05, 0x67, 0x81, 0x05, 0x02, 0x01, 0x0C,
        0x0B, 0x69, 0x64, 0x3A, 0x34, 0x45, 0x35, 0x34, 0x34, 0x33, 0x30, 0x30, 0x30, 0x1F, 0x06, 0x03,
        0x55, 0x1D, 0x23, 0x04, 0x18, 0x30, 0x16, 0x80, 0x14, 0xC2, 0x12, 0xA9, 0x5B, 0xCE, 0xFA, 0x56,
        0xF8, 0xC0, 0xC1, 0x6F, 0xB1, 0x5B, 0xDD, 0x03, 0x34, 0x47, 0xB3, 0x7A, 0xA3, 0x30, 0x1D, 0x06,
        0x03, 0x55, 0x1D, 0x0E, 0x04, 0x16, 0x04, 0x14, 0xAF, 0xE2, 0x45, 0xD3, 0x48, 0x0F, 0x22, 0xDC,
        0xD5, 0x0C, 0xD2, 0xAE, 0x7B, 0x96, 0xB5, 0xA9, 0x33, 0xCA, 0x7F, 0xE1, 0x30, 0x81, 0xB3, 0x06,
        0x08, 0x2B, 0x06, 0x01, 0x05, 0x05, 0x07, 0x01, 0x01, 0x04, 0x81, 0xA6, 0x30, 0x81, 0xA3, 0x30,
        0x81, 0xA0, 0x06, 0x08, 0x2B, 0x06, 0x01, 0x05, 0x05, 0x07, 0x30, 0x02, 0x86, 0x81, 0x93, 0x68,
        0x74, 0x74, 0x70, 0x73, 0x3A, 0x2F, 0x2F, 0x61, 0x7A, 0x63, 0x73, 0x70, 0x72, 0x6F, 0x64, 0x6E,
        0x63, 0x75, 0x61, 0x69, 0x6B, 0x70, 0x75, 0x62, 0x6C, 0x69, 0x73, 0x68, 0x2E, 0x62, 0x6C, 0x6F,
        0x62, 0x2E, 0x63, 0x6F, 0x72, 0x65, 0x2E, 0x77, 0x69, 0x6E, 0x64, 0x6F, 0x77, 0x73, 0x2E, 0x6E,
        0x65, 0x74, 0x2F, 0x6E, 0x63, 0x75, 0x2D, 0x6E, 0x74, 0x63, 0x2D, 0x6B, 0x65, 0x79, 0x69, 0x64,
        0x2D, 0x31, 0x35, 0x39, 0x31, 0x64, 0x34, 0x62, 0x36, 0x65, 0x61, 0x66, 0x39, 0x38, 0x64, 0x30,
        0x31, 0x30, 0x34, 0x38, 0x36, 0x34, 0x62, 0x36, 0x39, 0x30, 0x33, 0x61, 0x34, 0x38, 0x64, 0x64,
        0x30, 0x30, 0x32, 0x36, 0x30, 0x37, 0x37, 0x64, 0x33, 0x2F, 0x33, 0x62, 0x39, 0x31, 0x38, 0x61,
        0x65, 0x34, 0x2D, 0x30, 0x37, 0x65, 0x31, 0x2D, 0x34, 0x30, 0x35, 0x39, 0x2D, 0x39, 0x34, 0x39,
        0x31, 0x2D, 0x30, 0x61, 0x64, 0x32, 0x34, 0x38, 0x31, 0x39, 0x30, 0x38, 0x31, 0x38, 0x2E, 0x63,
        0x65, 0x72, 0x30, 0x0D, 0x06, 0x09, 0x2A, 0x86, 0x48, 0x86, 0xF7, 0x0D, 0x01, 0x01, 0x0B, 0x05,
        0x00, 0x03, 0x82, 0x01, 0x01, 0x00, 0x2C, 0xFA, 0xFA, 0x9D, 0x90, 0x35, 0xF4, 0xF5, 0xF3, 0x4D,
        0x62, 0xAC, 0xDB, 0xBF, 0x72, 0xE1, 0xD2, 0xF9, 0x7A, 0x46, 0x01, 0xA9, 0x3C, 0x69, 0x7E, 0x31,
        0x88, 0x0E, 0xF0, 0xB8, 0x35, 0x23, 0xD5, 0x0A, 0xBC, 0x45, 0x1A, 0x69, 0x41, 0xE6, 0xF3, 0x8E,
        0x40, 0x05, 0x2F, 0x26, 0xEE, 0xBF, 0x69, 0xDB, 0x64, 0x42, 0x58, 0xEE, 0x93, 0x48, 0x43, 0xD2,
        0xD1, 0x85, 0x18, 0xCC, 0x0B, 0x0D, 0xBA, 0x22, 0xA2, 0x19, 0x59, 0xDA, 0xE2, 0x70, 0x7D, 0x25,
        0x66, 0x5A, 0x57, 0xD1, 0x83, 0x4B, 0xA6, 0x8C, 0x0F, 0x49, 0xC9, 0xF2, 0x43, 0x5C, 0x8A, 0x8A,
        0xC3, 0xB1, 0x5E, 0xB4, 0x8F, 0x46, 0x1B, 0xE7, 0xDD, 0xA4, 0xBF, 0x55, 0x64, 0x38, 0xA9, 0x5B,
        0x4C, 0x5E, 0xFE, 0x67, 0x5D, 0x23, 0x69, 0xAA, 0x71, 0xD0, 0x2A, 0xA1, 0xC4, 0x42, 0x14, 0xCC,
        0x40, 0x5B, 0xF3, 0x2F, 0x4F, 0x6B, 0xCA, 0x0E, 0x69, 0x07, 0xFC, 0x39, 0x18, 0x43, 0x1D, 0x9A,
        0x7E, 0x99, 0xB9, 0xFF, 0x5B, 0xCA, 0xD4, 0xCD, 0x74, 0x83, 0x4B, 0x4A, 0xC5, 0x6D, 0x62, 0x9A,
        0x5B, 0x8B, 0x46, 0xA5, 0x5A, 0x0A, 0x19, 0x11, 0xFE, 0x7F, 0xDB, 0xC8, 0x79, 0x7C, 0x46, 0x97,
        0x15, 0x52, 0xD3, 0x0A, 0xAA, 0x46, 0x6F, 0xEB, 0xFA, 0x1D, 0x5A, 0x64, 0x89, 0xED, 0x6B, 0x43,
        0x8E, 0x88, 0xBF, 0xD2, 0xE3, 0x7E, 0xBB, 0x81, 0x9C, 0x9E, 0x2C, 0xBD, 0xDE, 0x52, 0x7C, 0xDD,
        0x77, 0xE7, 0x98, 0xC9, 0x26, 0x27, 0xD9, 0x72, 0x0D, 0x3D, 0xB5, 0x5A, 0x70, 0xAF, 0x19, 0x89,
        0xF7, 0x6C, 0x2C, 0xCC, 0x22, 0x36, 0xDC, 0xF9, 0xB8, 0xCD, 0x63, 0x6E, 0xAA, 0x44, 0x9F, 0x65,
        0x28, 0x07, 0x71, 0xDC, 0x76, 0x7D, 0x21, 0x73, 0x5D, 0xA3, 0x4C, 0xB3, 0xD6, 0x15, 0xF8, 0x3B,
        0x1A, 0x22, 0x90, 0xD2, 0x19, 0x3D
    ]).buffer;

    var certs = {
        yubiKeyAttestation,
        yubicoRoot,
        feitianFido2,
        tpmAttestation
    };

    /********************************************************************************
     *********************************************************************************
     * MDS
     *********************************************************************************
     *********************************************************************************/

    // downloaded Jun 6, 2018
    var mds1TocJwt = "eyJhbGciOiAiRVMyNTYiLCAidHlwIjogIkpXVCIsICJ4NWMiOiBbIk1JSUNuVENDQWtPZ0F3SUJBZ0lPUnZDTTFhdVU2RllWWFVlYkpIY3dDZ1lJS29aSXpqMEVBd0l3VXpFTE1Ba0dBMVVFQmhNQ1ZWTXhGakFVQmdOVkJBb1REVVpKUkU4Z1FXeHNhV0Z1WTJVeEhUQWJCZ05WQkFzVEZFMWxkR0ZrWVhSaElGUlBReUJUYVdkdWFXNW5NUTB3Q3dZRFZRUURFd1JEUVMweE1CNFhEVEUxTURneE9UQXdNREF3TUZvWERURTRNRGd4T1RBd01EQXdNRm93WkRFTE1Ba0dBMVVFQmhNQ1ZWTXhGakFVQmdOVkJBb1REVVpKUkU4Z1FXeHNhV0Z1WTJVeEhUQWJCZ05WQkFzVEZFMWxkR0ZrWVhSaElGUlBReUJUYVdkdWFXNW5NUjR3SEFZRFZRUURFeFZOWlhSaFpHRjBZU0JVVDBNZ1UybG5ibVZ5SURNd1dUQVRCZ2NxaGtqT1BRSUJCZ2dxaGtqT1BRTUJCd05DQUFTS1grcDNXMmoxR1Y0bFF3bjdIWE5qNGxoOWUyd0FhNko5dEJJUWhiUVRrcU12TlpHbkh4T243eVRaM05wWU81WkdWZ3IvWEM2NnFsaTdCV0E4amdUZm80SHBNSUhtTUE0R0ExVWREd0VCL3dRRUF3SUd3REFNQmdOVkhSTUJBZjhFQWpBQU1CMEdBMVVkRGdRV0JCUmNrTkYrenp4TXVMdm0rcVJqTGVKUWYwRHd5ekFmQmdOVkhTTUVHREFXZ0JScEVWNHRhV1NGblphNDF2OWN6Yjg4ZGM5TUdEQTFCZ05WSFI4RUxqQXNNQ3FnS0tBbWhpUm9kSFJ3T2k4dmJXUnpMbVpwWkc5aGJHeHBZVzVqWlM1dmNtY3ZRMEV0TVM1amNtd3dUd1lEVlIwZ0JFZ3dSakJFQmdzckJnRUVBWUxsSEFFREFUQTFNRE1HQ0NzR0FRVUZCd0lCRmlkb2RIUndjem92TDIxa2N5NW1hV1J2WVd4c2FXRnVZMlV1YjNKbkwzSmxjRzl6YVhSdmNua3dDZ1lJS29aSXpqMEVBd0lEU0FBd1JRSWhBTExiWWpCcmJoUGt3cm4zbVFqQ0VSSXdrTU5OVC9sZmtwTlhIKzR6alVYRUFpQmFzMmxQNmpwNDRCaDRYK3RCWHFZN3k2MWlqR1JJWkNhQUYxS0lsZ3ViMGc9PSIsICJNSUlDc2pDQ0FqaWdBd0lCQWdJT1JxbXhrOE5RdUpmQ0VOVllhMVF3Q2dZSUtvWkl6ajBFQXdNd1V6RUxNQWtHQTFVRUJoTUNWVk14RmpBVUJnTlZCQW9URFVaSlJFOGdRV3hzYVdGdVkyVXhIVEFiQmdOVkJBc1RGRTFsZEdGa1lYUmhJRlJQUXlCVGFXZHVhVzVuTVEwd0N3WURWUVFERXdSU2IyOTBNQjRYRFRFMU1EWXhOekF3TURBd01Gb1hEVFF3TURZeE56QXdNREF3TUZvd1V6RUxNQWtHQTFVRUJoTUNWVk14RmpBVUJnTlZCQW9URFVaSlJFOGdRV3hzYVdGdVkyVXhIVEFiQmdOVkJBc1RGRTFsZEdGa1lYUmhJRlJQUXlCVGFXZHVhVzVuTVEwd0N3WURWUVFERXdSRFFTMHhNRmt3RXdZSEtvWkl6ajBDQVFZSUtvWkl6ajBEQVFjRFFnQUU5c0RnQzhQekJZbC93S3FwWGZhOThqT0lvNzhsOXB6NHhPekdER0l6MHpFWE1Yc0JZNmtBaHlVNEdSbVQwd280dHlVdng1Qlk4T0tsc0xNemxiS01SYU9CN3pDQjdEQU9CZ05WSFE4QkFmOEVCQU1DQVFZd0VnWURWUjBUQVFIL0JBZ3dCZ0VCL3dJQkFEQWRCZ05WSFE0RUZnUVVhUkZlTFdsa2haMld1TmIvWE0yL1BIWFBUQmd3SHdZRFZSMGpCQmd3Rm9BVTBxVWZDNmYyWXNoQTFOaTl1ZGVPMFZTN3ZFWXdOUVlEVlIwZkJDNHdMREFxb0NpZ0pvWWthSFIwY0RvdkwyMWtjeTVtYVdSdllXeHNhV0Z1WTJVdWIzSm5MMUp2YjNRdVkzSnNNRThHQTFVZElBUklNRVl3UkFZTEt3WUJCQUdDNVJ3QkF3RXdOVEF6QmdnckJnRUZCUWNDQVJZbmFIUjBjSE02THk5dFpITXVabWxrYjJGc2JHbGhibU5sTG05eVp5OXlaWEJ2YzJsMGIzSjVNQW9HQ0NxR1NNNDlCQU1EQTJnQU1HVUNNQkxWcTBKZFd2MnlZNFJwMUlpeUlWV0VLRzFQVHoxcFBBRnFFbmFrUHR3NFJNUlRHd0hkYjJpZmNEYlBvRWtmWVFJeEFPTGtmRVBqMjJmQm5lajF3dGd5eWxzdTczcktMVXY0eGhEeTlUQWVWVW1sMGlEQk04U3RFNERpVnMvNGVqRmhxUT09Il19.eyJuZXh0VXBkYXRlIjogIjIwMTgtMDYtMTgiLCAibm8iOiA2MiwgImVudHJpZXMiOiBbeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS8wMDEzJTIzMDAwMSIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTUtMDUtMjAiLCAiaGFzaCI6ICIwNkxaeEo1bU51TlpqNDhJWkxWODE2YmZwM0E3R1Z0TzJPLUVlUTFwa1RZPSIsICJhYWlkIjogIjAwMTMjMDAwMSIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIkZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNS0wNS0yMCJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvMDAxMyUyMzAwNjEiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE1LTEyLTIyIiwgImhhc2giOiAiZ1c4OVQxZzkyUmZXVG4yalhhUG8tc05TaW1nNHlwamdob2cwR25NRFA1Yz0iLCAiYWFpZCI6ICIwMDEzIzAwNjEiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJGSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTUtMTItMjIifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhLzAwMTMlMjMwMDcxIiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNS0xMi0yMiIsICJoYXNoIjogIm5hREJvTndkNEExeGJLZ3FtSVBJbzM0RGNyb05PaWJqMkwtUUF0bE40TU09IiwgImFhaWQiOiAiMDAxMyMwMDcxIiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE1LTEyLTIyIn1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS8wMDEzJTIzMDA4NCIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTUtMTItMjIiLCAiaGFzaCI6ICJjNy1nT3gxTkFhTF9rcXVXRWl3V3VWWDQtaGhrZDNNZTY0REp3eFhQRXBvPSIsICJhYWlkIjogIjAwMTMjMDA4NCIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIkZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNS0xMi0yMiJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvMDAxNCUyM0ZGRjEiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE2LTExLTIyIiwgImhhc2giOiAiVlV0SWtQWHloa21GRmMxR2pUcmdGWDBnWnFkX1d4UHZzaTJnY3M5VF8zST0iLCAiYWFpZCI6ICIwMDE0I0ZGRjEiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJOT1RfRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE1LTA5LTI1In0sIHsic3RhdHVzIjogIlJFVk9LRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE2LTExLTIyIn1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS8wMDE0JTIzRkZGMiIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTYtMTEtMjIiLCAiaGFzaCI6ICJ1SDJoRTFUOHVJQmhuRjdGcm4zcUs4S0I4SktJLVpKYnBzUlBteWNIZmZzPSIsICJhYWlkIjogIjAwMTQjRkZGMiIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTUtMDktMzAifSwgeyJzdGF0dXMiOiAiUkVWT0tFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTYtMTEtMjIifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhLzAwMTQlMjNGRkYzIiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNi0xMS0yMiIsICJoYXNoIjogIm1hUXloSW9kSWlqa1lpMkh5c3YtaGhWcC1qUzJILU5rWjBuZlplRElvUHM9IiwgImFhaWQiOiAiMDAxNCNGRkYzIiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiTk9UX0ZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNS0xMC0zMSJ9LCB7InN0YXR1cyI6ICJSRVZPS0VEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNi0xMS0yMiJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvMDAxNSUyMzAwMDIiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE2LTAxLTA4IiwgImhhc2giOiAiaThfd2N3MWFXRFJpRlVRZWtfbGIwNjhFdUxVY1NoTGpyeGNKVzBCOE92WT0iLCAiYWFpZCI6ICIwMDE1IzAwMDIiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJGSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTYtMDEtMDgifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhLzAwMTUlMjMwMDA1IiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNy0wMi0wOCIsICJoYXNoIjogIlExZHFVck1wU3RwQkEyanJ0clJ6Rkt5amxWc2RpSWdyTU9teDV0dV9iWnc9IiwgImFhaWQiOiAiMDAxNSMwMDA1IiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE3LTAyLTA4In1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS8wMDE2JTIzMDAwMSIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTUtMDctMjEiLCAiaGFzaCI6ICJ1eWpESnBOSm9LTjlDMmhxOEktd2dVeGtkdXdBV1hRUUM5dXFrVHVHek5rPSIsICJhYWlkIjogIjAwMTYjMDAwMSIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIkZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNS0wNy0yMSJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvMDAxNiUyMzAwMDMiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE2LTAyLTEwIiwgImhhc2giOiAidFRlaGVMRDNHS0dqeGZidlYyZG9PX25VbGd5NHF5Y0o0MnhHQlpUTnZ4WT0iLCAiYWFpZCI6ICIwMDE2IzAwMDMiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJOT1RfRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE2LTAyLTEwIn1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS8wMDE2JTIzMDAxMCIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTYtMDItMTAiLCAiaGFzaCI6ICJSeWs0enpHSEV0M0hhOG5PQ1J3Wlo0VTh6VFdKeXhxTnFCNHpTcGRHR3k0PSIsICJhYWlkIjogIjAwMTYjMDAxMCIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTYtMDItMTAifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhLzAwMTYlMjMwMDIwIiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNi0wMi0xMCIsICJoYXNoIjogInBYQVktQ05EV0tiVC1mVS1HclFGQWRyeERDbnM3R1U1Q3JaLVFEbm5TZEE9IiwgImFhaWQiOiAiMDAxNiMwMDIwIiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiTk9UX0ZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNi0wMi0xMCJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvMDAxNyUyMzA0MDAiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE1LTEyLTI3IiwgImhhc2giOiAiOUg1N2ZHTGEyZjFhQ01wSC1xc1l0V01UX2lVVUh0YzhkOFNZb25BblRvOD0iLCAiYWFpZCI6ICIwMDE3IzA0MDAiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJGSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTUtMTItMjcifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhLzAwMTklMjMwMDA1IiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNS0wNy0yMiIsICJoYXNoIjogImxmSmtOYUFHQWViWnpvTnpfMElaUXd4VlVnUHVYU1VJMnBiM0JsTmxZdms9IiwgImFhaWQiOiAiMDAxOSMwMDA1IiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE1LTA3LTIyIn1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS8wMDE5JTIzMTAwNSIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTctMDItMTAiLCAiaGFzaCI6ICJfWnRiaE5zc2tYdWQ2bXJhMjh5T1R5akxEelFVdkdsOUluLUZaYjJYaTQ0PSIsICJhYWlkIjogIjAwMTkjMTAwNSIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIkZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNy0wMi0xMCJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvMDAxOSUyMzEwMDkiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE3LTAyLTEwIiwgImhhc2giOiAiS0J0bnZ1M0pjY1l0Q0NJZmR1VzFIV3p1TFZlclo5UlJCWWdyTWFCakIyND0iLCAiYWFpZCI6ICIwMDE5IzEwMDkiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJGSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTctMDItMTAifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhLzAwMUIlMjMwMDAxIiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNi0wMS0wMSIsICJoYXNoIjogInBRVjJiUjktSU1EYUdGWkpDNkJLYXRmOTN0SVBUZlN2a2xUdkdMam44REE9IiwgImFhaWQiOiAiMDAxQiMwMDAxIiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiTk9UX0ZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNi0wMS0wMSJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvMDAxRCUyMzAwMDEiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE3LTAzLTMxIiwgImhhc2giOiAiWEhjMzJVWGVmdnNQT1p6LUNOYU5fZFNYUFBYaW5EQ2JRekpqRTZaWWpSdz0iLCAiYWFpZCI6ICIwMDFEIzAwMDEiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJOT1RfRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE3LTAzLTMxIn1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS8wMDFEJTIzMDAwMiIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTctMDUtMDQiLCAiaGFzaCI6ICJhc2NVWGxwdzdDMHJjdFFGaENSNUViS25jLXNWTkxPUFlxd1AxM045Nmk4PSIsICJhYWlkIjogIjAwMUQjMDAwMiIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTctMDUtMDQifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhLzAwMUQlMjMxMDAxIiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNy0wMy0yOCIsICJoYXNoIjogImJyWWI2azdacktkYzdBeDFRVEM4ZHd6Q3c5clYxSngxWkl4a3drREJPUTg9IiwgImFhaWQiOiAiMDAxRCMxMDAxIiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiTk9UX0ZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNy0wMy0yOCJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvMDAxRSUyMzAwMDEiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE2LTAzLTMxIiwgImhhc2giOiAiNnlycnJnTmRiaXZaN0ktRjRCUnBEeFZZN1hzRHE5WEJWdExydjFQd2dxUT0iLCAiYWFpZCI6ICIwMDFFIzAwMDEiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJOT1RfRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE2LTAzLTMxIn1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS8wMDFFJTIzMDAwMiIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTYtMDEtMTgiLCAiaGFzaCI6ICI2djdJQzNrMk1uUXNyNFhjWFh3V19zTnBRaS1VWm5LNWxrdWVIdXlKcGRFPSIsICJhYWlkIjogIjAwMUUjMDAwMiIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTYtMDEtMTgifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhLzAwMUUlMjMwMDAzIiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNi0wMi0wNCIsICJoYXNoIjogIjZIZVNjeEFaWl91MEFnTzdkbWdvMDg4R0ZveWxOQld0VGIzQWNULUMyaGs9IiwgImFhaWQiOiAiMDAxRSMwMDAzIiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiTk9UX0ZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNi0wMi0wNCJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvMDAxRSUyMzAwMDQiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE2LTAyLTA0IiwgImhhc2giOiAiN2ZaRGMwRVJxNEZ1U1d6cEkxTGtwcnk5OFllYnp0NU55VThteUV1TWxoMD0iLCAiYWFpZCI6ICIwMDFFIzAwMDQiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJOT1RfRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE2LTAyLTA0In1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS8wMDFFJTIzMDAwNSIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTYtMDItMDQiLCAiaGFzaCI6ICJ4b1pzQmg1c3Z2aWNqcDdsODVFSEdyckRjUkFIeVhHeWZyVFpXNmlnMVl3PSIsICJhYWlkIjogIjAwMUUjMDAwNSIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTYtMDItMDQifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhLzAwMUUlMjMwMDA2IiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNi0wMi0wNCIsICJoYXNoIjogImtxYV8tOXE4U21EWUpmeTRGb3FTZmpIWURpWmE3RFhOSjRPS3hrUnFxSHM9IiwgImFhaWQiOiAiMDAxRSMwMDA2IiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiTk9UX0ZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNi0wMi0wNCJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvMDAxRSUyMzAwMDciLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE2LTAzLTIxIiwgImhhc2giOiAiODR2ZHQwUno0VERfczZhQkpJaFNtQ1ZPSld0U2doSzhmRXpKcnVSMDl0TT0iLCAiYWFpZCI6ICIwMDFFIzAwMDciLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJGSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTYtMDMtMjEifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhLzAwMjAlMjNBMTExIiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNi0xMS0yMiIsICJoYXNoIjogInhJRTVUZW9fTlJ3cGsxNUFMSURrVFhUdWN3dG9lMXlSenhYUzVCYkNzWFU9IiwgImFhaWQiOiAiMDAyMCNBMTExIiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiTk9UX0ZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNi0xMS0yMiJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvMDAyMCUyM0EyMDEiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE2LTAyLTEyIiwgImhhc2giOiAiaFdHNnhHMjB0TjZHTnU2c0NIZjBnNVo2WHRrRTNmRWFrazVwQXlqUDBZTT0iLCAiYWFpZCI6ICIwMDIwI0EyMDEiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJOT1RfRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE2LTAyLTEyIn1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS8wMDIwJTIzQTIwMiIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTYtMDItMTIiLCAiaGFzaCI6ICJ5SzRqVE1BSlFZMmwtV1dJNm1CWmdmQlpaTkpLZzE3VnhTcm9mT0xFWEhRPSIsICJhYWlkIjogIjAwMjAjQTIwMiIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTYtMDItMTIifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhLzAwMjAlMjNBMjAzIiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNi0wMi0xMiIsICJoYXNoIjogIjBiS19DQ2ZDTWd0aWF5amVtOWU3cWtZQ3FiaGw5c3IwcGgzbWR5SUpfREE9IiwgImFhaWQiOiAiMDAyMCNBMjAzIiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiTk9UX0ZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNi0wMi0xMiJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvMDAyMCUyM0EyMDQiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE1LTEyLTIyIiwgImhhc2giOiAiZWg3VjRwaU5fVTVCY19mbFBZMzg2RmNoUnc1VzN1QXh1MGo4M3FCMlkxbz0iLCAiYWFpZCI6ICIwMDIwI0EyMDQiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJGSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTUtMTItMjIifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhLzAwMjAlMjNBMjA1IiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNi0wMi0xMiIsICJoYXNoIjogIlhlRk9pTWs2ajFoaE5hMm14WEdVaDJyenEtUWZ2TnBRNndFcDZWaFNNWmM9IiwgImFhaWQiOiAiMDAyMCNBMjA1IiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiTk9UX0ZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNi0wMi0xMiJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvMDAyMCUyM0EyMDYiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE2LTAyLTEyIiwgImhhc2giOiAiLTc0bjFKMmFtNWRqWGF0WW9IVGt5dnhhcGlRWEtVMU1DNEhuXzVGMEZRST0iLCAiYWFpZCI6ICIwMDIwI0EyMDYiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJOT1RfRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE2LTAyLTEyIn1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS8wMDIwJTIzQjIwNCIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTUtMTItMjIiLCAiaGFzaCI6ICJVQjk2dHdDX0h2cUpQWENOQjFhWHd5bHNnT0ZyV2dUYi15aE9KLW5ZSTJrPSIsICJhYWlkIjogIjAwMjAjQjIwNCIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIkZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNS0xMi0yMiJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvMDAyOCUyMzAwMDEiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE2LTAzLTIxIiwgImhhc2giOiAiQ2ZZOHItT1M2NmtYNEJNUkFZbkJVcVFHUzc0bEk2Vy03SDRzQ2FabEU4Zz0iLCAiYWFpZCI6ICIwMDI4IzAwMDEiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJGSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTYtMDMtMjEifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhLzAwMzElMjMwMDAxIiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNy0wMy0yMiIsICJoYXNoIjogImRhUnlaMUhKQjFtdlYwaEtESWx0OUxvcWhnU1Rwamo5Y3ZwT2NmVndWNVE9IiwgImFhaWQiOiAiMDAzMSMwMDAxIiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE3LTAzLTIyIn1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS8wMDMxJTIzMDAwMiIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTctMDMtMjIiLCAiaGFzaCI6ICJVUEFoVHk1RnhFTEZNdUdOTm0zOFYxdEVEVzVacVc4MmpWMWRjLS02VDFrPSIsICJhYWlkIjogIjAwMzEjMDAwMiIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIkZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNy0wMy0yMiJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvMDAzNyUyMzAwMDEiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE3LTExLTI4IiwgImhhc2giOiAiRDRhU0JtYTJfTFdkV2ZpSkhnbW52OFRjMUVSNmZ0QUdVcXFUb2hFZ1pIZz0iLCAiYWFpZCI6ICIwMDM3IzAwMDEiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJGSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTctMTEtMjgifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhLzA5NkUlMjMwMDA0IiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNy0wMS0wNCIsICJoYXNoIjogIkFnTjJVbElLQTRXMDFuZ1dEZHlZWXNYVjQzX1cwcWhCVGQxYUNaTGdPSUU9IiwgImFhaWQiOiAiMDk2RSMwMDA0IiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE3LTAxLTA0In1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS8xRUE4JTIzODA4MSIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTctMDQtMDciLCAiaGFzaCI6ICJqVFZBVlNXR2ZONjN5SzZHQkFkNXhnTk1EYWF2eDR5dGZsN0EtUjg1QVRrPSIsICJhYWlkIjogIjFFQTgjODA4MSIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIkZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNy0wNC0wNyJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvNDc0NiUyMzMyMDgiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE2LTA2LTA3IiwgImhhc2giOiAiRHV1RzRoeEJoZS1Kb3hPbjhTek9jZlcwbTVPNk1YTkIzdFZoc09xdTFjOD0iLCAiYWFpZCI6ICI0NzQ2IzMyMDgiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJGSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTYtMDYtMDcifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhLzQ3NDYlMjM1MjA2IiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNy0wMy0wOSIsICJoYXNoIjogIm9sQzZ6TjEyUDFpXzdVcUZwTG5mSFhBelVtbWthMVl5VWtfVl9Fd1pyOGM9IiwgImFhaWQiOiAiNDc0NiM1MjA2IiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE3LTAzLTA5In1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS80NzQ2JTIzRjgxNiIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTUtMTAtMTIiLCAiaGFzaCI6ICJQd2hjUkF4d2pReGx3cW9Xb0xoa0VhLTV1dk9tNElEUE13RkdMNWtMRENzPSIsICJhYWlkIjogIjQ3NDYjRjgxNiIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIkZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNS0xMC0xMiJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvNGU0ZSUyMzQwMDUiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE1LTA5LTE1IiwgImhhc2giOiAiaklGUnNwUGRGYkI2bW9GQnlHYnpTdWtfSDJNUGlxYU96ZFQxZ3pmbkJPYz0iLCAiYWFpZCI6ICI0ZTRlIzQwMDUiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJOT1RfRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE1LTA5LTE1In1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS80ZTRlJTIzNDAwNiIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTYtMDMtMTQiLCAiaGFzaCI6ICJPMmo0QzdGbHJ0dy1kZFZHbDFWY0NqZnZYYXFDY3c5blB3QjBIMFh6UEo4PSIsICJhYWlkIjogIjRlNGUjNDAwNiIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTYtMDMtMTQifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhLzRlNGUlMjM0MDA5IiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNi0wMy0xNCIsICJoYXNoIjogImV5TE1GNDQ1Y1BMX1RLc2NmWUdlWXJiLWJZWDAyRG5BZGlsdzBLTEdNTG89IiwgImFhaWQiOiAiNGU0ZSM0MDA5IiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiTk9UX0ZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNi0wMy0xNCJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvNGU0ZSUyMzQwMGEiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE2LTAzLTE0IiwgImhhc2giOiAiVllxaWRHOFk4ZDlENkY3QXJlUWlpck9VVXdLWmoxNTdFakRkVWlnRkNvcz0iLCAiYWFpZCI6ICI0ZTRlIzQwMGEiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJOT1RfRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE2LTAzLTE0In1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS80ZTRlJTIzNDAwYiIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTYtMDMtMTQiLCAiaGFzaCI6ICJEU2VfR2U4QkotZXhWV0RReDRQU19lZGRFZWJ5Tm4wUUtmRlIxZVRTQlN3PSIsICJhYWlkIjogIjRlNGUjNDAwYiIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTYtMDMtMTQifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhLzRlNGUlMjM0MDEwIiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNi0wMy0xNCIsICJoYXNoIjogIjBoSUliUjRqZWdQZFhDVjNGZi1ibGMwdS1SbVlaekFSdWo0QVViS1RHcXc9IiwgImFhaWQiOiAiNGU0ZSM0MDEwIiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiTk9UX0ZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNi0wMy0xNCJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvNGU0ZSUyMzQwMTEiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE2LTAzLTE0IiwgImhhc2giOiAibVVLOHJVRGtHQVNqcDVDNjFQUUNFbVN4Um9OSTVpWTJjWkNuRDB6eTlnZz0iLCAiYWFpZCI6ICI0ZTRlIzQwMTEiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJOT1RfRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE2LTAzLTE0In1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS85ek1VRmFvVEU4MmlXdTl1SjROeFo4IiwgImhhc2giOiAiRUNTLWp0cnJIMmgySkxGeHExSGVJN2V0MldXRTh0VjZHc1IzVTl2c2txcz0iLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE3LTExLTI4IiwgImF0dGVzdGF0aW9uQ2VydGlmaWNhdGVLZXlJZGVudGlmaWVycyI6IFsiOTIzODgxZmUyZjIxNGVlNDY1NDg0MzcxYWViNzJlOTdmNWE1OGUwYSJdLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJGSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTctMTEtMjgifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhL2JiRVBtZDM2aHJvc2lWYnhCWmNHN2YiLCAiaGFzaCI6ICJHV0FLbEtmVmwxMC1oMmlQQl9uY2hiZWZhcnJiZDFmVG9YSXYxWThjS1dZPSIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTctMDItMTEiLCAiYXR0ZXN0YXRpb25DZXJ0aWZpY2F0ZUtleUlkZW50aWZpZXJzIjogWyI5NDFiNjczODRmZjAzMzMwYjcwZGNjYTU4ZjcyMTYzMmYwNDcyNmQyIl0sICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIkZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNy0wMi0xMSJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvQnoyRExHdHhQYzRkU0RGa2VaNkJUQyIsICJoYXNoIjogIllpNzI3SUUtRVJkbEJIT2VyUE54cmExaTZrTnJqalBaX2h3NURkX3FRQm89IiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNy0wMS0yNCIsICJhdHRlc3RhdGlvbkNlcnRpZmljYXRlS2V5SWRlbnRpZmllcnMiOiBbIjQxODM3N2UyMTNkYjE0YWJjNjUwOWRiNWUxMGM5NTk4YjQyZjkyZWEiXSwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE3LTAxLTI0In1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS9EQUI4JTIzMDAxMSIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTUtMTAtMDIiLCAiaGFzaCI6ICJ5NGlPSlp1S0x2MUVYa3VXQVFrWFF1QXgzbmI4THZCdFd4OUpMcWlWQjY4PSIsICJhYWlkIjogIkRBQjgjMDAxMSIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIkZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNS0xMC0wMiJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvREFCOCUyMzEwMTEiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE1LTEyLTIzIiwgImhhc2giOiAiYW51TVFoWnpLUnpGSEoyd1ppWVV2RzFyUXFtODd1YU5DeFJNUHh3RFZ5ST0iLCAiYWFpZCI6ICJEQUI4IzEwMTEiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJGSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTUtMTItMjMifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhL2VTN3Y4c3VtNGp4cDdrZ0xRNVFxY2ciLCAiaGFzaCI6ICJSRHp3dFlDbFdVeWFyVS03WXNLYzg3U2JKUktydG44Q3pIdWlhMjNQRm53PSIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTctMDMtMTQiLCAiYXR0ZXN0YXRpb25DZXJ0aWZpY2F0ZUtleUlkZW50aWZpZXJzIjogWyJkNWRiNGRkNDhmZTQ2YWZkOGFmOGYxZjdjZmJkZWU2MTY0MGJiYmNjIiwgIjU1NDY0ZDViZWE4NGU3MDczMDc0YjIxZDEyMDQ5MzQzNThjN2RiNGQiXSwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE3LTAzLTE0In1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS9GYkZaMktGdmk5QkNyVWRTc1pKRFJlIiwgImhhc2giOiAiVWxLdFFJeWhpdXc0VHoySHNfVTcwRGlib0ZzVi1BYlZLTnhLVE5VTWpzST0iLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE3LTAyLTA4IiwgImF0dGVzdGF0aW9uQ2VydGlmaWNhdGVLZXlJZGVudGlmaWVycyI6IFsiZDNhMTU5OGMwOWRjZDUxMTQyOTczZjFiYjdjOGJkNjUyZTkzYjEwNSJdLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJGSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTctMDItMDgifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhL0pLUDVDaURlaGRNTVB3dEc1aTd0bzUiLCAiaGFzaCI6ICJCTWI2VTlLSWxBTGVuUUJvMktGXzNJZ001ZGRpT0tmSU8wSVc1U19yODN3PSIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTctMDMtMDIiLCAiYXR0ZXN0YXRpb25DZXJ0aWZpY2F0ZUtleUlkZW50aWZpZXJzIjogWyJhNWEzNTMwZTAzYTBmMjExODM5OWFjMGI2YzNjOWQ1NTJhMGQzNGY4Il0sICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIkZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNy0wMy0wMiJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvbU5TUEx1emd5RGFWQXpVRzdIQUVOOSIsICJoYXNoIjogImVjWmN4SVhwMjRYeVliR0lkYm11N05oSmc0RzNwNnF4UVRhUVcwOG53cmM9IiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxOC0wNC0xMyIsICJhdHRlc3RhdGlvbkNlcnRpZmljYXRlS2V5SWRlbnRpZmllcnMiOiBbIjJkMDE4OGI5ZTI1NTJmZWUwYWI2YTYxMjY0MWRlOTY2ODQxZWJlMmIiLCAiMWVhODljOTE2ZDJhYzNjZjI2MmI3ODMyMjk5YzQ4ZDhiNDhjZTMyMyJdLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJOT1RfRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE4LTA0LTEzIn1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS9OOVVvN1c0Y05udmE3Mkxxd0dKUm5kIiwgImhhc2giOiAiZVZkS0VsWDJqZXg0X1JoRWVxMXVpYjE4RnBPcGYwUUNQNDhyUVgxYkVOYz0iLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE3LTAyLTIwIiwgImF0dGVzdGF0aW9uQ2VydGlmaWNhdGVLZXlJZGVudGlmaWVycyI6IFsiNmJhYjE5YzZjMDk3ZjE5MDYwY2U1NDA0MDAwMzgwYzMyZmE2YThlNiJdLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJGSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTctMDItMjAifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhL3VQVGZxQVBiYVpzQ3QydnlldVRqeksiLCAiaGFzaCI6ICJ2U1EybFZnQTZKMW84MEl0MUMteW81WVhpM0tBbW15RlJyVmRvSWI1TF9jPSIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTctMTEtMjgiLCAiYXR0ZXN0YXRpb25DZXJ0aWZpY2F0ZUtleUlkZW50aWZpZXJzIjogWyI2Y2Q5OWQ4YjBhYmZhNmE0Mzc4MTM4YTE0NzVmN2U0NmRmMjE3YTI1IiwgIjdhOGZlMzdhNDJiYmYyYTViM2U2NTc0ZDZmMDRiZGJjNTVlNTkwNDciLCAiYzEwYmM0YzZmNjE0YjYzMzcxZDkyOTU5NmVkZWRkZTNlNDU4NDA0ZCIsICI3NmU0N2I0N2UzMjgxNGFhYTZhODdjMjgwY2ZjYmQ1Mjc4ODFhNDA0Il0sICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIkZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNy0xMS0yOCJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvVjRmekFkVkZEalE4eGd5NHZrMkRzUSIsICJoYXNoIjogIkQwTGt3OEg2X0E2UFU2SGlSN2NuVnZsSTdOdkFvU0lEOVpGdFlPMGJwbXM9IiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNy0wMi0wOCIsICJhdHRlc3RhdGlvbkNlcnRpZmljYXRlS2V5SWRlbnRpZmllcnMiOiBbImM4ODg3MWE0MzhlZjk3YzRkODMyMDdkNmYxNjExMzkyN2FmOGVmM2EiXSwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE3LTAyLTA4In1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS9XUkQ4ejJXUnk5TGU0TmVtR1VLNnZBIiwgImhhc2giOiAiMmJ6Q1ZCZVBjSHV3azE3Y250NVVxQktvamRhSmJZVUtpakY0dG1FcTNXcz0iLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE4LTAyLTA5IiwgImF0dGVzdGF0aW9uQ2VydGlmaWNhdGVLZXlJZGVudGlmaWVycyI6IFsiNWZiYzRiYTc1MzA1MjE4N2FhYjNjNzQxZDFmOWVjNmZiM2M0ZDg3NSIsICIyZWI5ZmYzNTcyZjY3NjI4ZDEyOTFhM2I1NzkyNGY4MThhYWQ5ZTcyIl0sICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIkZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxOC0wMi0wOSJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEveU1VRkNQMnF6anNZc2JIZ0VZWlNWOSIsICJoYXNoIjogIjZKbllrejRURDh1d3NIZVFTcDgtX1lGbWhkQS1wMGthTkhfN21xQl8wY3M9IiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNy0wMy0yMyIsICJhdHRlc3RhdGlvbkNlcnRpZmljYXRlS2V5SWRlbnRpZmllcnMiOiBbImZiZWMxMmM0Mjg3NzRkMzFiZTRkNzcyMzY3NThlYTNjMDQxYTJlZDAiXSwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE3LTAzLTIzIn1dfV19.XUDpXgWFEy2r2vvJVsk3pxADqu53nGsiF36F6q9aZFqJ_0b6X0eTS_xUggV61vFgX3_FLYtxpwJlBSSdw1__yQ";

    // downloaded Jun 6, 2018
    var mds2TocJwt = "eyJhbGciOiAiRVMyNTYiLCAidHlwIjogIkpXVCIsICJ4NWMiOiBbIk1JSUNuVENDQWtPZ0F3SUJBZ0lPUnZDTTFhdVU2RllWWFVlYkpIY3dDZ1lJS29aSXpqMEVBd0l3VXpFTE1Ba0dBMVVFQmhNQ1ZWTXhGakFVQmdOVkJBb1REVVpKUkU4Z1FXeHNhV0Z1WTJVeEhUQWJCZ05WQkFzVEZFMWxkR0ZrWVhSaElGUlBReUJUYVdkdWFXNW5NUTB3Q3dZRFZRUURFd1JEUVMweE1CNFhEVEUxTURneE9UQXdNREF3TUZvWERURTRNRGd4T1RBd01EQXdNRm93WkRFTE1Ba0dBMVVFQmhNQ1ZWTXhGakFVQmdOVkJBb1REVVpKUkU4Z1FXeHNhV0Z1WTJVeEhUQWJCZ05WQkFzVEZFMWxkR0ZrWVhSaElGUlBReUJUYVdkdWFXNW5NUjR3SEFZRFZRUURFeFZOWlhSaFpHRjBZU0JVVDBNZ1UybG5ibVZ5SURNd1dUQVRCZ2NxaGtqT1BRSUJCZ2dxaGtqT1BRTUJCd05DQUFTS1grcDNXMmoxR1Y0bFF3bjdIWE5qNGxoOWUyd0FhNko5dEJJUWhiUVRrcU12TlpHbkh4T243eVRaM05wWU81WkdWZ3IvWEM2NnFsaTdCV0E4amdUZm80SHBNSUhtTUE0R0ExVWREd0VCL3dRRUF3SUd3REFNQmdOVkhSTUJBZjhFQWpBQU1CMEdBMVVkRGdRV0JCUmNrTkYrenp4TXVMdm0rcVJqTGVKUWYwRHd5ekFmQmdOVkhTTUVHREFXZ0JScEVWNHRhV1NGblphNDF2OWN6Yjg4ZGM5TUdEQTFCZ05WSFI4RUxqQXNNQ3FnS0tBbWhpUm9kSFJ3T2k4dmJXUnpMbVpwWkc5aGJHeHBZVzVqWlM1dmNtY3ZRMEV0TVM1amNtd3dUd1lEVlIwZ0JFZ3dSakJFQmdzckJnRUVBWUxsSEFFREFUQTFNRE1HQ0NzR0FRVUZCd0lCRmlkb2RIUndjem92TDIxa2N5NW1hV1J2WVd4c2FXRnVZMlV1YjNKbkwzSmxjRzl6YVhSdmNua3dDZ1lJS29aSXpqMEVBd0lEU0FBd1JRSWhBTExiWWpCcmJoUGt3cm4zbVFqQ0VSSXdrTU5OVC9sZmtwTlhIKzR6alVYRUFpQmFzMmxQNmpwNDRCaDRYK3RCWHFZN3k2MWlqR1JJWkNhQUYxS0lsZ3ViMGc9PSIsICJNSUlDc2pDQ0FqaWdBd0lCQWdJT1JxbXhrOE5RdUpmQ0VOVllhMVF3Q2dZSUtvWkl6ajBFQXdNd1V6RUxNQWtHQTFVRUJoTUNWVk14RmpBVUJnTlZCQW9URFVaSlJFOGdRV3hzYVdGdVkyVXhIVEFiQmdOVkJBc1RGRTFsZEdGa1lYUmhJRlJQUXlCVGFXZHVhVzVuTVEwd0N3WURWUVFERXdSU2IyOTBNQjRYRFRFMU1EWXhOekF3TURBd01Gb1hEVFF3TURZeE56QXdNREF3TUZvd1V6RUxNQWtHQTFVRUJoTUNWVk14RmpBVUJnTlZCQW9URFVaSlJFOGdRV3hzYVdGdVkyVXhIVEFiQmdOVkJBc1RGRTFsZEdGa1lYUmhJRlJQUXlCVGFXZHVhVzVuTVEwd0N3WURWUVFERXdSRFFTMHhNRmt3RXdZSEtvWkl6ajBDQVFZSUtvWkl6ajBEQVFjRFFnQUU5c0RnQzhQekJZbC93S3FwWGZhOThqT0lvNzhsOXB6NHhPekdER0l6MHpFWE1Yc0JZNmtBaHlVNEdSbVQwd280dHlVdng1Qlk4T0tsc0xNemxiS01SYU9CN3pDQjdEQU9CZ05WSFE4QkFmOEVCQU1DQVFZd0VnWURWUjBUQVFIL0JBZ3dCZ0VCL3dJQkFEQWRCZ05WSFE0RUZnUVVhUkZlTFdsa2haMld1TmIvWE0yL1BIWFBUQmd3SHdZRFZSMGpCQmd3Rm9BVTBxVWZDNmYyWXNoQTFOaTl1ZGVPMFZTN3ZFWXdOUVlEVlIwZkJDNHdMREFxb0NpZ0pvWWthSFIwY0RvdkwyMWtjeTVtYVdSdllXeHNhV0Z1WTJVdWIzSm5MMUp2YjNRdVkzSnNNRThHQTFVZElBUklNRVl3UkFZTEt3WUJCQUdDNVJ3QkF3RXdOVEF6QmdnckJnRUZCUWNDQVJZbmFIUjBjSE02THk5dFpITXVabWxrYjJGc2JHbGhibU5sTG05eVp5OXlaWEJ2YzJsMGIzSjVNQW9HQ0NxR1NNNDlCQU1EQTJnQU1HVUNNQkxWcTBKZFd2MnlZNFJwMUlpeUlWV0VLRzFQVHoxcFBBRnFFbmFrUHR3NFJNUlRHd0hkYjJpZmNEYlBvRWtmWVFJeEFPTGtmRVBqMjJmQm5lajF3dGd5eWxzdTczcktMVXY0eGhEeTlUQWVWVW1sMGlEQk04U3RFNERpVnMvNGVqRmhxUT09Il19.eyJuZXh0VXBkYXRlIjogIjIwMTgtMDYtMTgiLCAiZW50cmllcyI6IFt7InVybCI6ICJodHRwczovL21kczIuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS80ZTRlJTIzNDAwNSIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTgtMDUtMTkiLCAiaGFzaCI6ICJpdVJ2aU1NbkJyWG5WcmpJMFRpYWNUektxZEc4VlhUQTZQVXk0cjdTeGhrPSIsICJhYWlkIjogIjRlNGUjNDAwNSIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTgtMDUtMTkifV19LCB7InVybCI6ICJodHRwczovL21kczIuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS80ZTRlJTIzNDAwNiIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTgtMDUtMTkiLCAiaGFzaCI6ICI4M1ROeDU2U2ZhNmVJV05DZGttT2hUUTE3T1I4LU5VbUpaWW4xU1Z1UTdNPSIsICJhYWlkIjogIjRlNGUjNDAwNiIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTgtMDUtMTkifV19LCB7InVybCI6ICJodHRwczovL21kczIuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS80ZTRlJTIzNDAwOSIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTgtMDUtMTkiLCAiaGFzaCI6ICJxUURkTFhteUR3d0I4QktabWJZY0F4WTFWTlp0WWs0SXJYRzdtdTY0TE9jPSIsICJhYWlkIjogIjRlNGUjNDAwOSIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTgtMDUtMTkifV19LCB7InVybCI6ICJodHRwczovL21kczIuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS80ZTRlJTIzNDAwYSIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTgtMDUtMTkiLCAiaGFzaCI6ICI2VDVzUmlWQThHU0FTQjRRZnZxX1VvTFBfQmJEVXloaWVvVjZoVXdZM0NBPSIsICJhYWlkIjogIjRlNGUjNDAwYSIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTgtMDUtMTkifV19LCB7InVybCI6ICJodHRwczovL21kczIuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS80ZTRlJTIzNDAwYiIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTgtMDUtMTkiLCAiaGFzaCI6ICJpeWhEVGRidmdza1d5TWtwSUQ4RG9TdHBIc2Q2Vi1iaThHVVVtTW1xX0ZvPSIsICJhYWlkIjogIjRlNGUjNDAwYiIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTgtMDUtMTkifV19LCB7InVybCI6ICJodHRwczovL21kczIuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS80ZTRlJTIzNDAxMCIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTgtMDUtMTkiLCAiaGFzaCI6ICJJMHdzalNGWHB0cUVxLWNXVVBLUXRibEc0STU4eGxQSHlXTWJVc0hNVFpFPSIsICJhYWlkIjogIjRlNGUjNDAxMCIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTgtMDUtMTkifV19LCB7InVybCI6ICJodHRwczovL21kczIuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS80ZTRlJTIzNDAxMSIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTgtMDUtMTkiLCAiaGFzaCI6ICJYVUtXT2EzeFVlV0ZHRGJ4SFU2YWdCQzVJV0hHSW1ETVJTZFo2ZW1XZVA0PSIsICJhYWlkIjogIjRlNGUjNDAxMSIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTgtMDUtMTkifV19XSwgIm5vIjogMiwgImxlZ2FsSGVhZGVyIjogIk1ldGFkYXRhIExlZ2FsIEhlYWRlcjogVmVyc2lvbiAxLjAwLlx1MzAwMERhdGU6IE1heSAyMSwgMjAxOC4gIFRvIGFjY2VzcywgdmlldyBhbmQgdXNlIGFueSBNZXRhZGF0YSBTdGF0ZW1lbnRzIG9yIHRoZSBUT0MgZmlsZSAoXHUyMDFjTUVUQURBVEFcdTIwMWQpIGZyb20gdGhlIE1EUywgWW91IG11c3QgYmUgYm91bmQgYnkgdGhlIGxhdGVzdCBGSURPIEFsbGlhbmNlIE1ldGFkYXRhIFVzYWdlIFRlcm1zIHRoYXQgY2FuIGJlIGZvdW5kIGF0IGh0dHA6Ly9tZHMyLmZpZG9hbGxpYW5jZS5vcmcvIC4gSWYgeW91IGFscmVhZHkgaGF2ZSBhIHZhbGlkIHRva2VuLCBhY2Nlc3MgdGhlIGFib3ZlIFVSTCBhdHRhY2hpbmcgeW91ciB0b2tlbiBzdWNoIGFzIGh0dHA6Ly9tZHMyLmZpZG9hbGxpYW5jZS5vcmc_dG9rZW49WU9VUi1WQUxJRC1UT0tFTi4gIElmIFlvdSBoYXZlIG5vdCBlbnRlcmVkIGludG8gdGhlIGFncmVlbWVudCwgcGxlYXNlIHZpc2l0IHRoZSByZWdpc3RyYXRpb24gc2l0ZSBmb3VuZCBhdCBodHRwOi8vZmlkb2FsbGlhbmNlLm9yZy9NRFMvIGFuZCBlbnRlciBpbnRvIHRoZSBhZ3JlZW1lbnQgYW5kIG9idGFpbiBhIHZhbGlkIHRva2VuLiAgWW91IG11c3Qgbm90IHJlZGlzdHJpYnV0ZSB0aGlzIGZpbGUgdG8gYW55IHRoaXJkIHBhcnR5LiBSZW1vdmFsIG9mIHRoaXMgTGVnYWwgSGVhZGVyIG9yIG1vZGlmeWluZyBhbnkgcGFydCBvZiB0aGlzIGZpbGUgcmVuZGVycyB0aGlzIGZpbGUgaW52YWxpZC4gIFRoZSBpbnRlZ3JpdHkgb2YgdGhpcyBmaWxlIGFzIG9yaWdpbmFsbHkgcHJvdmlkZWQgZnJvbSB0aGUgTURTIGlzIHZhbGlkYXRlZCBieSB0aGUgaGFzaCB2YWx1ZSBvZiB0aGlzIGZpbGUgdGhhdCBpcyByZWNvcmRlZCBpbiB0aGUgTURTLiBUaGUgdXNlIG9mIGludmFsaWQgZmlsZXMgaXMgc3RyaWN0bHkgcHJvaGliaXRlZC4gSWYgdGhlIHZlcnNpb24gbnVtYmVyIGZvciB0aGUgTGVnYWwgSGVhZGVyIGlzIHVwZGF0ZWQgZnJvbSBWZXJzaW9uIDEuMDAsIHRoZSBNRVRBREFUQSBiZWxvdyBtYXkgYWxzbyBiZSB1cGRhdGVkIG9yIG1heSBub3QgYmUgYXZhaWxhYmxlLiBQbGVhc2UgdXNlIHRoZSBNRVRBREFUQSB3aXRoIHRoZSBMZWdhbCBIZWFkZXIgd2l0aCB0aGUgbGF0ZXN0IHZlcnNpb24gbnVtYmVyLiAgRGF0ZWQ6IDIwMTgtMDUtMjEgVmVyc2lvbiBMSC0xLjAwIn0.5OD_Y5xnINZQ_pqRotaIUC4o-9E_BxRmRoqzJqnjUE9Y0vDlF4vEsobcIf7d3EYSxu-qbx6wCcvR-PRg1GNTcA";

    // downloaded Jun 6, 2018
    var mds2Entry = "eyJhYWlkIjogIjRlNGUjNDAwNSIsICJhc3NlcnRpb25TY2hlbWUiOiAiVUFGVjFUTFYiLCAiYXR0YWNobWVudEhpbnQiOiAxLCAiYXR0ZXN0YXRpb25Sb290Q2VydGlmaWNhdGVzIjogW10sICJhdHRlc3RhdGlvblR5cGVzIjogWzE1ODgwXSwgImF1dGhlbnRpY2F0aW9uQWxnb3JpdGhtIjogOCwgImF1dGhlbnRpY2F0b3JWZXJzaW9uIjogMjU2LCAiZGVzY3JpcHRpb24iOiAiVG91Y2ggSUQsIEZhY2UgSUQsIG9yIFBhc3Njb2RlIiwgImljb24iOiAiZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFFZ0FBQUJJQ0FZQUFBQlY3Yk5IQUFBQUFYTlNSMElBcnM0YzZRQUFBQnhwUkU5VUFBQUFBZ0FBQUFBQUFBQWtBQUFBS0FBQUFDUUFBQUFrQUFBRkpidUoyRWtBQUFUeFNVUkJWSGdCN0pZeGJpTkhFRVVGSjE0WUM1akpBZ3NuSHNPT0hQRUFDMmh5QitJTk5LRXpNblNtdWNCaWVRUHlCbUxnbkx5QmVBUFNKMWplZ0g2ZjZocVV5OVBhWGcwSk8rQUFYOTFkVlYzOS81L21RRGZINC9IbWlyd0hWM08rY0VHdUJsME55djk4U2o0dDF4dDB2VUhYRzNUUlg4R2c1amNEbjU5L3JMNERIOEFNYkJ4V3pGdndHM2cvOEpoaEdrcytWTG1hMXhKSDlBVEloR01oWkY3ejJ2TnkvRXZpdzl6OVNzYUlyTUcrMEpRKzg3UjM4cFhIRHROWTRtS3VwcFFvb2taZ0hveFpzLzRFcHVEMkJTaXZPdFdiYWJwOW85THpjL3hMNHNQY0xXQ0lrQXBzd1djZ29iZDkyNGlycm5ZWXh6cHlNdm9PTE1CZjRGODFjWS9XSlVia2FvWnQ3bVBqWWhJQS9nUjNMbnpEV21iTXdBcnNnZDJNdmxINURXaEJad2h6bWZVNytOWDM3cHZueEpmRUwyWVF4TitERDBhWXVRVEpsQzNvTTZJMGRtRC9IRlN1OXp1Yjk0MGxSdVJxTG1JUTVMODFvaElDOVBZbHJOU0UwanJkckZwbk1YNWpaOFl4Sjc0a2ZoR0RqQ0NrWnlCbnpJN2NBa3pCTGFoc240MHBybStPdmwxUElHZmNpdHdQdGkrT0pVYmthaTVpRUdUSFlOc2o2RE14aWUyK0pWSE1TMnYyNlRaT2djeU5adWxGOVBiTmlTK0puOTBnU09vL1k1SDFBbVRNQXhoNUE3UUdOWmlCRnN6QkJxelNXckVKcVB3K3pZbmRneDA0QnZ3VWEwdU15TldjMVNDSXlweEkrSkZZWmFTWmowQURaRVNzZldtOXAzNEphdXVsa2JWdWxGNkE3ZDM0dk9ZNThTWHhZWnNkRXdpK2RTUkZWcVFiVnlJeExUZ0FFL1BhY2U5N002L0FrK3RiKzNOTGpNalZuTk9ncFNNb2M3cnZnZVpnNi9MUm1EVTU0Y0hoTWNYVTY1aUJqT3JNWVA0cDFXMytWd1pCNnZ0RVRFSWt5SnZUc0k2M1JqVUwwUHRmdFJlbnVmcUJLWGdDZldiTmlaKytiNHc2VHpXMTljbmRqcEw0V1c0UVpHYUpWSjg1VVpDTStjZkgyb1JvbERDRGo5dWNuTXhhZzloM1M4eWJ0TFE5SlVia2FzNWxrTWlKY0dPa05FOHhFeUx6YXN0clpEMUtkU3ZHUGJCYVB4NklLNjkrbmJITWE3QURzWGFjZW5mMU9mRWw4Y0VHUVhDY1NENmFlTllpNTRuSG0xV1JYNFlhWDUrYnl5enRxNUlKSSthTDBFYzFadEl2cWlzeElsY3piRE9IUTJZRzlHMnc2ejFtN2dWR2MxUXZFYjdtTmZOVzR2WFE2eUgwMjdQdWJsdE9mRW44SEFiTmpReWp6UEhpb3psNis5RU0xU3pBSFRpOStXZlpKK0ZWaWl1dnVyaDNROHhlVEJQeUcrdFRZa1N1WnJCQlJrSkV3VGFRN0FRVGx4Z3ZVSUx2UWZlbW1jdmdHV2dUYXV1dmtaanFvMUU2MDB4YU1QZG50TnFYRTE4U0g3WlpwNmNIWXRHY3h1V1dnZmlqaVZJTjh3blloeG92VlB1clZEdGlydjArNzAxYWg5emJFaU55TldjeENFTFJnRlppOUpDYkJjS0w1OHp6MzU2OVhuaWN6MjB2KzZhaDcwWTVZakxRMzdJbUo3NGtQc2dnaUx3QksrQ0ZkQVlRYjBMdWliWDlIQ1JrRy9McW81cDFnaGRxWjJpUDlZajlUd2FTOS9GTmlSRzVtcUVHZllTTUVkZm96Um1IM0pmTVVYNXNOOFJHWXZkZ0YzcDVreFloZCtwQmJKM2kvNmxCRzBjdW1uTndPZDJFVGp4ekNUdzYrTDBWOFNWUTd6blFlZ1NpRVZ0bm9zeTFmcWM0NjdIRmNyZWpKRDcwQmttRWlEMDRzaUoyTUhLTTBSeUpOekVhdlRsdHlGbGRvLzZxRGZsNWluZG1wTHpWcjdVdU1TSlhNOVNnUHlCUWlhUWU1ZzN3NWtoZ2Mwbys1NWVzVGJSR2IwN00rYnF1ai9hRUhyWDZFL1A3OXlsV3F6WW52aVEreUNDUnNBY2k4MEJjTjJmaThsNUFOS2NOZS9XVGVRQzdFQitySDdHK24xUVZhazlucTdiRWlGek4zd0FBQVAvL1g5TGxQd0FBQlBOSlJFRlU3VnE3amlOVkZCd2tKQkNzdEIwUUVleTJJR1NEenBhTURzbldNY2wyU0xDU0hSQnNOdjRBeERnaVFuTC93WFJBUGkzeEFUYjhnUDBIMjM4d1ZMVlBtZG9yejROeDBHM0pWNm81OTlZNTUvcFV6WjFaYVRVWHQ3ZTNGMC9GQmRhM0wvTUNXQU8zaGcva21lZkNmbVk1MXEyQUxITFZQYmtzYW5YM2xuMUFrZlJVY1ZkdGZCUGM3S242MlBka2M5aU1ZZDdaUUJKQjhUbUg0OExlaDA3Tm9kRE83dGdidCt2ZWZ3Tm91TzVmSExoM0cxeHFYSTYrZkVpRFdodWNBcTZBL21VY0VQR1FPVFNCZ2lZQTd5WG1RQlZSQmpIbUFlY204WmswV2Z5TTNKQUdOVEhNQnJIa01GellaMEFiT1EzTHdYdnpFUG1kN3BKOEdiMnF2eS9XVVZ2YkhVMXdNK05hY2tNYTlCN0RYSElJTFp4TElCWHY1bFFIOHBYMTh5WGRaNDV5ZVh5V3pvd1pVQ1Q5ejRZMDZETVR4b0diWkRnT3ZRVDBjbWlPQzZJWkU5M0JpRFB2bVFLWHdCV3dBYnhIKzBYVWU3Ni9LK2w1UFpoQkpxakdVT21yb1pBcGE3aXdaNDNFTWRLY1lwZTkveXZxU21BRmVQK1dYZUQ4WHBubVhEbVlRUmp1eTJSb0NhQ1lYanhpRHF5VHVvL01RVzRDVUZScjRHdXNnRXoyWWI4RTlCbjRON2czaURYaTFzSE5qQ3NHTXlpRzJkZ3dGUDZXUEJmMkhMU3pQSVhRdkY0MFlnbHNBUW04S3k2c1p4bjFxL2lNM1B1RDQ3MjZLeHZhSUE2L0Fkd1lEdGpha0JyMmlnSzRrR09mK01mRU5lcjdWN203NGIrdnlUMTlUWEM5aVVNYjlGeWpZcWk3ak9ITG1saGRuWWpxRFFhWHN3WXhBOTRBUzhETjY1alRQWXJnK0NwVlY1SVBic0g5b0FiRk1EOWhJSDZITmFUSEpmaTlLT3hUYy9hdmluZWxDL1VsUUlOMVozdWdwclY4eVR6TzVBcnV4MkJRYlFOS3lBMjRrZ055WWM5WHdhR1ZaNno2NUM1ZjRkeEVEZVBFY2dYT2J0SytqelhSbzN0bndmV1IrekVZVkdKSURYaU5mY25CdEhDZUFKM1Y3TTBCbHdHcGNicXJZWjczSVBJTzhWdmRIVG52bndkWE1uSU5iaENId1BDL0FEbjNXamlYZ0E5UGdYd0pGV3NRYWM0YWtQQkRzV1l0RitwdXJOWmZtSDlHRmJYUEdMbEdZZEJ1bEY1RUFSRUxZR3RpSkh3RnJtQXRZbW9PalpzQ2VVVDFNSmJSVTJFdmZrR09DMXhyZk5tVDltVTBCbUhJZjJ4UUNXSHN4V3RtbkduaTJtcVo3NDJ6bXBubEcvSTQ1OGExVnJzMXZoU3ZPQ2FEU2h1VXhtd0F2b3BNdzJJL0FUcEFCdTdOQWNkK3IyV3VyN04rOVhVSE9PWStGNjg0R29NNEVBYjhEYmdDQ2cwWVBNVzNnQVF5dWpsMTVGeTQxK2R4ejc3ZjdoWDNON2wwamNvZ0h3NkNDNEEvS3VzUUx5R01LeUJuUFNKclBOZS9JbkJ1VUlZem9ibzJldWZHdlNLWHJ0RVpoSUZmQVZzYlhLSVkrV3FtRW9GOWxkVE5tUVBuWm53SWJtSzFUWERyNEJZOEgxcWpNNGhEWXVoVStBYmNKZEMvanFpWmhUZ2FSeXdsRVB1NTVlcW9yNDFqYng3bmEvVWRpcU0wS0FUOURBSDhmZlRHQjhjNUF4cEF4cVRtRkVtdWpKN09lSm96Qi9panVqZmRQMGY3MFJxa0FSVXBKRVM1ME5RYzFtd0JtZGUvRHB3WHhqWFlzKzVQUnQxL1Z4eTlRUkR4QXZnZDZBQUpWNXhLR0hJVXZiYWFUWENGY2V6amkvcFJmUS9GMFJ0RUFSQ1VBemVBak9FK2x6anNhVUpuZWY0eUo1Y0JhK04veGY0TDlUMG1ub1JCRWdKeHI0SHZkV2JFZVFiSU9FWTNwNDBjdWVrM0wxNSs0cjJQMlorVVFTNElncjhDL2dnRFpOQUdaNzJjdjdDL0J0NEN6NzMzLyt4UDFpQ0poSGorR1AwQWZBZDhHdmhhK1dQallBWWQ4OEduMG52VS81V2Npc2hqNWp3YjlNQ2YvNXdOT2h2MDlEOFE0NC9tK1FXZFg5QnhMK2hmVXdUWXlSQ2FyWjhBQUFBQVNVVk9SSzVDWUlJPSIsICJpc1NlY29uZEZhY3Rvck9ubHkiOiBmYWxzZSwgImtleVByb3RlY3Rpb24iOiA2LCAibGVnYWxIZWFkZXIiOiAiTWV0YWRhdGEgTGVnYWwgSGVhZGVyOiBWZXJzaW9uIDEuMDAuXHUzMDAwRGF0ZTogTWF5IDIxLCAyMDE4LiAgVG8gYWNjZXNzLCB2aWV3IGFuZCB1c2UgYW55IE1ldGFkYXRhIFN0YXRlbWVudHMgb3IgdGhlIFRPQyBmaWxlIChcdTIwMWNNRVRBREFUQVx1MjAxZCkgZnJvbSB0aGUgTURTLCBZb3UgbXVzdCBiZSBib3VuZCBieSB0aGUgbGF0ZXN0IEZJRE8gQWxsaWFuY2UgTWV0YWRhdGEgVXNhZ2UgVGVybXMgdGhhdCBjYW4gYmUgZm91bmQgYXQgaHR0cDovL21kczIuZmlkb2FsbGlhbmNlLm9yZy8gLiBJZiB5b3UgYWxyZWFkeSBoYXZlIGEgdmFsaWQgdG9rZW4sIGFjY2VzcyB0aGUgYWJvdmUgVVJMIGF0dGFjaGluZyB5b3VyIHRva2VuIHN1Y2ggYXMgaHR0cDovL21kczIuZmlkb2FsbGlhbmNlLm9yZz90b2tlbj1ZT1VSLVZBTElELVRPS0VOLiAgSWYgWW91IGhhdmUgbm90IGVudGVyZWQgaW50byB0aGUgYWdyZWVtZW50LCBwbGVhc2UgdmlzaXQgdGhlIHJlZ2lzdHJhdGlvbiBzaXRlIGZvdW5kIGF0IGh0dHA6Ly9maWRvYWxsaWFuY2Uub3JnL01EUy8gYW5kIGVudGVyIGludG8gdGhlIGFncmVlbWVudCBhbmQgb2J0YWluIGEgdmFsaWQgdG9rZW4uICBZb3UgbXVzdCBub3QgcmVkaXN0cmlidXRlIHRoaXMgZmlsZSB0byBhbnkgdGhpcmQgcGFydHkuIFJlbW92YWwgb2YgdGhpcyBMZWdhbCBIZWFkZXIgb3IgbW9kaWZ5aW5nIGFueSBwYXJ0IG9mIHRoaXMgZmlsZSByZW5kZXJzIHRoaXMgZmlsZSBpbnZhbGlkLiAgVGhlIGludGVncml0eSBvZiB0aGlzIGZpbGUgYXMgb3JpZ2luYWxseSBwcm92aWRlZCBmcm9tIHRoZSBNRFMgaXMgdmFsaWRhdGVkIGJ5IHRoZSBoYXNoIHZhbHVlIG9mIHRoaXMgZmlsZSB0aGF0IGlzIHJlY29yZGVkIGluIHRoZSBNRFMuIFRoZSB1c2Ugb2YgaW52YWxpZCBmaWxlcyBpcyBzdHJpY3RseSBwcm9oaWJpdGVkLiBJZiB0aGUgdmVyc2lvbiBudW1iZXIgZm9yIHRoZSBMZWdhbCBIZWFkZXIgaXMgdXBkYXRlZCBmcm9tIFZlcnNpb24gMS4wMCwgdGhlIE1FVEFEQVRBIGJlbG93IG1heSBhbHNvIGJlIHVwZGF0ZWQgb3IgbWF5IG5vdCBiZSBhdmFpbGFibGUuIFBsZWFzZSB1c2UgdGhlIE1FVEFEQVRBIHdpdGggdGhlIExlZ2FsIEhlYWRlciB3aXRoIHRoZSBsYXRlc3QgdmVyc2lvbiBudW1iZXIuICBEYXRlZDogMjAxOC0wNS0yMSBWZXJzaW9uIExILTEuMDAiLCAibWF0Y2hlclByb3RlY3Rpb24iOiAyLCAicHJvdG9jb2xGYW1pbHkiOiAidWFmIiwgInB1YmxpY0tleUFsZ0FuZEVuY29kaW5nIjogMjU4LCAidGNEaXNwbGF5IjogMSwgInRjRGlzcGxheUNvbnRlbnRUeXBlIjogInRleHQvcGxhaW4iLCAidXB2IjogW3sibWFqb3IiOiAxLCAibWlub3IiOiAxfSwgeyJtYWpvciI6IDEsICJtaW5vciI6IDB9XSwgInVzZXJWZXJpZmljYXRpb25EZXRhaWxzIjogW1t7ImNhRGVzYyI6IHsiYmFzZSI6IDEwLCAiYmxvY2tTbG93ZG93biI6IDYwLCAibWF4UmV0cmllcyI6IDUsICJtaW5MZW5ndGgiOiA0fSwgInVzZXJWZXJpZmljYXRpb24iOiA0fV0sIFt7ImJhRGVzYyI6IHsiYmxvY2tTbG93ZG93biI6IDAsICJtYXhSZWZlcmVuY2VEYXRhU2V0cyI6IDUsICJtYXhSZXRyaWVzIjogNX0sICJ1c2VyVmVyaWZpY2F0aW9uIjogMn1dXX0=";

    // https://mds.fidoalliance.org/Root.cer
    var mdsRootCert =
        "-----BEGIN CERTIFICATE-----\n" +
        "MIICQzCCAcigAwIBAgIORqmxkzowRM99NQZJurcwCgYIKoZIzj0EAwMwUzELMAkG\n" +
        "A1UEBhMCVVMxFjAUBgNVBAoTDUZJRE8gQWxsaWFuY2UxHTAbBgNVBAsTFE1ldGFk\n" +
        "YXRhIFRPQyBTaWduaW5nMQ0wCwYDVQQDEwRSb290MB4XDTE1MDYxNzAwMDAwMFoX\n" +
        "DTQ1MDYxNzAwMDAwMFowUzELMAkGA1UEBhMCVVMxFjAUBgNVBAoTDUZJRE8gQWxs\n" +
        "aWFuY2UxHTAbBgNVBAsTFE1ldGFkYXRhIFRPQyBTaWduaW5nMQ0wCwYDVQQDEwRS\n" +
        "b290MHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEFEoo+6jdxg6oUuOloqPjK/nVGyY+\n" +
        "AXCFz1i5JR4OPeFJs+my143ai0p34EX4R1Xxm9xGi9n8F+RxLjLNPHtlkB3X4ims\n" +
        "rfIx7QcEImx1cMTgu5zUiwxLX1ookVhIRSoso2MwYTAOBgNVHQ8BAf8EBAMCAQYw\n" +
        "DwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQU0qUfC6f2YshA1Ni9udeO0VS7vEYw\n" +
        "HwYDVR0jBBgwFoAU0qUfC6f2YshA1Ni9udeO0VS7vEYwCgYIKoZIzj0EAwMDaQAw\n" +
        "ZgIxAKulGbSFkDSZusGjbNkAhAkqTkLWo3GrN5nRBNNk2Q4BlG+AvM5q9wa5WciW\n" +
        "DcMdeQIxAMOEzOFsxX9Bo0h4LOFE5y5H8bdPFYW+l5gy1tQiJv+5NUyM2IBB55XU\n" +
        "YjdBz56jSA==\n" +
        "-----END CERTIFICATE-----\n";

    // https://mds.fidoalliance.org/Root.crl
    var mdsRootCrl =
        "-----BEGIN X509 CRL-----\n" +
        "MIIBLTCBswIBATAKBggqhkjOPQQDAzBTMQswCQYDVQQGEwJVUzEWMBQGA1UEChMN\n" +
        "RklETyBBbGxpYW5jZTEdMBsGA1UECxMUTWV0YWRhdGEgVE9DIFNpZ25pbmcxDTAL\n" +
        "BgNVBAMTBFJvb3QXDTE4MDQwNzAwMDAwMFoXDTE4MDcxNTAwMDAwMFqgLzAtMAoG\n" +
        "A1UdFAQDAgEMMB8GA1UdIwQYMBaAFNKlHwun9mLIQNTYvbnXjtFUu7xGMAoGCCqG\n" +
        "SM49BAMDA2kAMGYCMQCnXSfNppE9vpsGtY9DsPWyR3aVVSPs6i5/3A21a1+rCNoa\n" +
        "1cJNWKZJ7IV4cdjIXVUCMQCDh8U8OekdTnuvcG3FaoMJO0y0C0FS5dbTzcuiADjy\n" +
        "VbAQeaSsCauVySzyB3lVVgE=\n" +
        "-----END X509 CRL-----\n";

    // http://mds.fidoalliance.org/CA-1.crl
    var ca1Crl =
        "-----BEGIN X509 CRL-----\n" +
        "MIIBDTCBswIBATAKBggqhkjOPQQDAjBTMQswCQYDVQQGEwJVUzEWMBQGA1UEChMN\n" +
        "RklETyBBbGxpYW5jZTEdMBsGA1UECxMUTWV0YWRhdGEgVE9DIFNpZ25pbmcxDTAL\n" +
        "BgNVBAMTBENBLTEXDTE4MDYwNzAwMDAwMFoXDTE4MDcxNTAwMDAwMFqgLzAtMAoG\n" +
        "A1UdFAQDAgEkMB8GA1UdIwQYMBaAFGkRXi1pZIWdlrjW/1zNvzx1z0wYMAoGCCqG\n" +
        "SM49BAMCA0kAMEYCIQDEDFIsNHgOZUUolm0XIyyGO5Qrr7byVtjfkd7nTfpAlAIh\n" +
        "AIBctNT3uR9vLosOHQexvhp2EL/KO9cALAk6HaVwL/LD\n" +
        "-----END X509 CRL-----\n";

    var mdsIntermediateCert =
        "-----BEGIN CERTIFICATE-----\n" +
        "MIICsjCCAjigAwIBAgIORqmxk8NQuJfCENVYa1QwCgYIKoZIzj0EAwMwUzELMAkG\n" +
        "A1UEBhMCVVMxFjAUBgNVBAoTDUZJRE8gQWxsaWFuY2UxHTAbBgNVBAsTFE1ldGFk\n" +
        "YXRhIFRPQyBTaWduaW5nMQ0wCwYDVQQDEwRSb290MB4XDTE1MDYxNzAwMDAwMFoX\n" +
        "DTQwMDYxNzAwMDAwMFowUzELMAkGA1UEBhMCVVMxFjAUBgNVBAoTDUZJRE8gQWxs\n" +
        "aWFuY2UxHTAbBgNVBAsTFE1ldGFkYXRhIFRPQyBTaWduaW5nMQ0wCwYDVQQDEwRD\n" +
        "QS0xMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE9sDgC8PzBYl/wKqpXfa98jOI\n" +
        "o78l9pz4xOzGDGIz0zEXMXsBY6kAhyU4GRmT0wo4tyUvx5BY8OKlsLMzlbKMRaOB\n" +
        "7zCB7DAOBgNVHQ8BAf8EBAMCAQYwEgYDVR0TAQH/BAgwBgEB/wIBADAdBgNVHQ4E\n" +
        "FgQUaRFeLWlkhZ2WuNb/XM2/PHXPTBgwHwYDVR0jBBgwFoAU0qUfC6f2YshA1Ni9\n" +
        "udeO0VS7vEYwNQYDVR0fBC4wLDAqoCigJoYkaHR0cDovL21kcy5maWRvYWxsaWFu\n" +
        "Y2Uub3JnL1Jvb3QuY3JsME8GA1UdIARIMEYwRAYLKwYBBAGC5RwBAwEwNTAzBggr\n" +
        "BgEFBQcCARYnaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9yZXBvc2l0b3J5\n" +
        "MAoGCCqGSM49BAMDA2gAMGUCMBLVq0JdWv2yY4Rp1IiyIVWEKG1PTz1pPAFqEnak\n" +
        "Ptw4RMRTGwHdb2ifcDbPoEkfYQIxAOLkfEPj22fBnej1wtgyylsu73rKLUv4xhDy\n" +
        "9TAeVUml0iDBM8StE4DiVs/4ejFhqQ==\n" +
        "-----END CERTIFICATE-----\n";

    var mdsSigningCert =
        "-----BEGIN CERTIFICATE-----\n" +
        "MIICnTCCAkOgAwIBAgIORvCM1auU6FYVXUebJHcwCgYIKoZIzj0EAwIwUzELMAkG\n" +
        "A1UEBhMCVVMxFjAUBgNVBAoTDUZJRE8gQWxsaWFuY2UxHTAbBgNVBAsTFE1ldGFk\n" +
        "YXRhIFRPQyBTaWduaW5nMQ0wCwYDVQQDEwRDQS0xMB4XDTE1MDgxOTAwMDAwMFoX\n" +
        "DTE4MDgxOTAwMDAwMFowZDELMAkGA1UEBhMCVVMxFjAUBgNVBAoTDUZJRE8gQWxs\n" +
        "aWFuY2UxHTAbBgNVBAsTFE1ldGFkYXRhIFRPQyBTaWduaW5nMR4wHAYDVQQDExVN\n" +
        "ZXRhZGF0YSBUT0MgU2lnbmVyIDMwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAASK\n" +
        "X+p3W2j1GV4lQwn7HXNj4lh9e2wAa6J9tBIQhbQTkqMvNZGnHxOn7yTZ3NpYO5ZG\n" +
        "Vgr/XC66qli7BWA8jgTfo4HpMIHmMA4GA1UdDwEB/wQEAwIGwDAMBgNVHRMBAf8E\n" +
        "AjAAMB0GA1UdDgQWBBRckNF+zzxMuLvm+qRjLeJQf0DwyzAfBgNVHSMEGDAWgBRp\n" +
        "EV4taWSFnZa41v9czb88dc9MGDA1BgNVHR8ELjAsMCqgKKAmhiRodHRwOi8vbWRz\n" +
        "LmZpZG9hbGxpYW5jZS5vcmcvQ0EtMS5jcmwwTwYDVR0gBEgwRjBEBgsrBgEEAYLl\n" +
        "HAEDATA1MDMGCCsGAQUFBwIBFidodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3Jn\n" +
        "L3JlcG9zaXRvcnkwCgYIKoZIzj0EAwIDSAAwRQIhALLbYjBrbhPkwrn3mQjCERIw\n" +
        "kMNNT/lfkpNXH+4zjUXEAiBas2lP6jp44Bh4X+tBXqY7y61ijGRIZCaAF1KIlgub\n" +
        "0g==\n" +
        "-----END CERTIFICATE-----\n";

    var mds = {
        mds1TocJwt,
        mds2TocJwt,
        mds2Entry,
        mdsRootCert,
        mdsRootCrl,
        ca1Crl,
        mdsIntermediateCert,
        mdsSigningCert
    };

    /********************************************************************************
     *********************************************************************************
     * NAKED FIELDS
     *********************************************************************************
     *********************************************************************************/
    var clientDataJsonBuf = makeCredentialAttestationNoneResponse.response.clientDataJSON;
    var clientDataJsonObj = {
        challenge: "33EHav-jZ1v9qwH783aU-j0ARx6r5o-YHh-wd7C6jPbd7Wh6ytbIZosIIACehwf9-s6hXhySHO-HHUjEwZS29w",
        clientExtensions: {},
        hashAlgorithm: "SHA-256",
        origin: "https://localhost:8443",
        type: "webauthn.create"
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
        certs,
        mds,
        naked
    };
})); /* end AMD module */
