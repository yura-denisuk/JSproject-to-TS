import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {BuildingElement} from "../services/building-element";
import {Balance} from "../services/balance";


export class EditingCategoryCost {
    readonly idElement: string | number | null;
    private newNameCategoryCost: HTMLInputElement | null;
    readonly editCategoryCostButton: HTMLElement | null;
    readonly cancelEditCategoryCostButton: HTMLElement | null;

    constructor() {
        Balance.setActualBalance();
        this.idElement = BuildingElement.getIdElement();
        this.newNameCategoryCost = document.getElementById('newNameCategoryCost') as HTMLInputElement;

        this.editCategoryCostButton = document.getElementById('editCategoryCostButton');
        if (this.editCategoryCostButton) {
            this.editCategoryCostButton.onclick = () => {
                this.editCategoryCost();
            }
        }

        this.cancelEditCategoryCostButton = document.getElementById('cancelEditCategoryCostButton');
        if (this.cancelEditCategoryCostButton) {
            this.cancelEditCategoryCostButton.onclick = () => {
                localStorage.removeItem('cost');
                BuildingElement.canselActionCategory('cost');
            }
        }
    }

    private async editCategoryCost(): Promise<void> {
        try {
            if ((this.newNameCategoryCost as HTMLInputElement).value) {
                const response = await CustomHttp.request(config.host + '/categories/expense/' + this.idElement,
                    "PUT", {
                        "title": (this.newNameCategoryCost as HTMLInputElement).value
                    });

                if (!response) {
                    throw new Error("Неправильно отправлен запрос на изменение категории!");
                } else {
                    localStorage.removeItem('idElement');
                    location.href = '#/cost';
                }
            } else {
                alert('Введите наименование категории!');
            }
        } catch (error) {
            console.log(error);
        }
    }
}