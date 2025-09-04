import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class ValidatorService {

    constructor() { }

    isEmpty(variable: any) {
        switch (variable) {
            case "":
            case 0:
            case "0":
            case null:
            case false:
            case undefined:
                return true;
            default:
                return false;
        }
    }

    isNumber = (val: any) => typeof val === "number" && val === val;

}
