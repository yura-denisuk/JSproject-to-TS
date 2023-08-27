import {ChangeDate} from "./changeDate";
import {CustomHttp} from "./custom-http";
import config from "../../config/config";
import {BuildingElement} from "./building-element";
import {DefaultResponseType} from "../types/default-response.type";
import {CreateOperationType} from "../types/create-operation.type";

export class Filter {
    private static buttonInterval: HTMLButtonElement | null;

    public static activeButtonInterval(): void {
        this.buttonInterval = document.getElementById('button-interval') as HTMLButtonElement;

        //Обрабатываем разблокировку кнопки "Интервал" при наличии дат в полях ввода
        document.getElementById('with')?.addEventListener('focusout', () => {
            let withValue: HTMLInputElement | null = document.getElementById('with') as HTMLInputElement;
            let beforeValue: HTMLInputElement | null = document.getElementById('before') as HTMLInputElement;
            if (withValue && beforeValue) {
                if ((withValue as HTMLInputElement).value && (beforeValue as HTMLInputElement).value) {
                    (this.buttonInterval as HTMLButtonElement).disabled = false;
                }
            }
        })

        document.getElementById('before')?.addEventListener('focusout', () => {
            let withValue: HTMLInputElement | null = document.getElementById('with') as HTMLInputElement;
            let beforeValue: HTMLInputElement | null = document.getElementById('before') as HTMLInputElement;
            if (withValue && beforeValue) {
                if ((withValue as HTMLInputElement).value && (beforeValue as HTMLInputElement).value) {
                    (this.buttonInterval as HTMLButtonElement).disabled = false;
                }
            }
        })
    }

    public static async showFilterElementDefault(tableElement: HTMLElement | null = null): Promise<void> {
        let actualDate: any = new Date();
        actualDate = ChangeDate.ChangeDateFormatFilter(actualDate.toLocaleDateString());
        let result: CreateOperationType[] = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom=' + actualDate + '&dateTo=' + actualDate);
        if (tableElement) {
            BuildingElement.buildingTableProfitCost(result, tableElement);
        }
    }


    public static async showFilterElement(button: HTMLElement, tableElement: HTMLElement | null = null): Promise<CreateOperationType[] | undefined> {
        let actualDate: Date | string = new Date();
        let dateResponse: Date;
        let dateResponseArray: string[] = [];
        let decreaseDate: number;
        let actualDateFormat: string | HTMLInputElement;
        let responseDateFormat: string | HTMLInputElement;
        let result: CreateOperationType[] | DefaultResponseType = [];

        try {
            switch (button.innerText) {
                case 'Неделя':
                    decreaseDate = actualDate.getTime() - 604800000;
                    dateResponse = new Date(decreaseDate);
                    actualDateFormat = ChangeDate.ChangeDateFormatFilter(actualDate.toLocaleDateString());
                    responseDateFormat = ChangeDate.ChangeDateFormatFilter(dateResponse.toLocaleDateString());
                    result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom=' + responseDateFormat + '&dateTo=' + actualDateFormat);
                    break;
                case 'Месяц':
                    let actualDateMonthArray: string[] = actualDate.toLocaleDateString().split('.');
                    let newMonth: number = Number(actualDateMonthArray[1]) - 1;
                    dateResponseArray[0] = actualDateMonthArray[2];
                    dateResponseArray[1] = '0' + String(newMonth);
                    dateResponseArray[2] = actualDateMonthArray[0];
                    actualDateFormat = ChangeDate.ChangeDateFormatFilter(actualDate.toLocaleDateString());
                    responseDateFormat = dateResponseArray.join('-');
                    result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom=' + responseDateFormat + '&dateTo=' + actualDateFormat);
                    break;
                case 'Год':
                    let actualDateYearArray = actualDate.toLocaleDateString().split('.');
                    let newYear = Number(actualDateYearArray[2]) - 1;
                    dateResponseArray[0] = String(newYear);
                    dateResponseArray[1] = actualDateYearArray[1];
                    dateResponseArray[2] = actualDateYearArray[0];
                    actualDateFormat = ChangeDate.ChangeDateFormatFilter(actualDate.toLocaleDateString());
                    responseDateFormat = dateResponseArray.join('-');
                    result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom=' + responseDateFormat + '&dateTo=' + actualDateFormat);
                    break;
                case 'Все':
                    result = await CustomHttp.request(config.host + '/operations?period=all&dateFrom=&dateTo=');
                    break;
                case 'Интервал':
                    responseDateFormat = document.getElementById('with') as HTMLInputElement;
                    actualDateFormat = document.getElementById('before') as HTMLInputElement;
                    if (responseDateFormat.value && actualDateFormat.value) {
                        result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom=' + ChangeDate.ChangeDateFormat(responseDateFormat) + '&dateTo=' + ChangeDate.ChangeDateFormat(actualDateFormat));
                        responseDateFormat.value = '';
                        actualDateFormat.value = '';
                    }
                    break;
                default:
                    actualDate = ChangeDate.ChangeDateFormatFilter(actualDate.toLocaleDateString());
                    result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom=' + actualDate + '&dateTo=' + actualDate);
                    break;
            }

            if (!result && (result as DefaultResponseType).error) {
                throw new Error((result as DefaultResponseType).message);
            } else {
                if (tableElement) {
                    BuildingElement.buildingTableProfitCost((result as CreateOperationType[]), tableElement);
                }
                console.log((result as CreateOperationType[]));
                if (result) {
                    return (result as CreateOperationType[]);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
}

