import {ActionProfitCost} from "../services/action-profit-cost";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Balance} from "../services/balance";
import "air-datepicker";
import AirDatepicker from "air-datepicker";
import {ProfitCostCategoriesResponseType} from "../types/profit-cost-categories-response.type";
import {DefaultResponseType} from "../types/default-response.type";
import {ProfitCostCategoryResponseType} from "../types/profit-cost-category-response.type";
import {EditOperationType} from "../types/edit-operation.type";


export class EditingProfitCost {
    readonly categoriesName: string | null;
    readonly nameCategory: string | null;
    readonly selectProfitCost: HTMLSelectElement | null;
    readonly categoriesSelect: HTMLSelectElement | null;
    readonly editItemProfitCost: HTMLElement | null;
    readonly cancelCreateItemProfitCost: HTMLElement | null;
    private categories: ProfitCostCategoriesResponseType[] | DefaultResponseType;



    constructor() {
        Balance.setActualBalance();

        //Устанавливаем airdatapicker в поля ввода даты
        new AirDatepicker('#editing-profit-cost-date');
        this.categoriesName = ActionProfitCost.getCategoryName('categoriesName');
        this.nameCategory = ActionProfitCost.getCategoryName('nameCategory');
        this.selectProfitCost = document.getElementById('selectProfitCost') as HTMLSelectElement;
        this.categoriesSelect = document.getElementById('categoriesSelect') as HTMLSelectElement;
        this.editItemProfitCost = document.getElementById('editItemProfitCost');
        this.cancelCreateItemProfitCost = document.getElementById('cancelEditItemProfitCost');
        this.categories = [];

        //Присваивание в поля тип и категория значения редактируемой операции, чтобы пользователь их не исправил
        //для типа операции (доход/расход)
        this.setValueCategory(this.categoriesName, this.selectProfitCost);

        //для категории операции
        if (this.categoriesSelect) {
            this.categoriesSelect.innerHTML = "<option>" + this.nameCategory + "</option>";
            this.categoriesSelect.disabled = true;
        }


        //Получение категорий дохода/расхода при изменении select доход/расход
        this.selectProfitCost.onchange = () => {
            this.getCategories();
        }

        //Отправка запроса на редактирование единицы дохода/расхода
        if (this.editItemProfitCost) {
            this.editItemProfitCost.onclick = () => {
                this.editItem();
            }
        }

        //Отмена отправки запроса на редактирование единицы дохода/расхода
        if (this.cancelCreateItemProfitCost) {
            this.cancelCreateItemProfitCost.onclick = () => {
                ActionProfitCost.removeCategoriesInfo('categoriesName');
                ActionProfitCost.removeCategoriesInfo('idElement');
                ActionProfitCost.removeCategoriesInfo('nameCategory');
                location.href = '#/profit-cost';
            }
        }
    }

    private setValueCategory(nameLocalStorage: string | null, selectElement: HTMLSelectElement | null): HTMLSelectElement {
        if (nameLocalStorage === 'income') {
            (selectElement as HTMLSelectElement).value = 'доход';
            (selectElement as HTMLSelectElement).disabled = true;
        } else if (nameLocalStorage === 'expense') {
            (selectElement as HTMLSelectElement).value = 'расход';
            (selectElement as HTMLSelectElement).disabled = true;
        }
        return (selectElement as HTMLSelectElement);
    }

    private async editItem(): Promise<void> {
        const amount: HTMLInputElement | null = document.getElementById('amount') as HTMLInputElement;
        const date: HTMLInputElement | null  = document.getElementById('editing-profit-cost-date') as HTMLInputElement;
        const dateArray: string[] = date.value.split('.').reverse();
        const dateResponse: string = dateArray.join('-');
        const comment: HTMLInputElement | null = document.getElementById('comment') as HTMLInputElement;
        const element_id: number = +ActionProfitCost.getCategoryName('idElement')!;

        //Выполняем изменение операции
        const categoryArray: ProfitCostCategoryResponseType[] | DefaultResponseType = await CustomHttp.request(config.host + '/categories/' + this.categoriesName);
        const category_id: ProfitCostCategoryResponseType | undefined = (categoryArray as ProfitCostCategoryResponseType[]).find((item: ProfitCostCategoryResponseType) => {
            if (item.title === this.nameCategory) {
                return item;
            }
        })

        try {
            if (this.categoriesName && category_id) {
                if (!+amount.value || !dateResponse || !comment.value) {
                    alert('Имеются не заполненные поля! Необходимо заполнить все поля формы!')
                }
                const result: EditOperationType | DefaultResponseType = await CustomHttp.request(config.host + '/operations/' + element_id, "PUT", {
                    type: this.categoriesName,
                    amount: +amount.value,
                    date: dateResponse,
                    comment: comment.value,
                    category_id: category_id.id,
                });

                if ((result as DefaultResponseType).error) {
                    throw new Error((result as DefaultResponseType).message);
                } else {
                    ActionProfitCost.removeCategoriesInfo('categoriesName');
                    ActionProfitCost.removeCategoriesInfo('idElement');
                    ActionProfitCost.removeCategoriesInfo('nameCategory');
                    location.href = '#/profit-cost';
                }
            }
        } catch (error) {
            console.log(error);
        }

    }

    private async getCategories(): Promise<void> {
        try {
            let selectProfitCostActual: HTMLSelectElement | null = document.getElementById('selectProfitCost') as HTMLSelectElement;
            let name: string = '';
            if ((selectProfitCostActual as HTMLSelectElement).value === 'доход') {
                name = 'income';
                ActionProfitCost.removeCategoriesInfo('categoriesName');
                ActionProfitCost.setCategoriesInfo('categoriesName', 'income');
            } else if (selectProfitCostActual.value === 'расход') {
                name = 'expense';
                ActionProfitCost.removeCategoriesInfo('categoriesName');
                ActionProfitCost.setCategoriesInfo('categoriesName', 'expense');
            }

            if (name) {
                this.categories  = await this.responseCategories('/categories/' + name);
                this.setCategoriesToSelect();
            } else {
                this.removeCategoriesToSelect();
                throw new Error('В select доход/расход отсутствует значение');
            }
        } catch (error) {
            console.log(error);
        }
    }

    private async responseCategories(hashResponse: string): Promise<ProfitCostCategoriesResponseType[] | DefaultResponseType>  {
        try {
            const response: ProfitCostCategoriesResponseType[] | DefaultResponseType = await CustomHttp.request(config.host + hashResponse);
            if ((response as DefaultResponseType).error) {
                throw new Error((response as DefaultResponseType).message);
            } else {
                return response;
            }
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    private setCategoriesToSelect(): void {
        if (this.categories) {
            this.removeCategoriesToSelect();
            for (let i = 0; i < (this.categories as ProfitCostCategoriesResponseType[]).length; i++) {
                const category = (this.categories as unknown as ProfitCostCategoryResponseType[])[i];
                const optionElement: HTMLElement = document.createElement('option');
                optionElement.setAttribute('id', category.id.toString());
                optionElement.setAttribute('value', category.title);
                optionElement.innerText = category.title;
                (this.categoriesSelect as HTMLElement).append(optionElement);
            }
        }
    }

    private removeCategoriesToSelect(): void {
        if (this.categoriesSelect) {
            this.categoriesSelect.innerHTML = '';
        }
    }
}
