import { EventEmitter, Injectable } from "@angular/core";
import { LoginInterface, RecoveryPasswordInterface, ResetSenhaInterface } from "../interfaces/login.interface";
import { ControllService } from "./controller.service";
import { httpAuthProvider } from "../providers";
import { TokenInterface } from "../interfaces/auth.interface";

@Injectable({ providedIn: 'root' })
export class AuthService {

    emitLoginUser = new EventEmitter<any>();

    constructor(
        private controllerService: ControllService
    ) { }

    async setUserLogged(admin: boolean) {
        this.emitLoginUser.emit(admin);
    };

    async login(login: LoginInterface) {
        //const { data, status } = await httpAuthProvider.get(`login?email=${login.email}&senha=${login.password}`);
        const { data, status } = await httpAuthProvider.post("login", login);
        if (status !== 200) return null;
        await this.setUserLogged(data.data.admin);
        return data;
    }

    async refreshToken() {
        var refreshToken = { RefreshToken: this.getRefreshToken() };
        if (!refreshToken) return null;
        return await httpAuthProvider.post("refresh-token", refreshToken);
    }

    async insertToken(data: any) {
        var token: TokenInterface = {
            token: data.accessToken,
            refreshToken: data.refreshToken,
            expirationToken: this.setExpirationDateToken(data.expiresIn),
            expirationRefreshToken: this.setExpirationDateRefreshToken(),
        }
        localStorage.setItem("token", JSON.stringify(token));
    }

    getToken() {
        if (!this.isValidToken()) return null;
        const data = localStorage.getItem("token");
        if (!data) return null
        var result = JSON.parse(data);
        if (!result.token) return null;
        return result.token;
    }

    getRefreshToken() {
        if (!this.isValidRefreshToken()) return null;
        const data = localStorage.getItem("token");
        if (!data) return null
        var result = JSON.parse(data);
        if (!result.refreshToken) return null;
        return result.refreshToken;
    }

    private setExpirationDateToken(expiration: number) {
        var expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + (((expiration / 60) / 60)));
        return expirationDate;
    }

    private setExpirationDateRefreshToken() {
        var expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 8);
        return expirationDate;
    }

    isValidToken() {
        const data = localStorage.getItem("token");
        if (!data) return false;
        var result = JSON.parse(data);
        if (!result.token) return false;
        if (!result.expirationToken) return false;
        var today = new Date(new Date().toUTCString());
        var expiration = new Date(result.expirationToken);
        return today > expiration ? false : true;
    }

    isValidRefreshToken() {
        const data = localStorage.getItem("token");
        if (!data) return false;
        var result = JSON.parse(data);
        if (!result.refreshToken) return false;
        if (!result.expirationRefreshToken) return false;
        var today = new Date(new Date().toUTCString());
        var expiration = new Date(result.expirationRefreshToken);
        return today > expiration ? false : true;
    }

    isLoggedIn() {
        const user = localStorage.getItem('user');
        return user !== null;
    }

    async recoveryPassword(email: RecoveryPasswordInterface) {
        try {
            const { data, status } = await httpAuthProvider.post("v1/account/reset-password", email);
            if (status != 200) return null;
            return data;
        } catch (error) {
            return null;
        }
    }

    async resetPassword(reset: ResetSenhaInterface) {
        try {
            const { data, status } = await httpAuthProvider.put(`UpdatePassword`,reset);
            if (status != 200) return null;
            return data;
        } catch (error) {
            return null;
        }
    }
}