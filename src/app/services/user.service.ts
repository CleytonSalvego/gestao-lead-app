import { Injectable } from "@angular/core";
import { StorageRepository } from "../repositories/storage-repository";
import { ControllService } from "./controller.service";

@Injectable({ providedIn: 'root' })
export class UserService {

    constructor(
        private storageRepository: StorageRepository,
        private controllerService: ControllService,
    ) { }

    async getUser() {
        const data = await this.storageRepository.get("user");
        if (!data) return null
        return data;
    }

    async insertUser(data: any) {

        try {
            this.storageRepository.insert("user", data);
        } catch (error: any) {
            this.controllerService.alert("", "Erro", error.Message, null)
        }
    }

    async logout() {
        this.storageRepository.delete(["user", "token", "student", "unitData"]);
        return true;
    }

    async getCurrentTheme() {
        const data = await this.storageRepository.get("theme");
        if (!data) return null
        return data;
    }

    async insertCurrentTheme(data: any) {
        this.storageRepository.insert("theme", data);
    }

}