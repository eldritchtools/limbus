"use client";
import pako from "pako";

function base64ToUint8Array(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

function uint8ArrayToBase64(bytes) {
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decodeDoubleBase64Gzip(encoded) {
    const compressed = base64ToUint8Array(encoded);
    const decompressed = pako.ungzip(compressed);
    const innerBase64 = new TextDecoder().decode(decompressed);
    return base64ToUint8Array(innerBase64);
}

function encodeDoubleBase64Gzip(data) {
    const innerBase64 = uint8ArrayToBase64(data);
    const textBytes = new TextEncoder().encode(innerBase64);
    const compressed = pako.gzip(textBytes, {level: 9, mtime: 0, os: 3});
    compressed[8] = 0x00;
    compressed[9] = 0x0a;
    return uint8ArrayToBase64(compressed);
}

function bytesToBits(bytes) {
    return Array.from(bytes)
        .map(b => b.toString(2).padStart(8, "0"))
        .join("");
}

function bitsToBytes(bits) {
  const byteCount = bits.length / 8;
  const bytes = new Uint8Array(byteCount);

  for (let i = 0; i < byteCount; i++) {
    const byteBits = bits.slice(i * 8, i * 8 + 8);
    bytes[i] = parseInt(byteBits, 2);
  }

  return bytes;
}

function idsToString(type, sinnerId, id) {
    return `${type}${sinnerId.toString().padStart(2, "0")}${id.toString().padStart(2, "0")}`;
}

export function parseTeamCode(teamCode) {
    try {
        const bits = bytesToBits(decodeDoubleBase64Gzip(teamCode));
        if (bits.length !== 560) return null;
        let str = bits.slice(1);
        const orderPos = new Array(12).fill(null);
        const identities = [];
        const egos = [];
        for (let i = 0; i < 12; i++) {
            identities.push(idsToString(1, i + 1, parseInt(str.slice(0, 7), 2)));
            orderPos[parseInt(str.slice(7, 11), 2) - 1] = i + 1;
            egos.push([]);
            for (let j = 11; j < 46; j += 7) {
                const id = parseInt(str.slice(j, j + 7), 2);
                if (id !== 0) egos[i].push(idsToString(2, i + 1, id));
                else egos[i].push(null);
            }
            str = str.slice(46);
        }

        return {
            deploymentOrder: orderPos.filter(x => x !== null),
            identities: identities,
            egos: egos
        };
    } catch (err) {
        return null;
    }
}

function intToBinary(num, places) {
    return num.toString(2).padStart(places, "0");
}

function stripId(id) {
    return parseInt(`${id}`.slice(3));
}

export function constructTeamCode(identityIds, egoIds, deploymentOrder) {
    const deployment = new Array(12).fill(0);
    deploymentOrder.forEach((sinnerId, index) => deployment[sinnerId - 1] = index + 1);
    let str = "0";
    for (let i = 0; i < 12; i++) {
        str += intToBinary(identityIds[i] ? stripId(identityIds[i]) : 1, 7);
        str += intToBinary(deployment[i], 4);
        for (let j = 0; j < 5; j++) {
            if (egoIds[i][j])
                str += intToBinary(stripId(egoIds[i][j]), 7);
            else {
                if (j === 0) {
                    str += intToBinary(1, 7);
                } else {
                    str += intToBinary(0, 7);
                }
            }
        }
    }
    str = str.padEnd(560, "0");
    return encodeDoubleBase64Gzip(bitsToBytes(str));
}
