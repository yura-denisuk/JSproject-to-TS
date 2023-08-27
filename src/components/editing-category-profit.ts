import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {BuildingElement} from "../services/building-element";
import {Balance} from "../services/balance";


export class EditingCategoryProfit {
    readonly idElement: string | number | null;
    private newNameCategoryProfit: HTMLInputElement | null;
    readonly editCategoryProfitButton: HTMLElement | null;
    readonly cancelEditCategoryProfitButton: HTMLElement | null;

    constructor() {
        Balance.setActualBalance();
        this.idElement = BuildingElement.getIdElement();
        this.newNameCategoryProfit = document.getElementById('newNameCategoryProfit') as HTMLInputElement;

        this.editCategoryProfitButton = document.getElementById('editCategoryProfitButton');
        if (this.editCategoryProfitButton) {
            this.editCategoryProfitButton.onclick = () => {
                this.editCategoryProfit();
            }
        }


        this.cancelEditCategoryProfitButton = document.getElementById('cancelEditCategoryProfitButton');
        if (this.cancelEditCategoryProfitButton) {
            this.cancelEditCategoryProfitButton.onclick = () => {
                localStorage.removeItem('profit');
                BuildingElement.canselActionCategory('profit');
            }
        }
    }

    private async editCategoryProfit(): Promise<void> {
        try {
            if ((this.newNameCategoryProfit as HTMLInputElement).value) {
                const response = await CustomHttp.request(config.host + '/categories/income/' + this.idElement,
                    "PUT", {
                        "title": (this.newNameCategoryProfit as HTMLInputElement).value
                    });

                if (!response) {
                    throw new Error("Неправильно отправлен запрос на изменение категории!");
                } else {
                    localStorage.removeItem('idElement');
                    location.href = '#/profit';
                }
            } else {
                alert('Введите наименование категории!');
            }
        } catch (error) {
            console.log(error);
        }
    }
}