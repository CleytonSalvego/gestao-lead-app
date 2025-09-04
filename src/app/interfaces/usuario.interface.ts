
export interface UsuarioItemListInterface {
    numero: string,
    nome: string,
    senha: string,
    tecnico: boolean,
    admin: boolean,
    ativo: boolean
}

export interface InputUsuarioInterface {
    numero: string,
    name: string,
    email: string,
    password: string,
    tecnico: boolean,
    admin: boolean,
    ativo: boolean
}

export interface UsuarioEditarListInterface {
    id: number,
    numero: string,
    name: string,
    tecnico: boolean,
    admin: boolean,
    ativo: boolean,
    created_at?: string
}