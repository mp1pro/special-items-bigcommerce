import { hooks } from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import compareProducts from './global/compare-products';
import FacetedSearch from './common/faceted-search';
import { createTranslationDictionary } from '../theme/common/utils/translations-utils';

export default class Category extends CatalogPage {
    constructor(context) {
        super(context);
        this.validationDictionary = createTranslationDictionary(context);
    }

    setLiveRegionAttributes($element, roleType, ariaLiveStatus) {
        $element.attr({
            role: roleType,
            'aria-live': ariaLiveStatus,
        });
    }

    makeShopByPriceFilterAccessible() {
        if (!$('[data-shop-by-price]').length) return;

        if ($('.navList-action').hasClass('is-active')) {
            $('a.navList-action.is-active').focus();
        }

        $('a.navList-action').on('click', () => this.setLiveRegionAttributes($('span.price-filter-message'), 'status', 'assertive'));
    }

    onReady() {
        this.swapImage();
        
        this.checkCart();
        
        this.arrangeFocusOnSortBy();

        $('[data-button-type="add-cart"]').on('click', (e) => this.setLiveRegionAttributes($(e.currentTarget).next(), 'status', 'polite'));
        
        $('[data-button-type="add-all-cart"]').on('click', (e) => this.addAll($(e.currentTarget).next(), 'status', 'polite'));
        
        $('[data-button-type="remove-all-cart"]').on('click', (e) => this.removeAll($(e.currentTarget).next(), 'status', 'polite'));

        this.makeShopByPriceFilterAccessible();

        compareProducts(this.context);

        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }

        $('a.reset-btn').on('click', () => this.setLiveRegionsAttributes($('span.reset-message'), 'status', 'polite'));

        this.ariaNotifyNoProducts();
    }
    
    removeAll(){
        function getCart(url) {
            return fetch(url, {
                method: "GET",
                credentials: "same-origin"
            })
            .then(response => response.json());
        };
        function deleteCart(url, cartId) {
            return fetch(url + cartId, {
                method: "DELETE",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",}
            })
            .then(response => response.json());
        };

        getCart('/api/storefront/carts')
        .then(data => { 
            if(data.length !== 0){
                //console.log('cart todelete',data[0].lineItems.physicalItems);
                //let items = data[0].lineItems.physicalItems;
                let cartId = data[0].id;
                
                console.log('cart id', typeof cartId);
                
                $(".removeAll").attr("style", "display:none;background-color:beige;");
                $(".added").attr("style", "display:none;background-color:green;width:50%;color:white;");
                $(".removed").attr("style", "display:block;background-color:orange;width:50%;color:black;");
                
                deleteCart(`/api/storefront/carts/`, cartId)
                .catch(error => console.log(error));
        

                

            }
        })
        .catch(error => console.error(error));
    }
    
    checkCart(){
        function getCart(url) {
            return fetch(url, {
                method: "GET",
                credentials: "same-origin"
            })
            .then(response => response.json());
        };
        getCart('/api/storefront/carts')
        .then(data => { 
            if(data.length !== 0){
                console.log('cart returned',data)
                $(".removeAll").attr("style", "display:inline-block;background-color:beige;");
            }
        })
        .catch(error => console.error(error));
        
        
    }
    
    addAll(){
        let lineItems = [];
        let outerItes = [];
        this.context.categoryProducts.forEach(function(e, i) {
            
                lineItems.push({"quantity": 1, "productId": e.id});
            
        });
        let items = {lineItems};
        console.log('lineItems', items);
        //alert('test');
        function getCart(url) {
            return fetch(url, {
                method: "GET",
                credentials: "same-origin"
            })
            .then(response => response.json());
        };
        
        function createCart(url, cartItems) {
            return fetch(url, {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json"},
                body: JSON.stringify(cartItems),
            })
            .then(response => response.json());
        };
        
        function addCartItem(url, cartId, cartItems) {
            return fetch(url + cartId + '/items', {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json"},
                body: JSON.stringify(cartItems),
            })
            .then(response => response.json());
        };
        
        getCart('/api/storefront/carts')
        .then(data => { 
            if(data.length === 0){
                console.log('no cart returned',items);
                
                
                createCart(`/api/storefront/carts`, items)
                .then((data) => {
                    if(data !== "" ){
                        $(".added").attr("style", "display:block;background-color:green;width:50%;color:white;");
                        $(".removeAll").attr("style", "display:inline-block;background-color:beige;");
                    }
                })
                .catch(error => console.error(error));
                
            }
            else{
                //console.log('cart cexist', data[0].id);
                addCartItem(`/api/storefront/carts/`, data[0].id, items)
                .then(data => {
                    if(data !== "" ){
                        $(".added").attr("style", "display:block;background-color:green;width:50%;color:white;");
                    }
                })
                .catch(error => console.error(error));

            }
        })
        .catch(error => console.error(error));

    }
    
    swapImage() {
        console.log('context',this);
        let image1 = '';
        let image2 = '';
        let images = [];
        let imagess = [];
        //console.log('productspercat',e);
        this.context.categoryProducts.forEach(function(e, i) {
            e.images.forEach(function(a, b) {
                images.push(a);
            })
        });
        
        $('.card-image')
        .on('mouseover', function() {
            
            //console.log('hover',this.alt);
            //console.log('images',images);
            imagess = images.filter(element => element.alt === this.alt);
            //console.log('imagess',imagess);
            
            let first = imagess[0].data;
            let second = imagess[1].data;
            image1 = first.replace('{:size}', '500x659');
            image2 = second.replace('{:size}', '500x659');
            //console.log('image1',image1);
            //console.log('image2',image2);
            $(this).attr({src: image2, srcset: image2});
        }).on('mouseout', function() {
            $(this).attr({src:image1, srcset:image1});
        });
    }

    ariaNotifyNoProducts() {
        const $noProductsMessage = $('[data-no-products-notification]');
        if ($noProductsMessage.length) {
            $noProductsMessage.focus();
        }
    }

    initFacetedSearch() {
        const {
            price_min_evaluation: onMinPriceError,
            price_max_evaluation: onMaxPriceError,
            price_min_not_entered: minPriceNotEntered,
            price_max_not_entered: maxPriceNotEntered,
            price_invalid_value: onInvalidPrice,
        } = this.validationDictionary;
        const $productListingContainer = $('#product-listing-container');
        const $facetedSearchContainer = $('#faceted-search-container');
        const productsPerPage = this.context.categoryProductsPerPage;
        const requestOptions = {
            config: {
                category: {
                    shop_by_price: true,
                    products: {
                        limit: productsPerPage,
                    },
                },
            },
            template: {
                productListing: 'category/product-listing',
                sidebar: 'category/sidebar',
            },
            showMore: 'category/show-more',
        };

        this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
            $productListingContainer.html(content.productListing);
            $facetedSearchContainer.html(content.sidebar);

            $('body').triggerHandler('compareReset');

            $('html, body').animate({
                scrollTop: 0,
            }, 100);
        }, {
            validationErrorMessages: {
                onMinPriceError,
                onMaxPriceError,
                minPriceNotEntered,
                maxPriceNotEntered,
                onInvalidPrice,
            },
        });
    }
}
