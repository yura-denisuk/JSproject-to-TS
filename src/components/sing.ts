import {Auth} from "../services/auth";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {LoginFieldsType} from "../types/login-fields.type";
import {SignupType} from "../types/signup.type";
import {DefaultResponseType} from "../types/default-response.type";
import {LoginResponseType} from "../types/login-response.type";

export class Sing {
    readonly processElement: HTMLInputElement | null;
    private email: HTMLInputElement | null;
    private password: HTMLInputElement | null;
    private repeatPassword: HTMLInputElement | null;
    private fields: LoginFieldsType[] = [];
    private page: string = "";

    constructor() {
        this.processElement = document.getElementById('sing') as HTMLInputElement;
        this.email = document.getElementById('email') as HTMLInputElement;
        this.password = null;
        this.repeatPassword = null;

        this.fields =
            [{
                name: 'name',
                id: 'name',
                element: null,
                regex: /\s?[А-Я][а-я]+\S*/,
                valid: false,
            },
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
            },
            {
                name: 'repeat-password',
                id: 'repeat-password',
                element: null,
                regex: /^(?=.*\d)(?=.*[0-9])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                valid: false,
            }
        ];

        const that: Sing = this;

        this.fields.forEach((item: LoginFieldsType) => {
            item.element = document.getElementById(item.id) as HTMLInputElement;
            if (item.id === "password") {
                this.password = item.element;
            }
            if (item.id === "repeat-password") {
                this.repeatPassword = item.element;
            }
            if (item.element) {
                item.element.onchange = function () {
                    that.validateField.call(that, item, <HTMLInputElement>this);
                }
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

    private comparePasswordAndRepeatPassword(): boolean {
        if ((this.password as HTMLInputElement).value === (this.repeatPassword as HTMLInputElement).value) {
            return true;
        } else {
            (this.repeatPassword as HTMLInputElement).style.borderColor = 'red';
            return false
        }
    }


    private validateForm(): boolean {
        const validForm: boolean = this.fields.every(item => item.valid);
        if (validForm && this.comparePasswordAndRepeatPassword()) {
            (this.processElement as HTMLInputElement).removeAttribute('disabled');
            return true;
        } else {
            (this.processElement as HTMLInputElement).setAttribute('disabled', 'disabled');
            return false;
        }
    }

    private async processForm(): Promise<void> {
        if (this.validateForm()) {
            this.page = window.location.hash;
            if (this.page === '#/sing' || this.page === '') {

                try {
                    const result: SignupType | DefaultResponseType = await CustomHttp.request(config.host + '/signup', "POST", {
                        name: (this.fields.find(item => item.name === 'name')!.element as HTMLInputElement).value.split(' ')[1],
                        lastName: (this.fields.find(item => item.name === 'name')!.element as HTMLInputElement).value.split(' ')[0],
                        email: (this.fields.find(item => item.name === 'email')!.element as HTMLInputElement).value,
                        password: (this.password as HTMLInputElement)!.value,
                        passwordRepeat: (this.repeatPassword as HTMLInputElement)!.value,
                    });

                    if (result) {
                        if((result as DefaultResponseType).error) {
                            throw new Error((result as DefaultResponseType).message);
                        }

                        const resultLogin: LoginResponseType | DefaultResponseType = await CustomHttp.request(config.host + '/login', "POST", {
                            email: (result as SignupType).user.email,
                            password: (this.password as HTMLInputElement).value,
                            rememberMe: false,
                        });

                        if (resultLogin) {
                            if ((resultLogin as DefaultResponseType).error) {
                                throw new Error((resultLogin as DefaultResponseType).message);
                            }

                            Auth.setTokens((resultLogin as LoginResponseType).tokens.accessToken, (resultLogin as LoginResponseType).tokens.refreshToken);
                            Auth.setUserInfo((resultLogin as LoginResponseType).user);
                            document.getElementById('menu')!.style.display = 'block';
                            location.href = '#/';
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }
}