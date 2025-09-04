
export interface EmpresaItemListInterface {
    id?: number,
    cnpj: string,
    razao_social: string,
    telefone: string
    email: string,
    responsavel:string,
    logradouro: string,
    numero:string,
    bairro: string,
    complemento: string,
    cidade: number,
    cidadeDescricao: string,
    estado: number, 
    estadoDescricao:string,
    armadilhas: EmpresaArmadilhaListInterface[],
    mapas: EmpresaMapaItemListInterface[],
    ativo: boolean
}

export interface EmpresaArmadilhaListInterface {
    id?: number,
    ordem: number,
    tipo: string,
    descricao: string,
    armadilhas: EmpresaArmadilhaItemListInterface[]
}

export interface EmpresaArmadilhaItemListInterface {
    id?:number;
    id_grupo?: number,
    ordem: number,
    tipo: string,
    descricao: string,
    status: string
}

export interface EmpresaMapaItemListInterface {
    id?:number;
    id_empresa?:number,
    ordem: number,
    descricao: string,
    base64?: string,
    fileName?: string,
    filePath?: string
}


export interface EmpresaInsertArmadilhaGrupoInterface {
    id_empresa?:number,
    ordem: number,
    tipo: string,
    descricao: string,
}

export interface EmpresaInsertArmadilhaGrupoItemInterface {
    id_empresa?:number,
    id_grupo?: number,
    ordem: number,
    tipo: string,
    descricao: string,
    status: string
}