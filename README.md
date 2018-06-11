A set of helper functions and data sets for testing FIDO 2.0, WebAuthn, and CTAP.

## Installation

**node.js**
``` bash
npm install fido2-helpers
```

**html**
``` html
<script src="https://cdn.rawgit.com/apowers313/fido2-helpers/69af3a4e/fido2-helpers.js"></script>
```

## Usage

`fido2-helpers.js` is a [Universal Module Definition (UMD)](https://github.com/umdjs/umd) that should work under browser and node. It has been used extensively with node projects such as [fido2-lib](https://github.com/apowers313/fido2-lib) and [webauthn-simple-app](https://github.com/apowers313/webauthn-simple-app).

The UMD returns a structure that looks like:

``` js
{
    functions: {
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
    },
    server: {
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
        successServerResponse,
        errorServerResponse
    },
    lib: {
        makeCredentialAttestationNoneResponse,
        makeCredentialAttestationU2fResponse,
        makeCredentialAttestationHypersecuU2fResponse,
        makeCredentialAttestationPackedResponse,
        makeCredentialAttestationTpmResponse,
        assertionResponse,
        assertionResponseWindowsHello,
        assnPublicKey,
        assnPublicKeyWindowsHello,
    },
    certs: {
        yubiKeyAttestation,
        yubicoRoot,
        feitianFido2,
        tpmAttestation
    },
    mds: {
        mds1TocJwt,
        mds2TocJwt,
        mds2Entry,
        mdsRootCert,
        mdsRootCrl,
        ca1Crl,
        mdsIntermediateCert,
        mdsSigningCert
    }
}
```

Here is a quick description of each section:
* functions: helper functions that may be useful in transforming, checking, or printing values for testing
* server: raw messages that are sent to or from the server in JSON format with base64url encoding
* lib: mostly the same messages as server, but have been decoded into ArrayBuffers where applicable
* certs: useful x.509 certificates for testing ASN.1 parsing and x.509 functionality
* mds: example messages and certificates for the FIDO Metadata Service (MDS)
