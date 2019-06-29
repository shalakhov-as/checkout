import { Component, OnInit } from '@angular/core';
import { stringify } from '@angular/compiler/src/util';
import { CommaExpr } from '@angular/compiler';

/** Класс айтема */
export class Item{

    readonly id: number;
    readonly name: string;
    readonly description: string;
    readonly timestamp: number;
    readonly price: number;
    readonly category: Category;
    readonly company: Company;

    public get date(): Date {
        return new Date(this.timestamp);
    }

    public get dateString(): string {
        let options = { year: 'numeric', month: '2-digit', day: 'numeric' };
        return this.date.toLocaleDateString('ru-RU', options);
    }
    
    constructor(name: string, price: number, timestamp: number, category: Category, company: Company) {
        this.name = name;
        this.price = price;
        this.category = category;
        this.company = company;
        this.timestamp = timestamp;
    }

}

/** Класс категории айтемов */
export class Category {

    readonly key: string;
    readonly name: string;
    readonly description: string;
    readonly color: string;

    constructor(key: string, name: string, color: string){
        this.key = key;
        this.name = name;
        this.color = color;
    }
}

/** Класс производителя айтемов */
export class Company {

    readonly key: string;
    readonly name: string;
    readonly description: string;
    readonly color: string;

    constructor(key: string, name: string, color: string){
        this.key = key;
        this.name = name;
        this.color = color;
    }
}

/** Модель представления основного экрана */
@Component({
    selector: 'purchase-app',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit{ 

    categories: Category[] =
    [
        new Category("circles", "Кружки", "rgb(189, 84, 84)"),
        new Category("quads", "Квадратики", "rgb(51, 134, 93)"),
        new Category("polys", "Треугольнички", "rgb(204, 192, 86)"),
        new Category("diamonds", "Ромбики", "rgb(28, 98, 179)")
    ]

    companies: Company[] = 
    [
        new Company("cube", "Куб", "rgb(51, 134, 93)"),
        new Company("sphere", "Шар", "rgb(189, 84, 84)"),
        new Company("cylinder", "Цилиндр", "rgb(28, 98, 179)"),
        new Company("brick", "Параллелепипед", "rgb(204, 192, 86)"),
    ]

    items: Item[] = 
    [
        new Item("Огурец", 1221324, 1561727858000, this.categories[0], this.companies[1]),
        new Item("Помидор", 124.43, 1561727858000, this.categories[1], this.companies[2]),
        new Item("Ананас", 12.3, 1561727858000, this.categories[2], this.companies[2]),
        new Item("Апельсин", 124.34, 1561727858000, this.categories[3], this.companies[1]),
        new Item("Яблоко", 124323, 1561727858000, this.categories[3], this.companies[2]),
        new Item("Капуста", 1.4, 1561727858000, this.categories[1], this.companies[1])
    ];

    /** Добавляет новый айтем в коллекцию */
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
        
        this.items.push(new Item(text, price, (new Date()).getTime(), itemCategory, this.companies[0]));
    }

    /** Сериализует данные в файл и сохраняет его на диск */
    downloadData(){
        console.log("downloading data: " + this.items.length + " items");

        if (this.items.length > 0){
            
            let serializedItems = this.serializeData();

            // сохраняем json в файл
            let file = new Blob([serializedItems], {type: 'text/json'});
            let a = document.createElement("a");
            a.href = URL.createObjectURL(file);
            a.download = 'items.txt';

            a.click();
        }
    }
    
    /** Сохраняет данные в local storage */
    saveData(){
        console.log("saving data: " + this.items.length + " items");
        let serializaedData = this.serializeData();
        localStorage.setItem('checkout_data', serializaedData);
        console.log("data has been saved");
    }

    /** Загружает данные из local storage */
    loadData(){
        console.log("loading data from local storage...");

        let jsonData = localStorage.getItem('checkout_data');
        if (jsonData == undefined || jsonData == null){
            return;
        }

        this.deserializeData(jsonData);

        console.log(`data has been loaded (${this.items.length} items)`);
    }

    /** Импортирует данные из текстового файла */
    importData(){

        console.log("loading data from file...");

        // создаём виртуальный элемент ввода
        let input = document.createElement('input');
        input.type="file";
        // ссылка на компонент
        let component = this;

        // функция для импорта
        input.onchange = function(){

            let file = input.files[0];
            let textType = /text.*/;

            if (file.type.match(textType)) {

                let reader = new FileReader();
                reader.onload = function(e) {
                    component.deserializeData(reader.result as string);
                }
                reader.readAsText(file);    

            } else {
                alert("File not supported!");
            }
    
            console.log(`data has been loaded (${component.items.length} items)`);
        }

        // "кликаем" по инпуту, чтобы активировать открытие файла
        input.click();
    }

    /** Сериализует объекты модели в json */
    serializeData(){

        /* Подготовка категорий */
        let categories = [];
        for(var i = 0; i < this.categories.length; i++){
            let cat = this.categories[i];
            let serializedCategory = { 
                key: cat.key,
                name: cat.name,
                description: cat.description,
                color: cat.color
            };

            categories[i] = serializedCategory;
        }

        /* Подготовка компаний */
        let companies = [];
        for(var i = 0; i < this.companies.length; i++){
            let comp = this.companies[i];
            let serializedCompany = { 
                key: comp.key,
                name: comp.name,
                description: comp.description,
                color: comp.color
            };

            companies[i] = serializedCompany;
        }

        /* Подготовка айтемов */
        let items = [];
        for(var i = 0; i < this.items.length; i++){
            let item = this.items[i];
            let serializedItem = { 
                id: item.id,
                name: item.name,
                description: item.description,
                price: item.price,
                timestamp: item.timestamp,
                category: item.category.key,
                company: item.company.key,
            };

            items[i] = serializedItem;
        }

        /* Сериализация данных */
        let data = { categories: categories, companies: companies, items: items }
        return JSON.stringify(data, null, '  ');
    }

    /** Перезаписывает все коллекции модели объектами из json-строки */
    deserializeData(serializedData: string){

        let data = JSON.parse(serializedData);

        let categoriesDict = new Map<string, Category>();
        let companiesDict = new Map<string, Company>();

        // --- загрузка категорий ---
        this.categories = [];
        for (let i = 0; i < data.categories.length; i++){
            let key = data.categories[i].key;
            let name = data.categories[i].name;
            let description = data.categories[i].description;
            let color = data.categories[i].color;

            let cat = new Category(key, name, color);
            this.categories[i] = cat;
            categoriesDict[cat.key] = cat;
        }

        // --- загрузка компаний ---
        this.companies = [];
        for (let i = 0; i < data.companies.length; i++){
            let key = data.companies[i].key;
            let name = data.companies[i].name;
            let description = data.companies[i].description;
            let color = data.companies[i].color;

            let comp = new Company(key, name, color);
            this.companies[i] = comp;
            companiesDict[comp.key] = comp;
        }

        // --- загрузка компаний ---
        this.items = [];
        for (let i = 0; i < data.items.length; i++){
            let id = data.items[i].key;
            let name = data.items[i].name;
            let description = data.items[i].description;
            let price = data.items[i].price;
            let timestamp = data.items[i].timestamp;
            let category = categoriesDict[data.items[i].category];
            let company = companiesDict[data.items[i].company]
            this.items[i] = new Item(name, price, timestamp, category, company);
        }
    }

    ngOnInit() { 
        // инициализация компонента
    }
}
