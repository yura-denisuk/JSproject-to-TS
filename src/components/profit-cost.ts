import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {BuildingElement} from "../services/building-element";
import {Balance} from "../services/balance";
import "air-datepicker";
import AirDatepicker from "air-datepicker";
import {Filter} from "../services/filter";
import {DefaultResponseType} from "../types/default-response.type";
import {CreateOperationType} from "../types/create-operation.type";

export class ProfitCost {
    readonly buttons: HTMLCollectionOf<HTMLButtonElement>;
    private buttonInterval: HTMLElement | null;
    readonly createProfitButton: HTMLElement | null;
    readonly createCostButton: HTMLElement | null;
    readonly tableElement: HTMLElement | null;
    readonly deleteOperation: HTMLElement | null;
    readonly cancelDeleteOperation: HTMLElement | null;

    constructor() {
        Balance.setActualBalance();
        this.buttons = document.getElementsByClassName('btn-filter') as HTMLCollectionOf<HTMLButtonElement>;
        this.buttonInterval = document.getElementById('button-interval');

        //Подключаем airdatapicker для задания промежутка времени в фильтре
        new AirDatepicker('#with');
        new AirDatepicker('#before');

        //Переход для создания вида категории доход
        this.createProfitButton = document.getElementById('createProfit');
        if (this.createProfitButton) {
            this.createProfitButton.onclick = () => {
                location.href = '#/create-profit-cost';
            }
        }

        //Переход для создания вида категории расход
        this.createCostButton = document.getElementById('createCost');
        if (this.createCostButton) {
            this.createCostButton.onclick = () => {
                location.href = '#/create-profit-cost';
            }
        }

        //Находим DOM-элемент, в который будет встраиваться таблица
        this.tableElement = document.getElementById('table');

        //Загрузка операций дохода/расхода "Сегодня" по умолчанию
        window.addEventListener('DOMContentLoaded', this.initShowFilterElementDefault());

        //Загрузка фильтра
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].onclick = () => {
                this.initShowFilterElement(this.buttons[i], (this.tableElement as HTMLElement));

                //Вешаем на кнопки класс active
                for (let j = 0; j < this.buttons.length; j++) {
                    this.buttons[j].classList.remove('active');
                }

                return this.buttons[i].classList.add('active');

            }
        }

        //Обрабатываем модальное окно удаления операции
        this.deleteOperation = document.getElementById('deleteOperation');
        if (this.deleteOperation) {
            this.deleteOperation.onclick = () => {
                this.deleteOperationProfitCost();
            }
        }

        this.cancelDeleteOperation = document.getElementById('cancelDeleteOperation');
        if (this.cancelDeleteOperation) {
            this.cancelDeleteOperation.onclick = () => {
                localStorage.removeItem('idElement');
            }
        }

        //Обрабатываем разблокировку кнопки "Интервал" при наличии дат в полях ввода
        Filter.activeButtonInterval();
    }

    private initShowFilterElementDefault(): any  {
        return Filter.showFilterElementDefault(this.tableElement);
    }

    private async initShowFilterElement(buttons: HTMLElement, tableElement: HTMLElement): Promise<CreateOperationType[]> {
        const result = await Filter.showFilterElement(buttons, tableElement);
        return result || [];
    }



    private async deleteOperationProfitCost(): Promise<void> {
        let operationId: number = BuildingElement.getIdElement();
        try {
            const response: DefaultResponseType = await CustomHttp.request(config.host + '/operations/' + operationId,
                "DELETE");
            if (response.error) {
                throw new Error(response.message);
            } else {
                localStorage.removeItem('idElement');
                location.href = '#/profit-cost';
            }
        } catch (error) {
            console.log(error);
        }
        await Balance.changeBalanceAfterRemoveOperation(operationId);
    }
}

