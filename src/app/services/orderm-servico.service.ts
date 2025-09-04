import { Injectable } from "@angular/core";
import { StorageRepository } from "../repositories/storage-repository";
import { ControllService } from "./controller.service";
import { ApontamentoArmadilhaRespostaInterface, CapituraInterface, OcorrenciaInterface, OrdemServicoInsertInterface, OrdemServicoItemListInterface } from "../interfaces/ordem-servico.interface";
import { httpAuthProvider } from "../providers";

@Injectable({ providedIn: 'root' })
export class OrdemServicoService {

    constructor(
        private storageRepository: StorageRepository,
        private controllerService: ControllService,
    ) { }


    async getList() {
        try {
            const { data, status } = await httpAuthProvider.get(`ordemServico/getAll`);
            if (status != 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }
    }

    async getListByToday(today: string) {
        try {
            const { data, status } = await httpAuthProvider.get(`ordemServico/getByToday/${today}`);
            if (status != 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }
    }

    async insertData(input: OrdemServicoInsertInterface) {
    
            try {
                const { data, status } = await httpAuthProvider.post("ordemServico/create", input);
                if (status !== 200) return {status: false};
                return data;
            } catch (error) {
                return {status: false};
            }
    
            
        }
    
    async updateData(input: OrdemServicoInsertInterface) {

        try {
            const { data, status } = await httpAuthProvider.put(`ordemServico/update/${input.id}`, input);
        if (status !== 200) return {status: false};
        return data;
        } catch (error) {
            return {status: false};
        }
        
    }

    async updateStatus(id_ordem_servico: number, status_os: number, descricao_status: string) {

        try {
            const { data, status } = await httpAuthProvider.put(`ordemServico/updateStatus/${id_ordem_servico}/${status_os}/${descricao_status}`);
        if (status !== 200) return {status: false};
        return data;
        } catch (error) {
            return {status: false};
        }
        
    }

    async enviarApontamentoEmail(id_ordem_servico: number) {

        try {
            const { data, status } = await  httpAuthProvider.post(`documento/create`, {codigo: id_ordem_servico});
            if (status !== 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }
        
    }

    async remove(codigo: number) {
        try {
            const { data, status } = await httpAuthProvider.delete(`ordemServico/delete/${codigo}`);
            if (status != 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }
    }

    async insertArmadilhas(id_ordem_servico: number, id_empresa: number) {

        try {
            const { data, status } = await httpAuthProvider.put(`ordemServico/insertArmadilha/${id_ordem_servico}/${id_empresa}`);
        if (status !== 200) return {status: false};
        return data;
        } catch (error) {
            return {status: false};
        }
        
    }

    async getListArmadilha(codigo_ordem_servico: number) {
        try {
            const { data, status } = await httpAuthProvider.get(`ordemServicoArmadilhaGrupo/getById/${codigo_ordem_servico}`);
            if (status != 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }
    }

    async getListArmadilhaItens(codigo_grupo: number, codigo_ordem_servico: number) {
        try {
            const { data, status } = await httpAuthProvider.get(`ordemServicoArmadilhaGrupoItem/getById/${codigo_grupo}/${codigo_ordem_servico}`);
            if (status != 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }
    }

    async getListMapas(codigo_ordem_servico: number) {
        try {
            const { data, status } = await httpAuthProvider.get(`ordemServicoMapa/getById/${codigo_ordem_servico}`);
            if (status != 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }
    }

    async getListOcorrencias(codigo_ordem_servico: number) {
        try {
            const { data, status } = await httpAuthProvider.get(`ordemServicoOcorrencia/getById/${codigo_ordem_servico}`);
            if (status != 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }
    }

    async insertOcorrencia(input: OcorrenciaInterface) {

        try {
            const { data, status } = await httpAuthProvider.post(`ordemServicoOcorrencia/create`, input);
        if (status !== 200) return {status: false};
        return data;
        } catch (error) {
            return {status: false};
        }
        
    }

    async removeOcorrencia(codigo: number) {
        try {
            const { data, status } = await httpAuthProvider.delete(`ordemServicoOcorrencia/delete/${codigo}`);
            if (status != 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }
    }

    async insertApontamento(input: ApontamentoArmadilhaRespostaInterface) {
        try {
            const { data, status } = await httpAuthProvider.post(`ordemServicoApontamento/create`, input);
        if (status !== 200) return {status: false};
        return data;
        } catch (error) {
            return {status: false};
        }
        
    }

    async insertApontamentoCaptura(input: CapituraInterface) {

        try {
            const { data, status } = await httpAuthProvider.post(`ordemServicoApontamentoCaptura/create`, input);
        if (status !== 200) return {status: false};
        return data;
        } catch (error) {
            return {status: false};
        }
        
    }

    async getListCaptura(id_ordem_servico: number, id_apontamento:number) {
        try {
            const { data, status } = await httpAuthProvider.get(`ordemServicoApontamentoCaptura/getById/${id_ordem_servico}/${id_apontamento}`);
            if (status != 200) return {status: false};
            return data;
        } catch (error) {
            return {status: false};
        }
    }

}