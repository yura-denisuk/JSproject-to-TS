import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Balance} from "../services/balance";
import {ProfitCostCategoryResponseType} from "../types/profit-cost-category-response.type";
import {DefaultResponseType} from "../types/default-response.type";

export class CreateCategoryCost {
    private createButton: HTMLElement | null;
    private cancelButton: HTMLElement | null;


    constructor() {
        Balance.setActualBalance();
        this.createButton = document.getElementById('createCategoryCost');
        this.cancelButton = document.getElementById('cancelCreateCategoryCost');
        let that = this;

        //создаем обработчик событий для кнопки создания категории дохода
        if (this.createButton) {
            this.createButton.onclick = function() {
                that.createCategoryCost();
            }
        }

        //создаем обработчик событий для кнопки отмены создания категории дохода
        if (this.cancelButton) {
            this.cancelButton.onclick = function() {
                that.cancelCreateCategoryCost();
            }
        }
    }

    private async createCategoryCost(): Promise<void> {
        const nameCategoryCost: HTMLInputElement | null = document.getElementById('nameCategoryCost') as HTMLInputElement;

        try {
            if ((nameCategoryCost as HTMLInputElement).value) {
                let result: ProfitCostCategoryResponseType | DefaultResponseType = await CustomHttp.request(config.host + '/categories/expense', "POST", {
                    title: nameCategoryCost.value
                });
                if (!result && (result as DefaultResponseType).error) {
                    throw new Error((result as DefaultResponseType).message);
                } else {
                    location.href = '#/cost';
                }
            } else {
                alert('Введите наименование категории!');
            }
        } catch (error) {
            console.log(error)
        }
    }

    private cancelCreateCategoryCost(): void {
        location.href = '#/cost';
    }
}