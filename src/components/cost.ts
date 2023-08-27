import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {BuildingElement} from "../services/building-element";
import {Balance} from "../services/balance";
import {DefaultResponseType} from "../types/default-response.type";
import {ProfitCostCategoryResponseType} from "../types/profit-cost-category-response.type";

export class Cost {
    private idElement: string | number | null;
    private costCategory: ProfitCostCategoryResponseType[] | DefaultResponseType;
    readonly wrapperCostCategories: HTMLElement | null;
    readonly removeCategoryCost: HTMLElement | null;
    readonly cancelRemoveCategoryCost: HTMLElement | null;

    constructor() {
        Balance.setActualBalance();
        this.idElement = null;
        // получение перечня категорий дохода с сервера
        this.costCategory = [];
        this.wrapperCostCategories = document.getElementById('wrapper-cost-categories');
        this.getCostCategories();

        //удаление категории
        this.removeCategoryCost = document.getElementById('removeCategoryCost');
        if (this.removeCategoryCost) {
            this.removeCategoryCost.onclick = () => {
                this.removeCostCategory();
            }
        }


        //отмена удаления категории
        this.cancelRemoveCategoryCost = document.getElementById('cancelRemoveCategoryCost');
        if (this.cancelRemoveCategoryCost) {
            this.cancelRemoveCategoryCost.onclick = () => {
                localStorage.removeItem('cost');
                BuildingElement.canselActionCategory('cost');
            }
        }
    }

    private async getCostCategories(): Promise<void> {
        try {
            const response: ProfitCostCategoryResponseType[] | DefaultResponseType = await CustomHttp.request(config.host + '/categories/expense');
            if ((response as DefaultResponseType).error) {
                throw new Error((response as DefaultResponseType).message);
            } else {
                this.costCategory = response;
                BuildingElement.showCategoryCards((this.costCategory as ProfitCostCategoryResponseType[]), (this.wrapperCostCategories as HTMLElement), 'editing-category-cost');
            }
        } catch (error) {
            console.log(error);
        }
    }

    private async removeCostCategory(): Promise<void> {
        this.idElement = BuildingElement.getIdElement();
        try {
            await BuildingElement.removeOperations(this.idElement, 'expense');
            const response: ProfitCostCategoryResponseType | DefaultResponseType = await CustomHttp.request(config.host + '/categories/expense/' + this.idElement,
                "DELETE");
            if ((response as DefaultResponseType).error) {
                throw new Error((response as DefaultResponseType).message);
            } else {
                localStorage.removeItem('idElement');
                location.href = '#/cost';
            }
        } catch (error) {
            console.log(error);
        }
    }
}