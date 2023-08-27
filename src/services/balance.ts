import {CustomHttp} from "./custom-http";
import config from "../../config/config";
import {BalanceType} from "../types/balance.type";
import {DefaultResponseType} from "../types/default-response.type";
import {CreateOperationType} from "../types/create-operation.type";

export class Balance {

    //Обновление баланса при добавлении дохода/расхода
    public static async setActualBalance(): Promise<string | undefined> {
        let balanceElement: HTMLElement | null = document.getElementById('balance');
        try {
            const response: BalanceType | DefaultResponseType = await CustomHttp.request(config.host + '/balance');
            if ((response as DefaultResponseType).error) {
                throw new Error((response as DefaultResponseType).message);
            } else {
                return (balanceElement as HTMLElement).textContent = String((response as BalanceType).balance);
            }
        } catch (error) {
            console.log(error);
        }
    }

    //Обновление баланса при удалении дохода/расхода
    public static async changeBalanceAfterRemoveOperation(idElement: number): Promise<void> {
        try {
            //Получаем объект операции по id для реализации изменения баланса
            const getOperation: CreateOperationType | DefaultResponseType = await CustomHttp.request(config.host + '/operations/' + idElement);
            if ((getOperation as DefaultResponseType).error) {
                throw new Error((getOperation as DefaultResponseType).message);
            } else {
                try {
                    const balanceValue: BalanceType | DefaultResponseType = await CustomHttp.request(config.host + '/balance');
                    if ((balanceValue as DefaultResponseType).error) {
                        throw new Error((balanceValue as DefaultResponseType).message);
                    } else {
                        try {
                            let newBalanceValue: number = 0;
                            if ((getOperation as CreateOperationType).type === 'income') {
                                newBalanceValue = (balanceValue as BalanceType).balance - (getOperation as CreateOperationType).amount;
                            }
                            if ((getOperation as CreateOperationType).type === 'expense') {
                                newBalanceValue = (balanceValue as BalanceType).balance + (getOperation as CreateOperationType).amount;
                            }

                            const changeBalanceValue: BalanceType | DefaultResponseType = await CustomHttp.request(config.host + '/balance', 'PUT', {
                                newBalance: newBalanceValue
                            });

                            if ((changeBalanceValue as DefaultResponseType).error) {
                                throw new Error((changeBalanceValue as DefaultResponseType).message);
                            } else {
                                this.setActualBalance();
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
}