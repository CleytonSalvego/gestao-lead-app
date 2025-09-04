import { Injectable } from "@angular/core";
import { StorageRepository } from "../repositories/storage-repository";
import { ControllService } from "./controller.service";
import { EmpresaInsertArmadilhaGrupoInterface, EmpresaInsertArmadilhaGrupoItemInterface, EmpresaItemListInterface, EmpresaMapaItemListInterface } from "../interfaces/empresa.interface";
import { httpAuthProvider } from "../providers";

@Injectable({ providedIn: 'root' })
export class EmpresaService {

    constructor(
        private storageRepository: StorageRepository,
        private controllerService: ControllService,
    ) { }


    async getList() {
        try {
            const { data, status } = await httpAuthProvider.get(`empresas/getAll`);
            if (status != 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }
    }

    async getListByCodigo(codigo: number) {
        try {
            const { data, status } = await httpAuthProvider.get(`empresas/getById/${codigo}`);
            if (status != 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }
    }

    async getCombo() {
        try {
            const { data, status } = await httpAuthProvider.get(`empresas/getCombo`);
            if (status != 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }
    }

    async insertData(input: EmpresaItemListInterface) {

        try {
            const { data, status } = await httpAuthProvider.post("empresas/create", input);
            if (status !== 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }

        
    }

    async updateData(input: EmpresaItemListInterface) {

        try {
            const { data, status } = await httpAuthProvider.put(`empresas/update/${input.id}`, input);
        if (status !== 200) return {status: false};
        return data;
        } catch (error) {
            return {status: false};
        }
        
    }

    async updateAtivo(codigo: number|undefined, ativo: boolean = true) {

        try {
            const { data, status } = await httpAuthProvider.put(`empresas/updateAtivo/${codigo}`, {ativo:ativo});
            if (status !== 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }
       
    }

     async remove(codigo: number|undefined) {
        try {
            const { data, status } = await httpAuthProvider.delete(`empresas/delete/${codigo}`);
            if (status != 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }
    }

    async insertArmadilhaGrupo(input: EmpresaInsertArmadilhaGrupoInterface) {

        try {
            const { data, status } = await httpAuthProvider.post("empresasArmadilhaGrupo/create", input);
            if (status !== 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }

        
    }

    async insertArmadilhaGrupoItem(input: EmpresaInsertArmadilhaGrupoItemInterface) {

        try {
            const { data, status } = await httpAuthProvider.post("empresasArmadilhaGrupoItem/create", input);
            if (status !== 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }

        
    }

    async getListArmadilha(codigo_empresa: number) {
        try {
            const { data, status } = await httpAuthProvider.get(`empresasArmadilhaGrupo/getById/${codigo_empresa}`);
            if (status != 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }
    }

    async getListArmadilhaItens(codigo_grupo: number, codigo_empresa: number) {
        try {
            const { data, status } = await httpAuthProvider.get(`empresasArmadilhaGrupoItem/getById/${codigo_grupo}/${codigo_empresa}`);
            if (status != 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }
    }

    async removeArmadilhaGrupoItem(codigo: number) {
        try {
            const { data, status } = await httpAuthProvider.delete(`empresasArmadilhaGrupoItem/delete/${codigo}`);
            if (status != 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }
    }

    async insertMapas(input: EmpresaMapaItemListInterface) {

        try {
            const { data, status } = await httpAuthProvider.post("empresasMapa/create", input);
            if (status !== 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }

        
    }

    async getListMapas(codigo_empresa: number) {
        try {
            const { data, status } = await httpAuthProvider.get(`empresasMapa/getById/${codigo_empresa}`);
            if (status != 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }
    }


    async removeMapa(codigo: number) {
        try {
            const { data, status } = await httpAuthProvider.delete(`empresasMapa/delete/${codigo}`);
            if (status != 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }
    }


}