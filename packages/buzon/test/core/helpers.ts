export const makeFile = (name: string, type: string, size = 10, lastModified = 1): File => new File([new Uint8Array(size)], name, { type, lastModified });
