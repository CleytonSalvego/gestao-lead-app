export interface TokenInterface {
    token: string;
    refreshToken: string;
    expirationToken: Date;
    expirationRefreshToken: Date;
}


export interface PushNotificationTokenInterface{
    codigoEmpresa: number,
    codigoUnidade: number,
    codigoUsuario: number,
    token: string
}

export interface LoginInterface{
    email: string,
    senha: string
}

export interface UserDataInterface{
    success: boolean,
    usuarioId: number,
    usuario: string,
    admin: boolean,
    ativo: boolean
}