import {Main} from "../components/main";
import {ProfitCost} from "../components/profit-cost";
import {Sing} from "../components/sing";
import {Auth} from "../services/auth";
import {Login} from "../components/login";
import {Profit} from "../components/profit";
import {CreateCategoryProfit} from "../components/create-category-profit";
import {EditingCategoryProfit} from "../components/editing-category-profit";
import {Cost} from "../components/cost";
import {CreateCategoryCost} from "../components/create-category-cost";
import {EditingCategoryCost} from "../components/editing-category-cost";
import {CreateProfitCost} from "../components/create-profit-cost";
import {EditingProfitCost} from "../components/editing-profit-cost";
import {RouteType} from "../types/route.type";

export class Router {
    readonly menu: HTMLElement | null;
    readonly content: HTMLElement | null;
    readonly title: HTMLElement | null;
    private routes: RouteType[];

    constructor() {
        this.menu = document.getElementById('menu');
        this.content = document.getElementById('content');
        this.title = document.getElementById('title');

        this.routes = [
            {
                route: '#/',
                title: 'Главная',
                template: 'templates/main.html',
                load: () => {
                    new Main();
                }
            },
            {
                route: '#/profit',
                title: 'Доходы',
                template: 'templates/profit.html',
                load: () => {
                    new Profit();
                }
            },
            {
                route: '#/create-category-profit',
                title: 'Создание категории дохода',
                template: 'templates/create-category-profit.html',
                load: () => {
                    new CreateCategoryProfit();
                }
            },
            {
                route: '#/editing-category-profit',
                title: 'Редактирование категории дохода',
                template: 'templates/editing-category-profit.html',
                load: () => {
                    new EditingCategoryProfit();
                }
            },
            {
                route: '#/cost',
                title: 'Расходы',
                template: 'templates/cost.html',
                load: () => {
                    new Cost();
                }
            },
            {
                route: '#/create-category-cost',
                title: 'Создание категории расхода',
                template: 'templates/create-category-cost.html',
                load: () => {
                    new CreateCategoryCost();
                }
            },
            {
                route: '#/editing-category-cost',
                title: 'Редактирование категории расхода',
                template: 'templates/editing-category-cost.html',
                load: () => {
                    new EditingCategoryCost();

                }
            },
            {
                route: '#/profit-cost',
                title: 'Доходы и расходы',
                template: 'templates/profit-cost.html',
                load: () => {
                    new ProfitCost();
                }
            },
            {
                route: '#/create-profit-cost',
                title: 'Создание дохода/расхода',
                template: 'templates/create-profit-cost.html',
                load: () => {
                    new CreateProfitCost();
                }
            },
            {
                route: '#/editing-profit-cost',
                title: 'Редактирование дохода/расхода',
                template: 'templates/editing-profit-cost.html',
                load: () => {
                    new EditingProfitCost();
                }
            },
            {
                route: '#/login',
                title: 'Войти',
                template: 'templates/login.html',
                load: () => {
                    new Login();
                }
            },
            {
                route: '#/sing',
                title: 'Регистрация',
                template: 'templates/sing.html',
                load: () => {
                    new Sing();
                }

            },

        ]
    }


    public async openRoute(): Promise<void> {

        if (!localStorage.getItem(Auth.accessTokenKey)) {
            if (window.location.hash !== '#/login') {
                window.location.hash = '#/login';
                return;
            }
        }

        if (this.menu && this.content && this.title) {
            const currentHash: string = window.location.hash;
            if (currentHash === '' || currentHash === '#/sing') {
                this.menu.style.display = 'none';
                const singRoute = this.routes.find((route) => route.route === '#/sing');
                if (!singRoute) {
                    window.location.href = '#/login';
                    return;
                }
                this.content.innerHTML = await fetch(singRoute.template).then((response) => response.text());
                this.title.innerText = singRoute.title;
                singRoute.load();
            } else if (currentHash === '#/login') {
                this.menu.style.display = 'none';
                const loginRoute = this.routes.find((route) => route.route === '#/login');
                if (!loginRoute) {
                    window.location.href = '#/login';
                    return;
                }
                this.content.innerHTML = await fetch(loginRoute.template).then((response) => response.text());
                this.title.innerText = loginRoute.title;
                loginRoute.load();
            } else {
                this.menu.style.display = 'block';
                const currentRoute = this.routes.find((route) => route.route === currentHash);
                if (!currentRoute) {
                    this.content.innerHTML = ''; // Очищаем контент или показываем страницу ошибки
                    this.title.innerText = 'Ошибка';
                    return;
                }
                this.content.innerHTML = await fetch(currentRoute.template).then((response) => response.text());
                this.title.innerText = currentRoute.title;
                currentRoute.load();
            }
        } else {
            if (this.content && this.title) {
                const newRoute = this.routes.find((item) => item.route === window.location.hash);
                if (!newRoute) {
                    window.location.href = '#/login';
                    return;
                }

                this.content.innerText = await fetch(newRoute.template).then((response) => response.text());
                this.title.innerText = newRoute.title;
                newRoute.load();
            }
        }
    }
}





