import { EmpresaMapaItemListInterface } from "./empresa.interface"

export interface OrdemServicoItemListInterface {
    id?: number,
    data: string,
    empresa: number,
    empresaDescricao: string,
    tecnico: number
    tecnicoDescricao: string,
    local:string,
    status: number,
    statusDescricao: string,
    armadilhas: ApontamentoArmadilhaListInterface[],
    ocorrencias: OcorrenciaInterface[],
    mapas: EmpresaMapaItemListInterface[]
}

export interface ApontamentoArmadilhaListInterface {
    ordem: number,
    tipo: string,
    descricao: string,
    armadilhas: ApontamentoArmadilhaRespostaInterface[]
}

export interface ApontamentoArmadilhaRespostaInterface{
    id?: number,
    id_ordem_servico?: number,
    id_grupo: number,
    id_armadilha?: number,
    id_apontamento?: number,
    ordem: number,
    tipo: string,
    descricao: string,
    status: string,
    status_armadilha: string | string[] | null,
    quantidade: number | null,
    capturas: CapituraInterface[] | null,
    ocorrencia: string | null,
    base64: string | null
    
}

export interface CapituraInterface{
    id?: number,
    id_ordem_servico?: number,
    id_apontamento: number,
    codigo: string,
    descricao: string,
    quantidade: number
}

export interface OcorrenciaInterface{
    id?: number,
    id_ordem_servico?: number,
    ordem: number,
    descricao: string,
    base64: string
}

export interface OrdemServicoInsertInterface {
    id?:number,
    data : string | Date,
    hora : string,
    id_empresa:number,
    descricao_empresa: string,
    id_tecnico: number,
    descricao_tecnico: string,
    local?: string,
    status: number,
    descricao_status: string,
    id_acompanhante?: number,
    descricao_acompanhante?: string,
}


export interface OrdemServicoInsertArmadilhaGrupoInterface {
    id_ordem_servico?:number,
    ordem: number,
    tipo: string,
    descricao: string,
}

export interface OrdemServicoInsertArmadilhaGrupoItemInterface {
    id_ordem_servico?:number,
    id_grupo?: number,
    ordem: number,
    tipo: string,
    descricao: string,
    status: string
}
