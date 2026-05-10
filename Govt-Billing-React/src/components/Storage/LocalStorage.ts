import { Preferences } from "@capacitor/preferences";

export class File {
  created: string;
  modified: string;
  name: string;
  content: string;
  billType: number;

  constructor(
    created: string,
    modified: string,
    content: string,
    name: string,
    billType: number
  ) {
    this.created = created;
    this.modified = modified;
    this.content = content;
    this.name = name;
    this.billType = billType;
  }
}

export class Local {
  _saveFile = async (file: File): Promise<void> => {
    const data = {
      created: file.created,
      modified: file.modified,
      content: file.content,
      name: file.name,
      billType: file.billType,
    };
    await Preferences.set({
      key: file.name,
      value: JSON.stringify(data),
    });
  };

  /**
   * Reads a stored FileObject by key.
   *
   * @returns The parsed FileObject, or `null` if the key does not exist
   *          or the stored value cannot be parsed. Callers MUST `await`
   *          this method before accessing any properties on the result.
   */
  _getFile = async (name: string): Promise<File | null> => {
    try {
      const rawData = await Preferences.get({ key: name });
      if (rawData.value === null || rawData.value === undefined) {
        return null;
      }
      return JSON.parse(rawData.value) as File;
    } catch (err) {
      console.error(`[LocalStorage] _getFile failed for key "${name}":`, err);
      return null;
    }
  };

  _getAllFiles = async (): Promise<Record<string, string>> => {
    const arr: Record<string, string> = {};
    const { keys } = await Preferences.keys();
    for (let i = 0; i < keys.length; i++) {
      const fname = keys[i];
      const data = await this._getFile(fname);
      if (data !== null) {
        arr[fname] = data.modified;
      }
    }
    return arr;
  };

  _deleteFile = async (name: string): Promise<void> => {
    await Preferences.remove({ key: name });
  };

  _checkKey = async (key: string): Promise<boolean> => {
    const { keys } = await Preferences.keys();
    return keys.includes(key);
  };
}