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
        // Remove todas as informações relacionadas ao login automático
        this.storageRepository.delete(["user", "token", "student", "unitData", "auth_token", "current_user"]);

        // Remove também do localStorage (usado pelo AuthService)
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('remember_me');

        // Remove do sessionStorage também
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('current_user');
        sessionStorage.clear();

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