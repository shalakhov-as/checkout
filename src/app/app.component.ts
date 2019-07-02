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
    readonly company: Company;

    public get date(): Date {
        return new Date(this.timestamp);
    }

    public get dateString(): string {
        let options = { year: 'numeric', month: '2-digit', day: 'numeric' };
        return this.date.toLocaleDateString('ru-RU', options);
    }
    
    constructor(name: string, price: number, timestamp: number, company: Company) {
        this.name = name;
        this.price = price;
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
    readonly category: Category;

    constructor(key: string, name: string, category: Category){
        this.key = key;
        this.name = name;
        this.category = category;
    }
}

/** Модель представления основного экрана */
@Component({
    selector: 'purchase-app',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit{ 

    categories: Category[] = [];
    companies: Company[] = [];
    items: Item[] = [];

    /** Добавляет новый айтем в коллекцию */
    addItem(text: string, price: number, company:string): void {

        if(text==null || text.trim()=="" || price==null)
            return;

        let itemCompany = this.companies[0];
        for(var i = 0; i < this.companies.length; i++){
            if (this.companies[i].name.toLowerCase().includes(company.toLowerCase())){
                itemCompany = this.companies[i];
                break;
            }
        }
        
        this.items.push(new Item(text, price, (new Date()).getTime(), itemCompany));
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
                category: comp.category.key
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
                company: item.company.key
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
            let key : string = data.companies[i].key;
            let name : string = data.companies[i].name;
            let description : string = data.companies[i].description;
            let category : Category = categoriesDict[data.companies[i].category];

            let comp = new Company(key, name, category);
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
            let company = companiesDict[data.items[i].company]
            this.items[i] = new Item(name, price, timestamp, company);
        }
    }

    ngOnInit() { 
        this.loadData();
    }
}
