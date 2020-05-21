import { Component, OnInit } from '@angular/core';
import { NgxImageCompressService } from 'ngx-image-compress';
import { FormBuilder } from '@angular/forms';

import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.sass']
})
export class AppComponent {
    constructor(
        private compressor: NgxImageCompressService,
        private fb: FormBuilder
    ) {
        this.form.valueChanges.pipe(
            debounceTime(500)
        ).subscribe(async (value) => {
            if (this.img) {
                const compressed = await this.compress({ data: this.img, ...value });

                this.convertImg = compressed.img;
                this.convertImgSize = compressed.size;
            }
        });
    }

    form = this.fb.group({
        ratio: [100],
        quality: [50]
    });

    img: string;

    imgSize: number;

    convertImg: string;

    convertImgSize: number;

    selectFile(e: any) {
        if (e.target.files) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = async (event: any) => {
                // base64 image
                this.img = event.target.result;
                this.imgSize = this.compressor.byteCount(this.img) / (1024 * 1024);

                const compressed = await this.compress({ data: this.img, ...this.form.value });
                this.convertImg = compressed.img;
                this.convertImgSize = compressed.size;

                // blob 또는 File 로 변환해서 업로드 처리하면 됨
                // base64 => blob
                // const blob = this.toBlob(compressed.img);
                // console.log('blob', blob);

                // base64 => File
                // const f = new File([compressed.img], file.name, { type: 'image/jpeg' });
                // console.log('file', f);
            };

            reader.readAsDataURL(file);
        }
    }

    async compress({ data, ratio, quality }: { data: string, ratio?: number, quality?: number }) {
        console.log('ratio : ', ratio, ' quality : ', quality);
        const result = await this.compressor.compressFile(data, -1, ratio, quality);

        return { img: result, size: this.compressor.byteCount(result) / (1024 * 1024) };
    }

    toBlob(data) {
        const bytes = window.atob(data.split(',')[1]);
        const buffer = new ArrayBuffer(bytes.length);
        const blob = new Uint8Array(buffer);

        for (let i = 0; i < bytes.length; i++) {
            blob[i] = bytes.charCodeAt(i);
        }

        return new Blob([blob], { type: 'image/jpeg' });
    }
}
