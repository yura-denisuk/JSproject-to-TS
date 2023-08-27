import {Auth} from "../services/auth";
import "air-datepicker";
import {Chart, ChartConfiguration, ChartItem} from 'chart.js/auto'
import {ChangeDate} from "../services/changeDate";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Balance} from "../services/balance";
import {Filter} from "../services/filter";
import {ProfitCostCategoryResponseType} from "../types/profit-cost-category-response.type";
import {DefaultResponseType} from "../types/default-response.type";
import {OperationsType} from "../types/operations.type";
import {UserInfoType} from "../types/user-info.type";
import AirDatepicker from "air-datepicker";

export class Main {
    private  categoryNameProfitArray: string[];
    private  categoryValueProfitArray: number[];
    private  categoryColorProfitArray: string[];
    private  categoryNameCostArray: string[];
    private  categoryValueCostArray: number[];
    private  categoryColorCostArray: string[];
    private result: OperationsType[] | DefaultResponseType;
    private refreshToken: string | null;
    private myChartProfit!: Chart;
    private myChartCost!: Chart;
    readonly canvasProfit: HTMLCanvasElement | null;
    readonly canvasCost: HTMLCanvasElement | null;
    private userName: HTMLInputElement | null;
    readonly logoutElement: HTMLElement | null;
    readonly buttons: HTMLCollectionOf<HTMLButtonElement>;

    constructor() {
        Balance.setActualBalance();
        this.categoryNameProfitArray = [];
        this.categoryValueProfitArray = [];
        this.categoryColorProfitArray = [];
        this.categoryNameCostArray = [];
        this.categoryValueCostArray = [];
        this.categoryColorCostArray = [];
        this.result = [];
        this.refreshToken = null;
        this.userName = null;
        this.canvasProfit = document.getElementById('myChart-profit') as HTMLCanvasElement;
        this.canvasCost = document.getElementById('myChart-cost') as HTMLCanvasElement;

        //Обрабатываем разблокировку кнопки "Интервал" при наличии дат в полях ввода
        Filter.activeButtonInterval();

        //устанавливаем имя зарегистрированного пользователя внизу блока меню
        if (window.location.hash === '#/') {
            this.userName = document.getElementById('userName') as HTMLInputElement;
            this.userName.innerText = (Auth.getUserInfo() as UserInfoType).name + ' ' + (Auth.getUserInfo() as UserInfoType).lastName;
        }

        //реализуем функционал для кнопки выйти
        this.logoutElement = document.getElementById('logout');
        if (this.logoutElement) {
            this.logoutElement.onclick = async function () {
                await Auth.logout();
                return;
            }
        }

        //Поиск кнопок фильтра
        this.buttons = document.getElementsByClassName('btn-filter') as HTMLCollectionOf<HTMLButtonElement>;

        //Загружаем airdatapicker в поля выбора даты
        new AirDatepicker('#with');
        new AirDatepicker('#before');

        //Загрузка операций дохода/расхода "Сегодня" по умолчанию
        window.addEventListener('DOMContentLoaded', () => this.initShowFilterElement());

        //Загрузка фильтра
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].onclick = () => {
                this.initShowFilterElement(this.buttons[i]);

                //Вешаем на кнопки класс active
                for (let j = 0; j < this.buttons.length; j++) {
                    this.buttons[j].classList.remove('active');
                }
                return this.buttons[i].classList.add('active');
            }
        }

        this.initShowFilterElement();
    }

    private async initShowFilterElement(buttons: HTMLElement | null = null): Promise<void> {
        let actualDate: Date | string = new Date();
        let dateResponse: Date;
        let dateResponseArray: string[] = [];
        let decreaseDate: number;
        let actualDateFormat: string | HTMLInputElement;
        let responseDateFormat: string | HTMLInputElement;

        this.categoryNameProfitArray = [];
        this.categoryValueProfitArray = [];
        this.categoryColorProfitArray = [];
        this.categoryNameCostArray = [];
        this.categoryValueCostArray = [];
        this.categoryColorCostArray = [];
        if (this.myChartProfit) {
            this.myChartProfit.destroy();
        }
        if (this.myChartCost) {
            this.myChartCost.destroy();
        }


        try {
            if (buttons) {
                switch (buttons.innerText) {
                    case 'Неделя':
                        decreaseDate = actualDate.getTime() - 604800000;
                        dateResponse = new Date(decreaseDate);
                        actualDateFormat = ChangeDate.ChangeDateFormatFilter(actualDate.toLocaleDateString());
                        responseDateFormat = ChangeDate.ChangeDateFormatFilter(dateResponse.toLocaleDateString());
                        this.result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom=' + responseDateFormat + '&dateTo=' + actualDateFormat);
                        break;
                    case 'Месяц':
                        let actualDateMonthArray: string[] = actualDate.toLocaleDateString().split('.');
                        let newMonth: number = Number(actualDateMonthArray[1]) - 1;
                        dateResponseArray[0] = actualDateMonthArray[2];
                        dateResponseArray[1] = '0' + String(newMonth);
                        dateResponseArray[2] = actualDateMonthArray[0];
                        actualDateFormat = ChangeDate.ChangeDateFormatFilter(actualDate.toLocaleDateString());
                        responseDateFormat = dateResponseArray.join('-');
                        this.result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom=' + responseDateFormat + '&dateTo=' + actualDateFormat);
                        break;
                    case 'Год':
                        let actualDateYearArray: string[] = actualDate.toLocaleDateString().split('.');
                        let newYear: number = Number(actualDateYearArray[2]) - 1;
                        dateResponseArray[0] = String(newYear);
                        dateResponseArray[1] = actualDateYearArray[1];
                        dateResponseArray[2] = actualDateYearArray[0];
                        actualDateFormat = ChangeDate.ChangeDateFormatFilter(actualDate.toLocaleDateString());
                        responseDateFormat = dateResponseArray.join('-');
                        this.result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom=' + responseDateFormat + '&dateTo=' + actualDateFormat);
                        break;
                    case 'Все':
                        this.result = await CustomHttp.request(config.host + '/operations?period=all&dateFrom=&dateTo=');
                        break;
                    case 'Интервал':
                        responseDateFormat = document.getElementById('with') as HTMLInputElement;
                        actualDateFormat = document.getElementById('before') as HTMLInputElement;
                        if (responseDateFormat.value && actualDateFormat.value) {
                            this.result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom=' + ChangeDate.ChangeDateFormat(responseDateFormat) + '&dateTo=' + ChangeDate.ChangeDateFormat(actualDateFormat));
                            responseDateFormat.value = '';
                            actualDateFormat.value = '';
                        }
                        break;
                    default:
                        actualDate = ChangeDate.ChangeDateFormatFilter(actualDate.toLocaleDateString());
                        this.result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom=' + actualDate + '&dateTo=' + actualDate);
                        break;
                }
            } else {
                actualDate = ChangeDate.ChangeDateFormatFilter(actualDate.toLocaleDateString());
                this.result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom=' + actualDate + '&dateTo=' + actualDate);
            }


            if (!this.result && (this.result as DefaultResponseType).error) {
                throw new Error((this.result as DefaultResponseType).message);
            } else {
                let profitArray: OperationsType[] = (this.result as OperationsType[]).filter((item: OperationsType) => {
                    return item.type === 'income';
                });
                let costArray: OperationsType[] = (this.result as OperationsType[]).filter((item: OperationsType) => {
                    return item.type === 'expense';
                });

                console.log(profitArray);
                console.log(costArray);

                //Формирование данных для диаграммы Доходы
                try {
                    const profitCategory: ProfitCostCategoryResponseType[] | DefaultResponseType = await CustomHttp.request(config.host + '/categories/income');
                    if ((profitCategory as DefaultResponseType).error) {
                        throw new Error((profitCategory as DefaultResponseType).message);
                    } else {

                        for (let i = 0; i < (profitCategory as ProfitCostCategoryResponseType[]).length; i++) {
                            const categoryProfit = (profitCategory as ProfitCostCategoryResponseType[])[i];
                            this.categoryNameProfitArray[i] = categoryProfit.title;
                        }

                        for (let i = 0; i < this.categoryNameProfitArray.length; i++) {
                            this.categoryValueProfitArray[i] = 0;
                            for (let j = 0; j < profitArray.length; j++) {
                                if (this.categoryNameProfitArray[i] === profitArray[j].category) {
                                    this.categoryValueProfitArray[i] += profitArray[j].amount;
                                }
                            }
                        }

                        for (let i = 0; i < this.categoryValueProfitArray.length; i++) {
                            this.categoryColorProfitArray[i] = `hsla(${Math.random() * 360}, 100%, 50%, 1)`
                        }
                    }
                } catch (error) {
                    console.log(error);
                }

                //Загрузка диаграммы доходов
                let ctxProfit = this.canvasProfit;
                if (ctxProfit) {
                    this.myChartProfit = new Chart(ctxProfit, {
                        type: 'pie',
                        data: {
                            datasets: [{
                                data: this.categoryValueProfitArray,
                                background: this.categoryColorProfitArray
                            }],
                            labels: this.categoryNameProfitArray
                        },
                        options: {
                            responsive: true
                        }
                    } as unknown as ChartConfiguration);
                }

                //Формирование данных для диаграммы Расходы
                try {
                    const costCategory = await CustomHttp.request(config.host + '/categories/expense');
                    if (costCategory.error) {
                        throw new Error(costCategory.message);
                    } else {

                        for (let i = 0; i < costCategory.length; i++) {
                            this.categoryNameCostArray[i] = costCategory[i].title;
                        }

                        for (let i = 0; i < this.categoryNameCostArray.length; i++) {
                            this.categoryValueCostArray[i] = 0;
                            for (let j = 0; j < costArray.length; j++) {
                                if (this.categoryNameCostArray[i] === costArray[j].category) {
                                    this.categoryValueCostArray[i] += costArray[j].amount;
                                }
                            }
                        }

                        for (let i = 0; i < this.categoryValueCostArray.length; i++) {
                            this.categoryColorCostArray[i] = `hsla(${Math.random() * 360}, 100%, 50%, 1)`
                        }
                    }
                } catch (error) {
                    console.log(error);
                }

                //Загрузка диаграммы расходов
                let ctxCost = this.canvasCost;
                if (ctxCost) {
                    this.myChartCost = new Chart(ctxCost, {
                        type: 'pie',
                        data: {
                            datasets: [{
                                data: this.categoryValueCostArray,
                                background: this.categoryColorCostArray
                            }],
                            labels: this.categoryNameCostArray
                        },
                        options: {
                            responsive: true
                        }
                    } as unknown as ChartConfiguration)
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
}
