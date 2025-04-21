import { LightningElement, track, wire } from 'lwc';
import getStoredProducts from '@salesforce/apex/ProductService.getStoredProducts';
import fetchAndStoreProducts from '@salesforce/apex/ProductService.fetchAndStoreProducts';
import getCategories from '@salesforce/apex/ProductService.getCategories'; 
import getBrands from '@salesforce/apex/ProductService.getBrands';   
import getFilteredProducts from '@salesforce/apex/ProductService.getFilteredProducts';

export default class ProductList extends LightningElement {
    @track products;
    @track counting;
    @track error;

    @track categories = [];
    @track brands = [];
    @track selectedCategory = '';
    @track selectedBrand = '';


    connectedCallback() {   
        this.handleFetch();
    }

    // Fetch categories
    @wire(getCategories)
    wiredCategories({ error, data }) {
        if (data) {
            this.categories = data.map(category => ({ label: category, value: category }));
        } else if (error) {
            this.error = error.body.message;
        }
    }

    // Fetch brands
    @wire(getBrands)
    wiredBrands({ error, data }) {
        if (data) {
            this.brands = data.map(brand => ({ label: brand, value: brand }));
        } else if (error) {
            this.error = error.body.message;
        }
    }

    @wire(getStoredProducts)
    wiredProducts({ error, data }) {
        if (data) {
            this.products = data;
            this.counting = data.length;
            this.error = undefined;
        } else if (error) {
            this.error = error.body.message;
            this.products = undefined;
        }
    }

    handleFetch() {
        fetchAndStoreProducts()
            .then(() => {
                return getStoredProducts()
                    .then(result => {
                        this.products = result;
                    });
            })
            .catch(error => {
                this.error = error.body.message;
            });
    }

    handleCategoryChange(event) {
        this.selectedCategory = event.target.value;
        this.filterProducts();
    }
    
    handleBrandChange(event) {
        this.selectedBrand = event.target.value;
        this.filterProducts();
    }
    
    filterProducts() {
        this.products = undefined;
        this.counting = undefined;
        this.error = undefined;

        getFilteredProducts({ category: this.selectedCategory, brand: this.selectedBrand })
            .then((result) => {
                this.products = result;
                this.counting = result.length;
                this.error = undefined;
            })
            .catch((error) => {
                this.error = error.body.message;
                this.products = undefined;
            });
    }
}
