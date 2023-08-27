import config from "../../config/config";
import {CustomHttp} from "./custom-http";
import {RefreshResponseType} from "../types/refresh-response.type";
import {DefaultResponseType} from "../types/default-response.type";
import {LogoutResponseType} from "../types/logout-response.type";
import {UserInfoType} from "../types/user-info.type";

export class Auth {

    public static accessTokenKey: string = 'accessToken';
    private static refreshTokenKey: string = 'refreshToken';
    private static userInfoKey: string = 'userInfo';

    public static async processUnouthorizedResponse(): Promise<boolean> {
        const refreshToken: string | null = this.getRefreshToken();
        if (refreshToken) {
            const response: Response = await fetch(config.host + '/refresh', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({refreshToken: refreshToken})
            });

            if (response && response.status === 200) {
                const result: RefreshResponseType | DefaultResponseType = await response.json();
                if (result && !(result as DefaultResponseType).error) {
                    this.setTokens((result as RefreshResponseType).tokens.accessToken, (result as RefreshResponseType).tokens.refreshToken);
                    return true;
                }
            }
        }

        this.removeTokens();
        location.href = '#/';
        return false;
    }

    public static setTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
    }

    private static getRefreshToken(): string | null {
        return localStorage.getItem(this.refreshTokenKey);
    }

    private static removeTokens(): void {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
    }

    public static async logout(): Promise<boolean | undefined> {

        const refreshToken: string | null = this.getRefreshToken();

        if (refreshToken) {
            try {

                const result: LogoutResponseType | null = await CustomHttp.request(config.host + '/logout', "POST", {
                    refreshToken: refreshToken,
                });

                if (result && !result.error) {
                    Auth.removeTokens();
                    localStorage.removeItem(Auth.userInfoKey);
                    location.href = '#/login';
                    return true;
                }
            } catch (error) {
                console.log(error);
            }
        } else {
            console.log('В localstorage отсутствует информация о refreshToken!');
            return false;
        }
    }

    public static setUserInfo(info: UserInfoType): void {
        localStorage.setItem(this.userInfoKey, JSON.stringify(info));
    }

    public static getUserInfo(): UserInfoType | null {
        const userInfo: string | null = localStorage.getItem(this.userInfoKey);
        if (userInfo) {
            return JSON.parse(userInfo);
        }
        return null;
    }
}