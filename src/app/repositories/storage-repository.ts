import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class StorageRepository {

    constructor() { }

    async insert(key: string, data: any) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    async get(key: string) {
        const data = localStorage.getItem(key);
        if (!data) return null
        return JSON.parse(data);
    }

    delete(keys: string[]) {
        keys.forEach(k => localStorage.removeItem(k));
    }

}