# Cornerstone
All codes can be found within category.js here https://github.com/mp1pro/special-items-bigcommerce/blob/master/assets/js/theme/category.js
and https://github.com/mp1pro/special-items-bigcommerce/blob/master/templates/pages/category.html

The store is at https://test442.mybigcommerce.com/ and the preview code is k7cc4hbw4q

## Swap Image Feature

This was implemented by loading the swapImage() function within the onReady function. Then used the built in data point 'this.context.categoryProducts' to fetch all the images associated with the products in the given category. Then used javascripts "mouseover" and "mouseout" event to swap the images.

## Add all products from category to cart

used the built in data point 'this.context.categoryProducts' to fetch all the products belonging to a respectice category. Stored the lineitems in the correct format. Then made a call to getCart to check if there are any existing carts, if there is none, a cart is created and the lineitems are added. 

## Remove all items from cart

Made initial call to getCart, if a cart exist, the cart id is stored. Then an api call is made to the storefront along with the cart id to have the cart removed. 

## Add to cart button

The add to cart button was created in category.html as a div tag

## Remove all from cart button

within the onReady function, checkCart() is called, which calls getCart(), if a cart id is returned, then we display the button using style attributes (this is for page load). The button is also displayed if items were added to the cart within the promise of getCart()

## User Notifications

Both notification, "item was added" and "all items were removed" were implemented within the promises of the deleteCart() and createCart() functions. The display of the notifications were toggled using style attributes. 

## code snippets

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
