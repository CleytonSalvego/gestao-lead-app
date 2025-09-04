import { Injectable } from "@angular/core";
import { StorageRepository } from "../repositories/storage-repository";
import { ControllService } from "./controller.service";
import { InputUsuarioInterface, UsuarioEditarListInterface, UsuarioItemListInterface } from "../interfaces/usuario.interface";
import { httpAuthProvider } from "../providers";

@Injectable({ providedIn: 'root' })
export class UsuarioService {

  

    constructor(
        private storageRepository: StorageRepository,
        private controllerService: ControllService,
    ) { }


    async mapUsuario(input: UsuarioItemListInterface): Promise<InputUsuarioInterface>{
        var item: InputUsuarioInterface = {
            name: input.nome,
            email: input.nome,
            numero: input.numero,
            password: input.senha,
            tecnico: input.tecnico,
            admin: input.admin,
            ativo: input.ativo
        }

        return item;

    }

    async getList() {

        try {
            const { data, status } = await httpAuthProvider.get(`users/getAll`);
            if (status != 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }
    }

    async getCombo() {

        try {
            const { data, status } = await httpAuthProvider.get(`users/getCombo`);
            if (status != 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }
    }

    async insertData(input: InputUsuarioInterface) {
        
        try {
            const { data, status } = await httpAuthProvider.post("users/create", input);
            if (status !== 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }
        
    }

    async updateData(input: UsuarioEditarListInterface) {

        try {
            const { data, status } = await httpAuthProvider.put(`users/update/${input.id}`, input);
            if (status !== 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }

    }

    async updateAtivo(codigo: number, ativo: boolean = true) {
        
        try {
            const { data, status } = await httpAuthProvider.put(`users/updateAtivo/${codigo}`, {ativo:ativo});
            if (status !== 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }

    }

     async remove(codigo: number, ativo: boolean = true) {
        
        try {
            const { data, status } = await httpAuthProvider.delete(`users/delete/${codigo}`);
            if (status !== 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }

    }

}