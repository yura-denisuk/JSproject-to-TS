import {Auth} from "../services/auth";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {LoginFieldsType} from "../types/login-fields.type";
import {LoginResponseType} from "../types/login-response.type";
import {DefaultResponseType} from "../types/default-response.type";

export class Login {
    readonly processElement: HTMLInputElement | null;
    private agreeElement: HTMLInputElement | null;
    private email: HTMLInputElement | null;
    private password: HTMLInputElement | null;
    private rememberMe: boolean;
    private fields: LoginFieldsType[] = [];
    private page: string;


    constructor() {
        this.processElement = document.getElementById('login') as HTMLInputElement;
        this.agreeElement = document.getElementById('flexCheckDefault') as HTMLInputElement;
        this.email = null;
        this.password = null;
        this.rememberMe = false;
        this.page = window.location.hash;

        this.fields =
            [
                {
                    name: 'email',
                    id: 'email',
                    element: null,
                    regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                    valid: false,
                },
                {
                    name: 'password',
                    id: 'password',
                    element: null,
                    regex: /^(?=.*\d)(?=.*[0-9])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                    valid: false,
                }
            ];

        const that: Login = this;

        this.fields.forEach((item: LoginFieldsType) => {
            item.element = document.getElementById(item.id) as HTMLInputElement;
            if (item.element) {
                item.element.onchange = function () {
                    that.validateField.call(that, item, <HTMLInputElement>this);
                }
            }

            if (item.id === 'email') {
                this.email = item.element;
            }
            if (item.id === 'password') {
                this.password = item.element;
            }
        });

        this.processElement.onclick = function () {
            that.processForm();
        }
    }

    private validateField(field: LoginFieldsType, element: HTMLInputElement): void {
        if (!element.value || !element.value.match(field.regex)) {
            element.style.borderColor = 'red';
            field.valid = false;
        } else {
            element.removeAttribute('style');
            field.valid = true;
        }
        this.validateForm();
    }

    private validateForm(): boolean | undefined  {
        const validForm: boolean = this.fields.every(item => item.valid);
        if (this.processElement) {
            if (validForm) {
                this.processElement.removeAttribute('disabled');
                return true;
            } else {
                this.processElement.setAttribute('disabled', 'disabled');
                return false;
            }
        }
    }

    private async processForm(): Promise<void> {
        if (this.validateForm()) {
            this.page = window.location.hash;
            if ((this.agreeElement as HTMLInputElement).checked) {
                this.rememberMe = true;
            }

            if (this.page === '#/login') {

                try {
                    const result: LoginResponseType | DefaultResponseType = await CustomHttp.request(config.host + '/login', "POST", {
                        email: (this.email as HTMLInputElement).value,
                        password: (this.password as HTMLInputElement).value,
                        rememberMe: this.rememberMe,
                    });

                        if (result) {
                            if (!(result as LoginResponseType).user || !(result as LoginResponseType).tokens) {
                                throw new Error('Ошибка при отправке запроса на получение accessToken! Отсутствует ответ с accessToken и информацией о пользователе!');
                            }

                            Auth.setTokens((result as LoginResponseType).tokens.accessToken, (result as LoginResponseType).tokens.refreshToken);

                            if (this.rememberMe) {
                                Auth.setUserInfo((result as LoginResponseType).user);
                            }

                            document.getElementById('menu')!.style.display = 'block';
                            location.href = '#/';
                        }
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }
}