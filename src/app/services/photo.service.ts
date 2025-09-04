import { EventEmitter, Injectable, Output } from "@angular/core";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { StorageRepository } from "src/app/repositories/storage-repository";
import Compressor from 'compressorjs';

@Injectable({ providedIn: 'root' })
export class PhotoService {

    emitGeNumberFileInsert = new EventEmitter<any>();
    emitGetImageCompressedCamera = new EventEmitter<any>();
    emitGetImageCompressedGallery = new EventEmitter<any>();
    

    constructor(private storageRepository: StorageRepository) { }

    async checkPermissionPhoto() {
        return new Promise(async (resolve, reject) => {
            const status = await Camera.checkPermissions();
            if (status.camera && status.photos) {
                resolve(true);
            } else {
                Camera.requestPermissions();
                resolve(false);
            }
        });
    }

    public async getPhoto() {
        //const allowed = await this.checkPermissionPhoto();
        const allowed = true;
        if (!allowed) return;
        // Take a photo
        const capturedPhoto = await Camera.getPhoto({
            resultType: CameraResultType.Base64,
            source: CameraSource.Camera,
            quality: 10,
            allowEditing: false,
            saveToGallery: false
        });

        //await this.sendImageCamera(capturedPhoto.base64String)
        // var file = await this.getImageFile(capturedPhoto.webPath);
        // await this.compressImageCamera(file);
        return capturedPhoto.base64String;
    }

    public async getPhotoGallery() {
        //const allowed = await this.checkPermissionPhoto();
        const allowed = true;
        if (!allowed) return;
        // Take a photo
        const capturedPhoto = await Camera.getPhoto({
            resultType: CameraResultType.Base64,
            source: CameraSource.Photos,
            quality: 10,
            allowEditing: false,
        });
        
        var file = await this.getImageFile(capturedPhoto.webPath);
        await this.compressImageGallery(file);
        // return capturedPhoto.base64String;
    }


    async sendImageCamera(photo?:string) {
        await this.emitGetImageCompressedCamera.emit(`data:image/jpeg;base64,${photo}`);

    }


    async getImageFile(uri: any) {
        let response = await fetch(uri);
        let data = await response.blob();
        let metadata = {
          type: 'image/jpeg'
        };
        let file = new File([data], "image.jpg", metadata);
        return file;
      }

    async compressImageCamera(file:any) {
        var _retorno = this;
        await new Compressor(file, {
            quality: 0.2,
            success(result: Blob) {
                var reader = new FileReader();
                reader.readAsDataURL(result);
                reader.onload = async function () {
                    _retorno.emitGetImageCompressedCamera.emit(reader.result?.toString().replace('data:image/jpeg;base64,',''));
                };
                reader.onerror = function (error) {
                    _retorno.emitGetImageCompressedCamera.emit('Erro');
                };
            },
            error() {
                _retorno.emitGetImageCompressedCamera.emit('Erro');
            },
        });

    }

    async compressImageGallery(file:any) {
        var _retorno = this;
        await new Compressor(file, {
            quality: 0.2,
            success(result: Blob) {
                var reader = new FileReader();
                reader.readAsDataURL(result);
                reader.onload = async function () {
                    _retorno.emitGetImageCompressedGallery.emit(reader.result?.toString().replace('data:image/jpeg;base64,',''));
                };
                reader.onerror = function (error) {
                    _retorno.emitGetImageCompressedGallery.emit('Erro');
                };
            },
            error(err: any) {
                _retorno.emitGetImageCompressedGallery.emit('Erro');
            },
        });

    }

    verifyContainImage(photo: string, listPhotos: any[]){
        let indexList = listPhotos.findIndex((element: any) => element.base64 === photo);
        return indexList == -1 ? false : true;
      }

   

    async insertPhotoStorage(data: any[]) {
        this.storageRepository.insert("photoPendente", data);
    }

    async getPhotoStorage() {
        const data = await this.storageRepository.get("photoPendente");
        if (!data) return null
        return data;
    }

    async removePhotoStorage() {
        this.storageRepository.delete(["photoPendente"]);
    }

   
    async getNumberFileInsert() {
        this.emitGeNumberFileInsert.emit(1);
    };

}