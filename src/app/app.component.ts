import { Component } from '@angular/core';

/** Класс айтема */
export class Item{

    readonly purchase: string;
    readonly price: number;
    readonly category: Category;

    public get color(): string {
        return this.category.color;
    }
    
    constructor(purchase: string, price: number, category: Category) {
        this.purchase = purchase;
        this.price = price;
        this.category = category;
    }

}

/** Класс категории айтемов */
export class Category {
    readonly name: string;
    readonly color: string;

    constructor(name: string, color: string){
        this.name = name;
        this.color = color;
    }
}

/** Класс производителя айтемов */
export class Company {
    readonly name: string;
    readonly color: string;

    constructor(name: string, color: string){
        this.name = name;
        this.color = color;
    }
}

@Component({
    selector: 'purchase-app',
    templateUrl: './app.component.html'
})
export class AppComponent { 

    categories: Category[] =
    [
        new Category("Кружки", "rgb(189, 84, 84)"),
        new Category("Квадратики", "rgb(51, 134, 93)"),
        new Category("Треугольнички", "rgb(204, 192, 86)"),
        new Category("Ромбики", "rgb(28, 98, 179)")
    ]

    items: Item[] = 
    [
        new Item("Огурец", 1221324, this.categories[0]),
        new Item("Помидор", 124.43, this.categories[1]),
        new Item("Ананас", 12.3, this.categories[2]),
        new Item("Апельсин", 124.34, this.categories[3]),
        new Item("Яблоко", 124323, this.categories[3]),
        new Item("Капуста", 1.4, this.categories[1])
    ];

    companies: Company[] = 
    [
        new Company("Куб", "rgb(51, 134, 93)"),
        new Company("Шар", "rgb(189, 84, 84)"),
        new Company("Цилиндр", "rgb(28, 98, 179)"),
        new Company("Параллелепипед", "rgb(204, 192, 86)"),
    ]

    addItem(text: string, price: number, category:string): void {
        if(text==null || text.trim()=="" || price==null)
            return;

        let itemCategory = this.categories[0];
        for(var i = 0; i < this.categories.length; i++){
            if (this.categories[i].name.toLowerCase().includes(category.toLowerCase())){
                itemCategory = this.categories[i];
                break;
            }
        }
        
        this.items.push(new Item(text, price, itemCategory));
    }
}