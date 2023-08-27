import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {ActionProfitCost} from "../services/action-profit-cost";
import {Balance} from "../services/balance";
import "air-datepicker";
import AirDatepicker from "air-datepicker";
import {DefaultResponseType} from "../types/default-response.type";
import {CreateOperationType} from "../types/create-operation.type";
import {ProfitCostCategoryResponseType} from "../types/profit-cost-category-response.type";

export class CreateProfitCost {
    readonly selectProfitCost: HTMLElement | null;
    private categoriesSelect: HTMLElement | null;
    readonly createItemProfitCost: HTMLElement | null;
    readonly cancelCreateItemProfitCost: HTMLElement | null;
    private categories: ProfitCostCategoryResponseType[] | DefaultResponseType;

    constructor() {
        Balance.setActualBalance();
        new AirDatepicker('#create-profit-cost-date');
        this.selectProfitCost = document.getElementById('selectProfitCost');
        this.categoriesSelect = document.getElementById('categoriesSelect');
        this.createItemProfitCost = document.getElementById('createItemProfitCost');
        this.cancelCreateItemProfitCost = document.getElementById('cancelCreateItemProfitCost');
        this.categories = [];

        //Получение категорий дохода/расхода при изменении select доход/расход
        if (this.selectProfitCost) {
            this.selectProfitCost.onchange = () => {
                this.getCategories();
            }
        }

        //Отправка запроса на создание единицы дохода/расхода
        if (this.createItemProfitCost) {
            this.createItemProfitCost.onclick = () => {
                this.createItem();
                Balance.setActualBalance();
            }
        }

        //Отмена отправки запроса на создание единицы дохода/расхода
        if (this.cancelCreateItemProfitCost) {
            this.cancelCreateItemProfitCost.onclick = () => {
                ActionProfitCost.removeCategoriesInfo('categoriesName');
                location.href = '#/profit-cost';
            }
        }
    }

    private async createItem(): Promise<void> {
        const categoriesName: string | null = ActionProfitCost.getCategoriesInfo('categoriesName');
        const selectProfitCost: HTMLSelectElement | null = document.getElementById('selectProfitCost') as HTMLSelectElement;
        const categoriesSelect: HTMLSelectElement | null = document.getElementById('categoriesSelect') as HTMLSelectElement;
        const amount: HTMLInputElement | null = document.getElementById('amount') as HTMLInputElement;
        const date: HTMLInputElement | null = document.getElementById('create-profit-cost-date') as HTMLInputElement;
        const dateArray: string[] = date.value.split('.').reverse();
        const dateResponse: string = dateArray.join('-');
        const comment: HTMLInputElement | null = document.getElementById('comment') as HTMLInputElement;
        const category_id: string = this.getCategoryId();

        if (!selectProfitCost.value || !categoriesSelect.value || !amount.value || !date.value || !comment.value) {
            alert('Заполните все поля формы!');
        } else {
            try {
                if (categoriesName) {
                    if (!+amount.value || !dateResponse || !comment.value) {
                        alert('Имеются не заполненные поля! Необходимо заполнить все поля формы!')
                    }
                    const result: CreateOperationType | DefaultResponseType = await CustomHttp.request(config.host + '/operations', "POST", {
                        type: categoriesName,
                        amount: +amount.value,
                        date: dateResponse,
                        comment: comment.value,
                        category_id: +category_id,
                    });

                    if ((result as DefaultResponseType).error) {
                        throw new Error((result as DefaultResponseType).message);
                    } else {
                        ActionProfitCost.removeCategoriesInfo('categoriesName');
                        location.href = '#/profit-cost';
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    private setCategoriesToSelect(): void {
        if (this.categories) {
            this.removeCategoriesToSelect();
            for (let i = 0; i < (this.categories as ProfitCostCategoryResponseType[]).length; i++) {
                const category = (this.categories as ProfitCostCategoryResponseType[])[i];
                const optionElement: HTMLElement = document.createElement('option');
                optionElement.setAttribute('id', category.id.toString());
                optionElement.setAttribute('value', category.title);
                optionElement.innerText = category.title;
                (this.categoriesSelect as HTMLElement).append(optionElement);
            }
        }
    }

    private removeCategoriesToSelect(): void {
        (this.categoriesSelect as HTMLElement).innerHTML = '';
    }

    private getCategoryId(): string {
        let selectCategoryActual: HTMLSelectElement | null = document.getElementById('categoriesSelect') as HTMLSelectElement;
        let categories: HTMLElement[] = Array.from((this.categoriesSelect as HTMLElement).childNodes) as HTMLElement[];
        let activeCategory: HTMLElement | undefined = categories.find((item: HTMLElement) => {
            return item.textContent === (selectCategoryActual as HTMLSelectElement).value;
        })
        return (activeCategory as HTMLElement).getAttribute('id') as string;
    }

    private async getCategories(): Promise<void> {
        try {
            let selectProfitCostActual: HTMLSelectElement | null = document.getElementById('selectProfitCost') as HTMLSelectElement;
            let name: string = '';
            if (selectProfitCostActual.value === 'доход') {
                name = 'income';
                ActionProfitCost.removeCategoriesInfo('categoriesName');
                ActionProfitCost.setCategoriesInfo('categoriesName', 'income');
            } else if (selectProfitCostActual.value === 'расход') {
                name = 'expense';
                ActionProfitCost.removeCategoriesInfo('categoriesName');
                ActionProfitCost.setCategoriesInfo('categoriesName', 'expense');
            }

            if (name) {
                this.categories = await this.responseCategories('/categories/' + name);
                this.setCategoriesToSelect();
            } else {
                this.removeCategoriesToSelect();
                throw new Error('В select доход/расход отсутствует значение');
            }
        } catch (error) {
            console.log(error);
        }
    }

    private async responseCategories(hashResponse: string): Promise<ProfitCostCategoryResponseType[] | DefaultResponseType>  {
        try {
            const response: ProfitCostCategoryResponseType[] | DefaultResponseType = await CustomHttp.request(config.host + hashResponse);
            if ((response as DefaultResponseType).error) {
                throw new Error((response as DefaultResponseType).message);
            } else {
                return (response as ProfitCostCategoryResponseType[]);
            }
        } catch (error) {
            console.log(error);
            return [];
        }
    }

}
