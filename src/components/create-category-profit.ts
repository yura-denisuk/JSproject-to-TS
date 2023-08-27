import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Balance} from "../services/balance";
import {ProfitCostCategoryResponseType} from "../types/profit-cost-category-response.type";
import {DefaultResponseType} from "../types/default-response.type";

export class CreateCategoryProfit {
    private createButton: HTMLElement | null;
    private cancelButton: HTMLElement | null;


    constructor() {
        Balance.setActualBalance();
        this.createButton = document.getElementById('createCategoryProfit');
        this.cancelButton = document.getElementById('cancelCreateCategoryProfit');
        let that = this;

        //создаем обработчик событий для кнопки создания категории дохода
        if (this.createButton) {
            this.createButton.onclick = function() {
                that.createCategoryProfit();
            }
        }

        //создаем обработчик событий для кнопки отмены создания категории дохода
        if (this.cancelButton) {
            this.cancelButton.onclick = function() {
                that.cancelCreateCategoryProfit();
            }
        }
    }

    private async createCategoryProfit(): Promise<void> {
        const nameCategoryProfit: HTMLInputElement | null = document.getElementById('nameCategoryProfit') as HTMLInputElement;

        try {
            if (nameCategoryProfit.value) {
                let result: ProfitCostCategoryResponseType | DefaultResponseType = await CustomHttp.request(config.host + '/categories/income', "POST", {
                    title: nameCategoryProfit.value
                });
                if (!result && (result as DefaultResponseType).error) {
                    throw new Error((result as DefaultResponseType).message);
                } else {
                    location.href = '#/profit';
                }
            } else {
                alert('Введите наименование категории!');
            }
        } catch (error) {
            console.log(error);
        }
    }

    private cancelCreateCategoryProfit(): void {
        location.href = '#/profit';
    }
}