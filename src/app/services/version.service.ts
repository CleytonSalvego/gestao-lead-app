import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class VersionService {

    constructor() { }

    getVersion(){
        return '1.13';
    };
}