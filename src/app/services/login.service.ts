import { Injectable } from "@angular/core";
import { LoginInterface, ResetSenhaInterface } from "../interfaces/login.interface";
import { UserInterface } from "../interfaces/user.interface";
import { AuthService } from "./auth.service";
import { ControllService } from "./controller.service";
import { UserService } from "./user.service";
import { ValidatorService } from "./validator.service";
import { UserDataInterface } from "../interfaces/auth.interface";

@Injectable({ providedIn: 'root' })
export class LoginService {

    constructor(
        private controllerService: ControllService,
        private validatorService: ValidatorService,
        private userService: UserService,
        private authService: AuthService,
    ) { }

    async login(email: string, senha: string) {

        if (this.validateLogin(email, senha) == false)
            return false;

        var login: LoginInterface = { email: email, password: senha };
        var responseLogin = await this.authService.login(login);

        // // var responseLogin:UserDataInterface = {
        // //     success: true,
        // //     usuarioId: 1,
        // //     usuario: "Teste",
        // //     admin: true,
        // //     ativo: true,
        // // };
        

        if (!responseLogin.status)
            return false;

        var user: UserInterface = {
            usuarioId: responseLogin.data.id,
            usuario: responseLogin.data.name,
            admin: responseLogin.data.admin,
            tecnico: responseLogin.data.tecnico,
            ativo: responseLogin.data.ativo
        }

        this.userService.insertUser(user);

        //if (user.usuarioId != -1) return this.controllerService.navigateHome();
        if (user.usuarioId != -1) return this.controllerService.navigate("ordem-servico-list");

        return this.controllerService.navigateDashboard();
    }


    userLogged() {
        //return this.controllerService.navigateHome();
        return this.controllerService.navigate("ordem-servico-list");
    }

    validateLogin(email: string, senha: string): Boolean {
        if (this.validatorService.isEmpty(email) == true || this.validatorService.isEmpty(senha) == true) return false;

        return true;
    }

    async resetPassword(reset:ResetSenhaInterface) {
        var response = await this.authService.resetPassword(reset);
        return response.success;
    }
}