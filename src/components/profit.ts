import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {BuildingElement} from "../services/building-element";
import {Balance} from "../services/balance";
import {DefaultResponseType} from "../types/default-response.type";
import {ProfitCostCategoryResponseType} from "../types/profit-cost-category-response.type";

export class Profit {
    private idElement: string | number | null;
    private profitCategory: ProfitCostCategoryResponseType[] | DefaultResponseType;
    readonly wrapperProfitCategories: HTMLElement | null;
    readonly removeCategoryProfit: HTMLElement | null;
    readonly cancelRemoveCategoryProfit: HTMLElement | null;

    constructor() {
        Balance.setActualBalance();
        this.idElement = null;
        // получение перечня категорий дохода с сервера
        this.profitCategory = [];
        this.wrapperProfitCategories = document.getElementById('wrapper-profit-categories');
        this.getProfitCategories();

        //удаление категории
        this.removeCategoryProfit = document.getElementById('removeCategoryProfit');
        if (this.removeCategoryProfit) {
            this.removeCategoryProfit.onclick = () => {
                this.removeProfitCategory();
            }
        }

        //отмена удаления категории
        this.cancelRemoveCategoryProfit = document.getElementById('cancelRemoveCategoryProfit');
        if (this.cancelRemoveCategoryProfit) {
            this.cancelRemoveCategoryProfit.onclick = () => {
                localStorage.removeItem('profit');
                BuildingElement.canselActionCategory('profit');
            }
        }
    }

    private async getProfitCategories(): Promise<void> {
        try {
            const response: ProfitCostCategoryResponseType[] | DefaultResponseType = await CustomHttp.request(config.host + '/categories/income');
            if ((response as DefaultResponseType).error) {
                throw new Error((response as DefaultResponseType).message);
            } else {
                this.profitCategory = response;
                BuildingElement.showCategoryCards((this.profitCategory as ProfitCostCategoryResponseType[]), (this.wrapperProfitCategories as HTMLElement), 'editing-category-profit');
            }
        } catch (error) {
            console.log(error);
        }
    }

    private async removeProfitCategory(): Promise<void> {
        this.idElement = BuildingElement.getIdElement();
        try {
            await BuildingElement.removeOperations(this.idElement, 'income');
            const response: ProfitCostCategoryResponseType | DefaultResponseType = await CustomHttp.request(config.host + '/categories/income/' + this.idElement,
                "DELETE");
            if ((response as DefaultResponseType).error) {
                throw new Error((response as DefaultResponseType).message);
            } else {
                localStorage.removeItem('idElement');

                location.href = '#/profit';
            }
        } catch (error) {
            console.log(error);
        }
    }
}