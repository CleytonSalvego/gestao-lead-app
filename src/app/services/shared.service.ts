import { Injectable } from "@angular/core";
import { StorageRepository } from "../repositories/storage-repository";
import { UserInterface } from "../interfaces/user.interface";
import { HttpClient } from '@angular/common/http';
import { CidadesInterface, EstadosInterface } from "../interfaces/shared.interface";

@Injectable({ providedIn: 'root' })
export class SharedService {

    constructor(
        private storageRepository: StorageRepository,
        protected httpClient: HttpClient
    ) { }

    showSideMenu() {
        const elemento = document.getElementById("menuHeader");
        if (elemento != null && elemento != undefined) {
            elemento.style.display = 'block';
        }
    }

    adjustTop() {
    const elemento = document.getElementById("router");
    if (elemento != null && elemento != undefined) {
        elemento.style.top = '0px';
    }
    }

    hiddenSideMenu() {

    const elemento = document.getElementById("sideMenuList");
    if (elemento != null && elemento != undefined) {
        elemento.style.display = 'none';
    }

    const elementoMenuButton = document.getElementById("menuButton");
    if (elementoMenuButton != null && elementoMenuButton != undefined) {
        elementoMenuButton.style.display = 'none';
    }
    }

    hiddenHeader() {
        const elemento = document.getElementById("menuHeader");
        if (elemento != null && elemento != undefined) {
        elemento.style.display = 'none';
        }
    }

    setTitle(title:string) {
        const elemento = document.getElementById("title");
        if (elemento != null && elemento != undefined) {
            elemento.textContent = this.capitalizeString(title);
        }
        }

    userFormat(data: any): UserInterface {

        const payload: UserInterface = {
            usuarioId: data.usuarioId,
            usuario: data.usuario,
            admin: data.admin,
            tecnico: data.tecnico,
            ativo: data.ativo
        };

        return payload;
    }

    private padTo2Digits(num: number) {
        return num.toString().padStart(2, '0');
    }

    formatDate(date: Date) {
        return (
            [
                this.padTo2Digits(date.getDate()),
                this.padTo2Digits(date.getMonth() + 1),
                date.getFullYear(),
            ].join('/') +
            ' ' +
            [
                this.padTo2Digits(date.getHours()),
                this.padTo2Digits(date.getMinutes()),
                // this.padTo2Digits(date.getSeconds()),
            ].join(':')
        );
    }

    formatDateCalendar(date: Date) {
        return (
            [
                
                
                date.getFullYear(),
                this.padTo2Digits(date.getMonth() + 1),
                this.padTo2Digits(date.getDate())
            ].join('-') +
            'T' +
            [
                this.padTo2Digits(date.getHours()),
                this.padTo2Digits(date.getMinutes()),
                this.padTo2Digits(date.getSeconds()),
            ].join(':')
        );
    }

    formatJustDate(date: Date) {
        return (
            [
                this.padTo2Digits(date.getDate()),
                this.padTo2Digits(date.getMonth() + 1),
                date.getFullYear(),
            ].join('/')
        );
    }

    formatFilterDate(date: string) {

        var result: any = [];
        if (date.includes('T')) {
            result = date.split('T');
            return result[0].replaceAll('-', '/');
        }

        if (date.includes('/')) {
            result = date.split('/');
            var day = result[0];
            var month = result[1];
            var year = result[2];
            return ([year, month, day].join('/'));
        }
    }

    formatFilterDateListagem(date: string) {

        var result: any = [];
        if (date.includes('T')) {
            result = date.split('T');
            var dateOriginal = result[0].replaceAll('-', '/').toString();
            if (dateOriginal.includes('/')) {
                result = dateOriginal.split('/');
                var year = result[0];
                var month = result[1];
                var day = result[2];

                return ([day, month, year].join('/'));
            }
        }

        if (date.includes(' ')) {
            result = date.split(' ');
            var dateOriginal = result[0].replaceAll('-', '/').toString();
            if (dateOriginal.includes('/')) {
                result = dateOriginal.split('/');
                var year = result[0];
                var month = result[1];
                var day = result[2];

                return ([day, month, year].join('/'));
            }
        }

        // if (date.includes('/')) {
        //     result = date.split('/');
        //     var day = result[0];
        //     var month = result[1];
        //     var year = result[2];
        //     return ([day, month, year].join('/'));
        // }

        return new Date().toLocaleDateString();
    }

    formatFilterDateCalendar(date: string) {

        var result: any = [];
        if (date.includes('T')) {
            result = date.split('T');
            var dateOriginal = result[0].replaceAll('-', '/').toString();
            if (dateOriginal.includes('/')) {
                result = dateOriginal.split('/');
                var year = result[0];
                var month = result[1];
                var day = result[2];

                return ([year , month, day].join('-'));
            }
        }

        if (date.includes(' ')) {
            result = date.split(' ');
            var dateOriginal = result[0].replaceAll('-', '/').toString();
            if (dateOriginal.includes('/')) {
                result = dateOriginal.split('/');
                var year = result[0];
                var month = result[1];
                var day = result[2];

                return ([year , month, day].join('-'));
            }
        }
        
        return new Date();
    }

    formatFilterDateCalendarInsert(date: string) {

        var newDate = "";
        var result: any = [];
        if (date.includes('T')) {
            result = date.split('T');
            var dateOriginal = result[0].replaceAll('-', '/').toString();
            if (dateOriginal.includes('/')) {
                result = dateOriginal.split('/');
                var year = result[0];
                var month = result[1];
                var day = result[2];

                newDate = ([year , month, day].join('-'));
                return `${newDate} 00:00:00`;
            }
        }

        if (date.includes(' ')) {
            result = date.split(' ');
            var dateOriginal = result[0].replaceAll('-', '/').toString();
            if (dateOriginal.includes('/')) {
                result = dateOriginal.split('/');
                var year = result[0];
                var month = result[1];
                var day = result[2];

                newDate = ([year , month, day].join('-'));
                return `${newDate} 00:00:00`;
            }
        }
        
        return new Date();
    }

    formatFilterDate2(date: string) {

        var result: any = [];
        if (date.includes('T')) {
            result = date.split('T');
            return result[0];
        }

        if (date.includes('/')) {
            result = date.split('/');
            var day = result[0];
            var month = result[1];
            var year = result[2];
            return ([year, month, day].join('-'));
        }
    }

    formatJustDate2(date: string) {

        var result: any = [];
        if (date.includes(' ')) {
            result = date.split(' ');
            return result[0];
        }
    }

    formatJustDateHour(date: Date) {
        return (
            [
                this.padTo2Digits(date.getHours()),
                this.padTo2Digits(date.getMinutes()),
            ].join(':')
        );
    }

    formatJustDateHour2(date: Date) {
        return (
            [
                this.padTo2Digits(date.getHours()),
                this.padTo2Digits(date.getMinutes()),
            ].join('h')
        );
    }

    formatJustDateHour3(date: string) {
        if (this.isEmpty(date)) return '00h00';
        return date.substring(10,16).replace(":","h");
    }

    formatTimer(hour: number, minute: number, second: number) {
        var hourString = hour.toString().length == 1 ? `0${hour}` : hour;
        var minuteString = minute.toString().length == 1 ? `0${minute}` : minute;
        var secondString = second.toString().length == 1 ? `0${second}` : second;
        return `${hourString}:${minuteString}:${secondString}`;

    }

    getTime(date?: Date) {
        return date != null ? date.getTime() : 0;
    }

    addDays(date: Date, days: number): Date {
        date.setDate(date.getDate() + days);
        return date;
    }

    addMonth(date: Date, month: number): Date {
        date.setDate(date.getMonth() + month);
        return date;
    }

    getCurrentTimer(dataInicio: string): any {

        const dateInit = new Date(dataInicio);
        const dateFinal = new Date();
        const difference = dateFinal.getTime() - dateInit.getTime();

        var result = {
            timer: this.convertMileSecondsToTime(difference),
            hour: this.convertMileSecondsToHour(difference),
            minute: this.convertMileSecondsToMinute(difference),
            seconds: this.convertMileSecondsToSeconds(difference)
        }
        return result;

    }

    convertMileSecondsToTime(milliseconds: number) {
        let seconds = Math.floor(milliseconds / 1000);
        let minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        seconds = seconds % 60;
        minutes = minutes % 60;
        return `${this.padTo2Digits(hours)}:${this.padTo2Digits(minutes)}:${this.padTo2Digits(seconds)}`;
    }

    convertMileSecondsToHour(milliseconds: number): number {
        let seconds = Math.floor(milliseconds / 1000);
        let minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        seconds = seconds % 60;
        minutes = minutes % 60;
        return hours;
    }

    convertMileSecondsToMinute(milliseconds: number): number {
        let seconds = Math.floor(milliseconds / 1000);
        let minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        seconds = seconds % 60;
        minutes = minutes % 60;
        return minutes;
    }

    convertMileSecondsToSeconds(milliseconds: number): number {
        let seconds = Math.floor(milliseconds / 1000);
        let minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        seconds = seconds % 60;
        minutes = minutes % 60;
        return seconds;
    }

    isEmpty(value: any) {
        return (value === undefined ||
            value == null ||
            value.length == 0) ||
            value == "" ? true : false;
    }

    capitalizeString(text: string) {
        return text.toLocaleLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
    }

    getDescriptionMenu(value: string) {

        if (value.toUpperCase().includes('APLICATIVO- '))
            return value.replace("APLICATIVO- ", "");

        if (value.toUpperCase().includes('APLICATIVO - '))
            return value.replace("APLICATIVO - ", "");

        return value;
    }

    getUrlPage(value: string): string {
        switch (value) {
            case "app_auditoria": return 'list-audit';
            case "app_auditoria_qualidade": return 'list-quality';
            // case "app_configuracao": return 'list-audit';
            case "app_green_planet": return 'green-planet-list';
            case "app_ordem_servico": return "list-order-service";
            case "app_requisicao_os": return "request-order-service";
            case "app_pmoc": return 'list-pmoc';
            case "app_pmoc_grouped": return 'list-pmoc-grouped';
            case "app_preventiva": return 'list-preventive';
            case "app_rotina": return 'list-routine';
            case "app_uh_dia": return 'list-uh';
            case "app_log_book": return 'list-log-book';
            case "app_tarefa" : return 'task-list';
            case "app_governanca" : return 'governance';
            default: return 'service-list-menu';
        }
    }

    getIcon(value: string): string {
        switch (value) {
            case "app_auditoria": return 'stats-chart-outline';
            case "app_auditoria_qualidade": return 'star-outline';
            case "app_green_planet": return 'leaf-outline';
            case "app_ordem_servico": return 'document-outline';
            case "app_requisicao_ordem_servico": return 'bag-add-outline';
            case "app_pmoc": return 'snow-outline';
            case "app_pmoc_grouped": return 'snow-outline';
            case "app_preventiva": return 'settings-outline';
            case "app_rotina": return 'calendar-clear-outline';
            case "app_uh_dia": return 'bookmark-outline';
            case "app_log_book": return 'time-outline';
            case "app_tarefa" : return 'build-outline';
            case "app_governanca" : return 'bookmarks-outline';
            default: return 'ellipse-outline';
        }
    }

    setPrioridadeCSS(prioridade: string) {

        var prioridadeFormatada = this.removeAcento(prioridade);

        switch (prioridadeFormatada.toUpperCase()) {
            case "00-CRITICA": return 'status-atrasado';
            case "0-CRITICA": return 'status-atrasado';
            case "CRITICA": return 'status-atrasado';
            case "01-ALTA": return 'status-pendente';
            case "1-ALTA": return 'status-pendente';
            case "ALTA": return 'status-pendente';
            case "02-MEDIA": return 'status-vinculado';
            case "2-MEDIA": return 'status-vinculado';
            case "MEDIA": return 'status-vinculado';
            case "03-BAIXA": return 'status-andamento';
            case "3-BAIXA": return 'status-andamento';
            case "BAIXA": return 'status-andamento';
            default: return '';
        }
    }

    setCirclePrioridadeCSS(prioridade: string) {
    var prioridadeFormatada = this.removeAcento(prioridade);

    switch (prioridadeFormatada.toUpperCase()) {
        case "00-CRITICA": return 'circle-status-atrasado';
        case "0-CRITICA": return 'circle-status-atrasado';
        case "CRITICA": return 'circle-status-atrasado';
        case "01-ALTA": return 'circle-status-pendente';
        case "1-ALTA": return 'circle-status-pendente';
        case "ALTA": return 'circle-status-pendente';
        case "02-MEDIA": return 'circle-status-vinculado';
        case "2-MEDIA": return 'circle-status-vinculado';
        case "MEDIA": return 'circle-status-vinculado';
        case "03-BAIXA": return 'circle-status-andamento';
        case "3-BAIXA": return 'circle-status-andamento';
        case "BAIXA": return 'circle-status-andamento';
        default: return '';
    }
    }

    async getMarca() {
        const data = await this.storageRepository.get("user");
        if (data.unitList.length <= 0) return null;

        var list: any[] = [];
        data.unitList.forEach((item: any) => {
            if (!this.isEmpty(item.marca))
                list.push(item.marca);
        });

        if (list.length <= 0) return null;
        return list;
    }

    async getEstado() {
        const data = await this.storageRepository.get("user");
        if (data.location.length <= 0) return null;

        var list: any[] = [];
        data.location.forEach((item: any) => {
            if (!this.isEmpty(item.uf))
                list.push(item.uf);
        });

        if (list.length <= 0) return null;
        return list;
    }

    async getMunicipioByUF(uf: string) {
        if (this.isEmpty(uf)) return null;
        const data = await this.storageRepository.get("user");

        if (data.location.length <= 0) return null;
        var list = data.location.filter((data: any) => data.uf == uf);

        if (list[0].municipio.length <= 0) return null;
        return list[0].municipio;
    }

    removeAcento(text: string) {
        const a = 'àáäâãèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;'
        const b = 'aaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
        const p = new RegExp(a.split('').join('|'), 'g')
        return text.toString().toLowerCase().trim()
            .replace(p, c => b.charAt(a.indexOf(c))) // Replace special chars
            .replace(/&/g, '-and-') // Replace & with 'and'
            .replace(/[\s\W-]+/g, '-') // Replace spaces, non-word characters and dashes with a single dash (-)

    }

    b64toBlob(b64Data: string, contentType: string, sliceSize: number = 512) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }

    savebase64AsPDF(folderpath: string, filename: string, content: string, contentType: string) {
        // Convert the base64 string in a Blob
        var DataBlob = this.b64toBlob(content, contentType);

        // window.resolveLocalFileSystemURL(folderpath, function(dir) {
        //     dir.getFile(filename, {create:true}, function(file) {
        //         file.createWriter(function(fileWriter) {
        //             fileWriter.write(DataBlob);
        //         }, function(){
        //             alert('Unable to save file in path '+ folderpath);
        //         });
        //     });
        // });
    }

    getpdfBase64Teste() {
        return "JVBERi0xLjUNCiW1tbW1DQoxIDAgb2JqDQo8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFIvTGFuZyhwdC1CUikgL1N0cnVjdFRyZWVSb290IDggMCBSL01hcmtJbmZvPDwvTWFya2VkIHRydWU+Pj4+DQplbmRvYmoNCjIgMCBvYmoNCjw8L1R5cGUvUGFnZXMvQ291bnQgMS9LaWRzWyAzIDAgUl0gPj4NCmVuZG9iag0KMyAwIG9iag0KPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PC9Gb250PDwvRjEgNSAwIFI+Pi9Qcm9jU2V0Wy9QREYvVGV4dC9JbWFnZUIvSW1hZ2VDL0ltYWdlSV0gPj4vTWVkaWFCb3hbIDAgMCA1OTUuMzIgODQxLjkyXSAvQ29udGVudHMgNCAwIFIvR3JvdXA8PC9UeXBlL0dyb3VwL1MvVHJhbnNwYXJlbmN5L0NTL0RldmljZVJHQj4+L1RhYnMvUy9TdHJ1Y3RQYXJlbnRzIDA+Pg0KZW5kb2JqDQo0IDAgb2JqDQo8PC9GaWx0ZXIvRmxhdGVEZWNvZGUvTGVuZ3RoIDE3Mj4+DQpzdHJlYW0NCnicfY49C4MwFEX3QP7DHeMS8zRGC+LgR0sLSods0tF2EqHtr+/UWCqoxfLgLe/dew78M9LUr4tjCZVlyMsCueXM3xMogL1yRlBuCEkkSWnERsnQXXrOFG7jOnDWCtt5kXg8O3gX2BNnlSsZi6Y0kZa0SLdi/ouqLoCZDc1s1gqBlsZ8S5qh7zwttrmxDJNl5C832OaaZCfVJN+8Ptz7sAV2xHCV+QG/AeWeTHENCmVuZHN0cmVhbQ0KZW5kb2JqDQo1IDAgb2JqDQo8PC9UeXBlL0ZvbnQvU3VidHlwZS9UcnVlVHlwZS9OYW1lL0YxL0Jhc2VGb250L1RpbWVzIzIwTmV3IzIwUm9tYW4vRW5jb2RpbmcvV2luQW5zaUVuY29kaW5nL0ZvbnREZXNjcmlwdG9yIDYgMCBSL0ZpcnN0Q2hhciAzMi9MYXN0Q2hhciAyNTAvV2lkdGhzIDE3IDAgUj4+DQplbmRvYmoNCjYgMCBvYmoNCjw8L1R5cGUvRm9udERlc2NyaXB0b3IvRm9udE5hbWUvVGltZXMjMjBOZXcjMjBSb21hbi9GbGFncyAzMi9JdGFsaWNBbmdsZSAwL0FzY2VudCA4OTEvRGVzY2VudCAtMjE2L0NhcEhlaWdodCA2OTMvQXZnV2lkdGggNDAxL01heFdpZHRoIDI2MTQvRm9udFdlaWdodCA0MDAvWEhlaWdodCAyNTAvTGVhZGluZyA0Mi9TdGVtViA0MC9Gb250QkJveFsgLTU2OCAtMjE2IDIwNDYgNjkzXSA+Pg0KZW5kb2JqDQo3IDAgb2JqDQo8PC9BdXRob3IoQ29udGEgZGEgTWljcm9zb2Z0KSAvQ3JlYXRvcihNaWNyb3NvZnQgT2ZmaWNlKSAvQ3JlYXRpb25EYXRlKEQ6MjAyMzA1MDUxMTAwNTQtMDMnMDAnKSAvTW9kRGF0ZShEOjIwMjMwNTA1MTEwMDU0LTAzJzAwJykgL1Byb2R1Y2VyKE1pY3Jvc29mdCBPZmZpY2UpID4+DQplbmRvYmoNCjE0IDAgb2JqDQo8PC9UeXBlL09ialN0bS9OIDgvRmlyc3QgNTEvRmlsdGVyL0ZsYXRlRGVjb2RlL0xlbmd0aCAzMDY+Pg0Kc3RyZWFtDQp4nJVSwWrCQBC9C/7D/MFkk0YsiFCq0iKGkAg9iIc1mcZgsivrBvTvu5NEzMFCe9mdefPem51hhQ8eiBBCAWICwvNBuCgMYAq+A14h8BiG8MVVAggnIcxmGDPLgwRTjHF7OxOm1jSZXVZU43oH3h4wLiBgznw+Hv1BIv4v8Z9JpneFNPZpHx444ZHba8LXHnr5gL81RInWFhNd0Uae3SrY2NmSaou8FUbYU3Qug2pEV7umG4jeeeWslLaEER9LlT+SraMe9BVTyix+kMzJdDFr7vGnqkpF6VHyAxl4U85B2lKrPje2/JYuaLMvbU4HrU+40FlTuze1yOVIZLvNbGRm9CB/P7pzkC9KWeliAKRVmdOA2/VxtMLIGldl0RjqZ42a+rLjbxU8lvvb4sejH8XUvZQNCmVuZHN0cmVhbQ0KZW5kb2JqDQoxNyAwIG9iag0KWyAyNTAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgNzIyIDAgMCAwIDAgMCA2MTEgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCA0NDQgMCAwIDAgMCAwIDAgMCA3NzggMCA1MDAgMCAwIDMzMyAzODkgMjc4IDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgNTAwXSANCmVuZG9iag0KMTggMCBvYmoNCjw8L1R5cGUvWFJlZi9TaXplIDE4L1dbIDEgNCAyXSAvUm9vdCAxIDAgUi9JbmZvIDcgMCBSL0lEWzxEODY1MDVERDQ5NDQwODQ4QUFBNUMyMEUzRkJENjI3Nz48RDg2NTA1REQ0OTQ0MDg0OEFBQTVDMjBFM0ZCRDYyNzc+XSAvRmlsdGVyL0ZsYXRlRGVjb2RlL0xlbmd0aCA3Mz4+DQpzdHJlYW0NCnicY2AAgv//GYGkIAMDiKqBUFvAFOMCMMU0DUwxO4MpFkOgCFAJHwMLhGKFUGwQihlCQZWwgzQ8gfEYIRQTUJCtioEBADpeBwENCmVuZHN0cmVhbQ0KZW5kb2JqDQp4cmVmDQowIDE5DQowMDAwMDAwMDA4IDY1NTM1IGYNCjAwMDAwMDAwMTcgMDAwMDAgbg0KMDAwMDAwMDEyNCAwMDAwMCBuDQowMDAwMDAwMTgwIDAwMDAwIG4NCjAwMDAwMDA0MTYgMDAwMDAgbg0KMDAwMDAwMDY2MiAwMDAwMCBuDQowMDAwMDAwODM1IDAwMDAwIG4NCjAwMDAwMDEwNzMgMDAwMDAgbg0KMDAwMDAwMDAwOSA2NTUzNSBmDQowMDAwMDAwMDEwIDY1NTM1IGYNCjAwMDAwMDAwMTEgNjU1MzUgZg0KMDAwMDAwMDAxMiA2NTUzNSBmDQowMDAwMDAwMDEzIDY1NTM1IGYNCjAwMDAwMDAwMTQgNjU1MzUgZg0KMDAwMDAwMDAxNSA2NTUzNSBmDQowMDAwMDAwMDE2IDY1NTM1IGYNCjAwMDAwMDAwMDAgNjU1MzUgZg0KMDAwMDAwMTY1OCAwMDAwMCBuDQowMDAwMDAyMTM5IDAwMDAwIG4NCnRyYWlsZXINCjw8L1NpemUgMTkvUm9vdCAxIDAgUi9JbmZvIDcgMCBSL0lEWzxEODY1MDVERDQ5NDQwODQ4QUFBNUMyMEUzRkJENjI3Nz48RDg2NTA1REQ0OTQ0MDg0OEFBQTVDMjBFM0ZCRDYyNzc+XSA+Pg0Kc3RhcnR4cmVmDQoyNDExDQolJUVPRg0KeHJlZg0KMCAwDQp0cmFpbGVyDQo8PC9TaXplIDE5L1Jvb3QgMSAwIFIvSW5mbyA3IDAgUi9JRFs8RDg2NTA1REQ0OTQ0MDg0OEFBQTVDMjBFM0ZCRDYyNzc+PEQ4NjUwNURENDk0NDA4NDhBQUE1QzIwRTNGQkQ2Mjc3Pl0gL1ByZXYgMjQxMS9YUmVmU3RtIDIxMzk+Pg0Kc3RhcnR4cmVmDQoyOTQ2DQolJUVPRg==";
    }

    getPorcentagem(total: number, totalOk: number) {
        if (total == 0 || totalOk == 0) return 0;

        return Math.trunc((totalOk / total) * 100);
    }

    getFormatPorcentagem(total: number, totalOk: number) {
        if (total == 0 || totalOk == 0) return '0%';

        var porcentagem = this.getPorcentagem(total, totalOk);
        return `${porcentagem}%`;
    }

    getProgressBarValue(total: number, totalOk: number) {
        if (total == 0 || totalOk == 0) return 0.0;

        var porcentagem = this.getPorcentagem(total, totalOk);
        if (porcentagem <= 0.0) 0.0;
        return porcentagem / 100;
    }

    getTotal(total: number, totalOk: number) {
        return `${totalOk}/${total}`;
    }

    setStatusCSS(status: string) {

        switch (status.toUpperCase()) {
            case "EM ATRASO": return 'status-atrasado';
            case "ATRASO": return 'status-atrasado';
            case "ATRASADO": return 'status-atrasado';
            case "EM ANDAMENTO": return 'status-andamento';
            case "ANDAMENTO": return 'status-andamento';
            case "PENDENTE": return 'status-pendente';
            case "VINCULADA": return 'status-vinculado';
            case "VACANT": return "status-vacant";
            case "CONCLUÍDO": return "status-concluido";
            case "CONCLUIDO": return "status-concluido";
            case "EM MANUTENÇÃO": return "status-manutencao";
            case "EM MANUTENCAO": return "status-manutencao";
            case "MANUTENÇÃO": return "status-manutencao";
            case "MANUTENCAO": return "status-manutencao";
            case "AGUARDANDO LIBERAÇÃO": return "status-aguardando";
            case "AGUARDANDO LIBERACAO": return "status-aguardando";
            default: return 'circle-status-nulo';
        }
    }

    setStatusCSSIcon(status: string) {

        switch (status.toUpperCase()) {
            case "EM ATRASO": return 'status-atrasado-icon';
            case "ATRASO": return 'status-atrasado-icon';
            case "ATRASADO": return 'status-atrasado-icon';
            case "EM ANDAMENTO": return 'status-andamento-icon';
            case "ANDAMENTO": return 'status-andamento-icon';
            case "PENDENTE": return 'status-pendente-icon';
            case "VINCULADA": return 'status-vinculado-icon';
            case "VACANT": return "status-vacant-icon";
            case "CONCLUÍDO": return "status-concluido-icon";
            case "CONCLUIDO": return "status-concluido-icon";
            case "EM MANUTENÇÃO": return "status-manutencao-icon";
            case "EM MANUTENCAO": return "status-manutencao-icon";
            case "MANUTENÇÃO": return "status-manutencao-icon";
            case "MANUTENCAO": return "status-manutencao-icon";
            case "AGUARDANDO LIBERAÇÃO": return "status-aguardando-icon";
            case "AGUARDANDO LIBERACAO": return "status-aguardando-icon";
            default: return 'circle-status-nulo-icon';
        }
    }

    setCircleStatusCSS(status: string) {
        switch (status.toUpperCase()) {
            case "EM ATRASO": return 'circle-status-atrasado';
            case "ATRASO": return 'circle-status-atrasado';
            case "ATRASADO": return 'circle-status-atrasado';
            case "EM ANDAMENTO": return 'circle-status-andamento';
            case "ANDAMENTO": return 'circle-status-andamento';
            case "PENDENTE": return 'circle-status-pendente';
            case "VINCULADA": return 'circle-status-vinculado';
            case "VACANT": return "circle-status-vacant";
            case "CONCLUÍDO": return "circle-status-concluido";
            case "CONCLUIDO": return "circle-status-concluido";
            case "EM MANUTENÇÃO": return "circle-status-manutencao";
            case "EM MANUTENCAO": return "circle-status-manutencao";
            case "MANUTENÇÃO": return "circle-status-manutencao";
            case "MANUTENCAO": return "circle-status-manutencao";
            case "AGUARDANDO LIBERAÇÃO": return "circle-status-aguardando";
            case "AGUARDANDO LIBERACAO": return "circle-status-aguardando";
            default: return 'circle-status-nulo';
        }
    }

    setStatusOperaCSS(status: string) {

        switch (status.toUpperCase()) {
            case "OCCUPED": return 'status-atrasado';
            case "VACANT": return "status-vacant";
            default: return 'circle-status-nulo';
        }
    }

    setStatusOperaGovernancaCSS(status: string) {

        switch (status.toUpperCase()) {
            case "AZUL": return 'cor-azul';
            case "VERDE": return "cor-verde";
            case "AMARELO": return "cor-amarelo";
            case "CINZA": return "cor-cinza";
            case "VERMELHO": return "cor-vermelho";
            default: return 'circle-status-nulo';
        }
    }

    setCircleStatusOperaCSS(status: string) {
        switch (status.toUpperCase()) {
            case "OCCUPED": return 'circle-status-atrasado';
            case "VACANT": return "circle-status-vacant";
            default: return 'circle-status-nulo';
        }
    }

    getPDFNameURL(url: string) {
        var result = url.split('/');
        return result[result.length - 1];
    }

    isPDFFile(url: any){
        return url.toString().includes('.pdf');
    }

    disableMenu(tipo: string, tag: string) {

        var list: any = [];
        list.push({ tag: "app_ordem_servico" });
        list.push({ tag: "app_requisicao_os" });
        list.push({ tag: "app_preventiva" });
        list.push({ tag: "app_rotina" });
        list.push({ tag: "app_pmoc" });
        list.push({ tag: "app_pmoc_grouped" });
        list.push({ tag: "app_uh_dia" });
        list.push({ tag: "app_green_planet" });
        list.push({ tag: "app_tarefa"});
        list.push({ tag: "app_auditoria_qualidade"});
        list.push({ tag: "app_auditoria"});
        list.push({ tag: "app_governanca"});
        list.push({ tag: "app_log_book"});

        var result = list.filter((data: any) => data.tag == tag);

        if (tipo == 'DISABLE') {
            if (result.length > 0) return '';
            return 'item-disable';
        }

        if (tipo == 'ITEM-DISABLE') {
            if (result.length > 0) return 'menu-item';
            return 'menu-item-disable';
        }
        return '';
    }

    validateChecklistAnswered(list: any[]):boolean{
        if (list == null) return false;
        var result = false;
        list.forEach(function (item) {
            if (item.totalOk > 0)  result = true;
            if (item.subgrupo.length > 0){
            item.subgrupo.forEach(function (subgrupo:any) {
                if (subgrupo.totalOk > 0 ) result = true;
            });
            }
        }); 
        return result;
        }

    validateChecklistEmpty(item: any){
        return this.isEmpty(item.checklist);
    }

    validateChecklistSubgrupoEmpty(item: any){
        if (this.isEmpty(item.subgrupo)) return true;
        var result = true;
        item.subgrupo.forEach(function (subgrupo:any) {
            if (subgrupo.checklist != null && subgrupo.checklist != '' && subgrupo.checklist.length > 0)
            {
                result = false;
            }
        });
        return result;
    }
   
    async limpaArquivoChecklist( list: any){

    list.forEach(async (lista:any) => {
        if (lista.grupo.length > 0){
            lista.grupo.forEach(async (grupo:any) => {
            if (grupo.checklist.length > 0){
                grupo.checklist.forEach(async (item:any) => {
                    item.arquivo = [];
                });
            }else{
                if (grupo.subgrupo.length > 0){
                grupo.subgrupo.forEach(async (subgrupo:any) => {
                    if (subgrupo.checklist.length > 0){
                        subgrupo.checklist.forEach(async (item:any) => {
                            item.arquivo = [];
                        });
                    }
                });
                }
            }
            });
        }
        });


    return list;
    }

    async insertWifiStatus(status: boolean) {

    try {
        this.storageRepository.insert("WIFISTATUS", status);
    } catch (error: any) {
        alert("Erro: " + error.Message)
    }
    }

    async getWifiStatus() {
    const data = await this.storageRepository.get("WIFISTATUS");
    return data;
    }


    async getEstados(): Promise<EstadosInterface[]> {
    var list: EstadosInterface[] = [];
    try {
        const response = await fetch('./../../assets/files/estados.json');
        if (!response.ok) {
            console.error('Erro ao carregar o arquivo:', response.statusText);
            return list;
        }
        const json = await response.json();
        const estados = Array.from<EstadosInterface>(json.estados);
        return estados;
    } catch (erro) {
        console.error('Erro ao carregar ou parsear o arquivo:', erro);
        return list;
    }
    }

    async getCidades(codigoEstado: number): Promise<CidadesInterface[]> {

    var list: CidadesInterface[] = [];
    try {
        const response = await fetch('./../../assets/files/cidades.json');
        if (!response.ok) {
            console.error('Erro ao carregar o arquivo:', response.statusText);
            return list;
        }
        
        const json = await response.json()
        const cidades = Array.from<CidadesInterface>(json.cidades);
        var cidadesByEstado = cidades.filter((item) => item.codigoEstado == codigoEstado);
        
        return cidadesByEstado;
    } catch (erro) {
        console.error('Erro ao carregar ou parsear o arquivo:', erro);
        return list;
    }
    }


    convertBase64ToBlob(Base64Image: string) {
    // split into two parts
    const parts = Base64Image.split(";base64,")
    // hold the content type
    const imageType = parts[0].split(":")[1]
    // decode base64 string
    const decodedData = window.atob(parts[1])
    // create unit8array of size same as row data length
    const uInt8Array = new Uint8Array(decodedData.length)
    // insert all character code into uint8array
    for (let i = 0; i < decodedData.length; ++i) {
        uInt8Array[i] = decodedData.charCodeAt(i)
    }
    // return blob image after conversion
    return new Blob([uInt8Array], { type: imageType })
    }

    async convertStringToArray(texto: string | string[] | null){
        if (typeof texto !== "string" || texto == null) {
          return [];
        }
    
        return texto.split(",").map(item => item.trim());
    }
}