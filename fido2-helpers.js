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
            return false;
        }

        for (var i = 0; i < len; i++) {
            if (a.readUInt8(i) !== b.readUInt8(i)) {
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

    var challengeRequestMsg = { // TODO: obsolete
        username: "bubba"
    };

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

    var challengeResponseAttestationNoneMsg = {
        body: {
            "binaryEncoding": "base64",
            "username": "adam",
            "rawId": "AAii3V6sGoaozW7TbNaYlJaJ5br8TrBfRXnofZO6l2suc3a5tt/XFuFkFA/5eabU80S1PW0m4IZ79BS2kQO7Zcuy2vf0ESg18GTLG1mo5YSkIdqL2J44egt+6rcj7NedSEwxa/uuxUYBtHNnSQqDmtoUAfM9LSWLl65BjKVZNGUp9ao33mMSdVfQQ0bHze69JVQvLBf8OTiZUqJsOuKmpqUc",
            "id": "AAii3V6sGoaozW7TbNaYlJaJ5br8TrBfRXnofZO6l2suc3a5tt/XFuFkFA/5eabU80S1PW0m4IZ79BS2kQO7Zcuy2vf0ESg18GTLG1mo5YSkIdqL2J44egt+6rcj7NedSEwxa/uuxUYBtHNnSQqDmtoUAfM9LSWLl65BjKVZNGUp9ao33mMSdVfQQ0bHze69JVQvLBf8OTiZUqJsOuKmpqUc",
            "response": {
                "attestationObject": "o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YVkBJkmWDeWIDoxodDQXD2R2YFuP5K65ooYyx5lc87qDHZdjQQAAAAAAAAAAAAAAAAAAAAAAAAAAAKIACKLdXqwahqjNbtNs1piUlonluvxOsF9Feeh9k7qXay5zdrm239cW4WQUD/l5ptTzRLU9bSbghnv0FLaRA7tly7La9/QRKDXwZMsbWajlhKQh2ovYnjh6C37qtyPs151ITDFr+67FRgG0c2dJCoOa2hQB8z0tJYuXrkGMpVk0ZSn1qjfeYxJ1V9BDRsfN7r0lVC8sF/w5OJlSomw64qampRylAQIDJiABIVgguxHN3W6ehp0VWXKaMNie1J82MVJCFZYScau74o17cx8iWCDb1jkTLi7lYZZbgwUwpqAk8QmIiPMTVQUVkhGEyGrKww==",
                "clientDataJSON": "eyJjaGFsbGVuZ2UiOiIzM0VIYXYtaloxdjlxd0g3ODNhVS1qMEFSeDZyNW8tWUhoLXdkN0M2alBiZDdXaDZ5dGJJWm9zSUlBQ2Vod2Y5LXM2aFhoeVNITy1ISFVqRXdaUzI5dyIsImNsaWVudEV4dGVuc2lvbnMiOnt9LCJoYXNoQWxnb3JpdGhtIjoiU0hBLTI1NiIsIm9yaWdpbiI6Imh0dHBzOi8vbG9jYWxob3N0Ojg0NDMiLCJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIn0="
            }
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

    var challengeResponseAttestationU2fMsg = {
        body: {
            "binaryEncoding": "base64",
            "username": "adam",
            "id": "Bo+VjHOkJZy8DjnCJnIc0Oxt9QAz5upMdSJxNbd+GyAo6MNIvPBb9YsUlE0ZJaaWXtWH5FQyPS6bT/e698IirQ==",
            "response": {
                "attestationObject": "o2NmbXRoZmlkby11MmZnYXR0U3RtdKJjc2lnWEgwRgIhAO+683ISJhKdmUPmVbQuYZsp8lkD7YJcInHS3QOfbrioAiEAzgMJ499cBczBw826r1m55Jmd9mT4d1iEXYS8FbIn8MpjeDVjgVkCSDCCAkQwggEuoAMCAQICBFVivqAwCwYJKoZIhvcNAQELMC4xLDAqBgNVBAMTI1l1YmljbyBVMkYgUm9vdCBDQSBTZXJpYWwgNDU3MjAwNjMxMCAXDTE0MDgwMTAwMDAwMFoYDzIwNTAwOTA0MDAwMDAwWjAqMSgwJgYDVQQDDB9ZdWJpY28gVTJGIEVFIFNlcmlhbCAxNDMyNTM0Njg4MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAESzMfdz2BRLmZXL5FhVF+F1g6pHYjaVy+haxILIAZ8sm5RnrgRbDmbxMbLqMkPJH9pgLjGPP8XY0qerrnK9FDCaM7MDkwIgYJKwYBBAGCxAoCBBUxLjMuNi4xLjQuMS40MTQ4Mi4xLjUwEwYLKwYBBAGC5RwCAQEEBAMCBSAwCwYJKoZIhvcNAQELA4IBAQCsFtmzbrazqbdtdZSzT1n09z7byf3rKTXra0Ucq/QdJdPnFhTXRyYEynKleOMj7bdgBGhfBefRub4F226UQPrFz8kypsr66FKZdy7bAnggIDzUFB0+629qLOmeOVeAMmOrq41uxICn3whK0sunt9bXfJTD68CxZvlgV8r1/jpjHqJqQzdio2++z0z0RQliX9WvEEmqfIvHaJpmWemvXejw1ywoglF0xQ4Gq39qB5CDe22zKr/cvKg1y7sJDvHw2Z4Iab/p5WdkxCMObAV3KbAQ3g7F+czkyRwoJiGOqAgau5aRUewWclryqNled5W8qiJ6m5RDIMQnYZyq+FTZgpjXaGF1dGhEYXRhWMRJlg3liA6MaHQ0Fw9kdmBbj+SuuaKGMseZXPO6gx2XY0EAAAAAAAAAAAAAAAAAAAAAAAAAAABABo+VjHOkJZy8DjnCJnIc0Oxt9QAz5upMdSJxNbd+GyAo6MNIvPBb9YsUlE0ZJaaWXtWH5FQyPS6bT/e698IiraUBAgMmIAEhWCA1c9AIeH5sN6x1Q+2qR7v255tkeGbWs0ECCDw35kJGBCJYIBjTUxruadjFFMnWlR5rPJr23sBJT9qexY9PCc9o8hmT",
                "clientDataJSON": "eyJjaGFsbGVuZ2UiOiJWdTh1RHFua3dPamQ4M0tMajZTY24yQmdGTkxGYkdSN0txX1hKSndRbm5hdHp0VVI3WElCTDdLOHVNUENJYVFtS3cxTUNWUTVhYXpOSkZrN05ha2dxQSIsImNsaWVudEV4dGVuc2lvbnMiOnt9LCJoYXNoQWxnb3JpdGhtIjoiU0hBLTI1NiIsIm9yaWdpbiI6Imh0dHBzOi8vbG9jYWxob3N0Ojg0NDMiLCJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIn0="
            }
        }
    };

    var assertionResponseMsgB64Url = {
        "rawId": "AAhH7cnPRBkcukjnc2G2GM1H5dkVs9P1q2VErhD57pkzKVjBbixdsufjXhUOfiD27D0VA-fPKUVYNGE2XYcjhihtYODQv-xEarplsa7Ix6hK13FA6uyRxMgHC3PhTbx-rbq_RMUbaJ-HoGVt-c820ifdoagkFR02Van8Vr9q67Bn6zHNDT_DNrQbtpIUqqX_Rg2p5o6F7bVO3uOJG9hUNgUb",
        "id": "AAhH7cnPRBkcukjnc2G2GM1H5dkVs9P1q2VErhD57pkzKVjBbixdsufjXhUOfiD27D0VA-fPKUVYNGE2XYcjhihtYODQv-xEarplsa7Ix6hK13FA6uyRxMgHC3PhTbx-rbq_RMUbaJ-HoGVt-c820ifdoagkFR02Van8Vr9q67Bn6zHNDT_DNrQbtpIUqqX_Rg2p5o6F7bVO3uOJG9hUNgUb",
        "response": {
            "clientDataJSON": "eyJjaGFsbGVuZ2UiOiJlYVR5VU5ueVBERGRLOFNORWdURVV2ejFROGR5bGtqalRpbVlkNVg3UUFvLUY4X1oxbHNKaTNCaWxVcEZaSGtJQ05EV1k4cjlpdm5UZ1c3LVhaQzNxUSIsImNsaWVudEV4dGVuc2lvbnMiOnt9LCJoYXNoQWxnb3JpdGhtIjoiU0hBLTI1NiIsIm9yaWdpbiI6Imh0dHBzOi8vbG9jYWxob3N0Ojg0NDMiLCJ0eXBlIjoid2ViYXV0aG4uZ2V0In0=",
            "authenticatorData": "SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2MBAAABaw==",
            "signature": "MEYCIQD6dF3B0ZoaLA0r78oyRdoMNR0bN93Zi4cF_75hFAH6pQIhALY0UIsrh03u_f4yKOwzwD6Cj3_GWLJiioTT9580s1a7",
            "userHandle": null
        }
    };

    var assertionResponseMsg = {
        body: {
            "binaryEncoding": "base64",
            "rawId": "AAhH7cnPRBkcukjnc2G2GM1H5dkVs9P1q2VErhD57pkzKVjBbixdsufjXhUOfiD27D0VA+fPKUVYNGE2XYcjhihtYODQv+xEarplsa7Ix6hK13FA6uyRxMgHC3PhTbx+rbq/RMUbaJ+HoGVt+c820ifdoagkFR02Van8Vr9q67Bn6zHNDT/DNrQbtpIUqqX/Rg2p5o6F7bVO3uOJG9hUNgUb",
            "id": "AAhH7cnPRBkcukjnc2G2GM1H5dkVs9P1q2VErhD57pkzKVjBbixdsufjXhUOfiD27D0VA+fPKUVYNGE2XYcjhihtYODQv+xEarplsa7Ix6hK13FA6uyRxMgHC3PhTbx+rbq/RMUbaJ+HoGVt+c820ifdoagkFR02Van8Vr9q67Bn6zHNDT/DNrQbtpIUqqX/Rg2p5o6F7bVO3uOJG9hUNgUb",
            "response": {
                "clientDataJSON": "eyJjaGFsbGVuZ2UiOiJlYVR5VU5ueVBERGRLOFNORWdURVV2ejFROGR5bGtqalRpbVlkNVg3UUFvLUY4X1oxbHNKaTNCaWxVcEZaSGtJQ05EV1k4cjlpdm5UZ1c3LVhaQzNxUSIsImNsaWVudEV4dGVuc2lvbnMiOnt9LCJoYXNoQWxnb3JpdGhtIjoiU0hBLTI1NiIsIm9yaWdpbiI6Imh0dHBzOi8vbG9jYWxob3N0Ojg0NDMiLCJ0eXBlIjoid2ViYXV0aG4uZ2V0In0=",
                "authenticatorData": "SZYN5YgOjGh0NBcPZHZgW4/krrmihjLHmVzzuoMdl2MBAAABaw==",
                "signature": "MEYCIQD6dF3B0ZoaLA0r78oyRdoMNR0bN93Zi4cF/75hFAH6pQIhALY0UIsrh03u/f4yKOwzwD6Cj3/GWLJiioTT9580s1a7",
                "userHandle": ""
            }
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
        challengeRequestMsg,
        creationOptionsRequest,
        basicCreationOptions,
        completeCreationOptions,
        getOptionsRequest,
        challengeResponseAttestationNoneMsgB64Url,
        challengeResponseAttestationNoneMsg,
        challengeResponseAttestationU2fMsg,
        basicGetOptions,
        completeGetOptions,
        assertionResponseMsgB64Url,
        assertionResponseMsg,
        successServerResponse,
        errorServerResponse
    };

    /********************************************************************************
     *********************************************************************************
     * LIB PARAMS
     *********************************************************************************
     *********************************************************************************/

    var makeCredentialAttestationNoneResponse = {
        username: challengeResponseAttestationNoneMsg.body.username,
        rawId: b64decode(challengeResponseAttestationNoneMsg.body.id),
        id: b64decode(challengeResponseAttestationNoneMsg.body.id),
        response: {
            attestationObject: b64decode(challengeResponseAttestationNoneMsg.body.response.attestationObject),
            clientDataJSON: b64decode(challengeResponseAttestationNoneMsg.body.response.clientDataJSON)
        }
    };

    var makeCredentialAttestationU2fResponse = {
        username: challengeResponseAttestationU2fMsg.body.username,
        rawId: b64decode(challengeResponseAttestationU2fMsg.body.id),
        id: b64decode(challengeResponseAttestationU2fMsg.body.id),
        response: {
            attestationObject: b64decode(challengeResponseAttestationU2fMsg.body.response.attestationObject),
            clientDataJSON: b64decode(challengeResponseAttestationU2fMsg.body.response.clientDataJSON)
        }
    };

    var assertionResponse = {
        rawId: b64decode(assertionResponseMsg.body.rawId),
        id: b64decode(assertionResponseMsg.body.id),
        response: {
            clientDataJSON: b64decode(assertionResponseMsg.body.response.clientDataJSON),
            authenticatorData: b64decode(assertionResponseMsg.body.response.authenticatorData),
            signature: b64decode(assertionResponseMsg.body.response.signature),
            userHandle: b64decode(assertionResponseMsg.body.response.userHandle)
        }
    };

    var assnPublicKey =
        "-----BEGIN PUBLIC KEY-----\n" +
        "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAERez9aO2wBAWO54MuGbEqSdWahSnG\n" +
        "MAg35BCNkaE3j8Q+O/ZhhKqTeIKm7El70EG6ejt4sg1ZaoQ5ELg8k3ywTg==\n" +
        "-----END PUBLIC KEY-----\n";

    var lib = {
        makeCredentialAttestationNoneResponse,
        makeCredentialAttestationU2fResponse,
        assertionResponse,
        assnPublicKey
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



    var certs = {
        yubiKeyAttestation,
        yubicoRoot
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
        naked,
        certs
    };
})); /* end AMD module */
