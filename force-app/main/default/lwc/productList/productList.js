import { LightningElement, track, wire } from 'lwc';
import getStoredProducts from '@salesforce/apex/ProductService.getStoredProducts';
import fetchAndStoreProducts from '@salesforce/apex/ProductService.fetchAndStoreProducts';

export default class ProductList extends LightningElement {
    @track products;
    @track counting;
    @track error;

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
}
