/**
 *  Approve Add Product To Seller Transaction
 * @param {org.scms.network.seller.ReqApproveAddProductToSeller} data
 * @transaction
 */

async function ReqApproveAddProductToSeller(data) {
      var NS = "org.scms.network.seller";
      var factory = getFactory();

      var productRegistry = await getAssetRegistry("org.scms.network.product.Product");
      var product = await productRegistry.get(data.product_ID);
      var distributorRegistry = await getAssetRegistry("org.scms.network.distributor.Distributor");
      var distributor = await distributorRegistry.get(data.distributor_ID);
      var sellerRegistry = await getAssetRegistry("org.scms.network.seller.Seller");
      var seller = await sellerRegistry.get(data.seller_ID);
      checkSellerReqProductList1(seller.reqProductList, product.product_ID, distributor.distributor_ID);
      var IDpayment = product.product_ID.slice(4) + seller.seller_ID.slice(5) + distributor.gst_registration_number.slice(8, 15);;
      var pendingItems = getPendingItems(seller.reqProductList, distributor.distributor_ID, product.product_ID) - data.numberOfItemsApproved;
      var payment = getTotalPayment(data.numberOfItemsApproved, data.pricePerItem, data.additionalCharges, data.transportationCharges);

      var sellerNewProduct = factory.newConcept(NS, "ReqApproveProductList");
      sellerNewProduct.product_ID = data.product_ID;
      sellerNewProduct.distributor_ID = data.distributor_ID;
      sellerNewProduct.numberOfItemsApproved = data.numberOfItemsApproved;
      sellerNewProduct.additionalCharges = data.additionalCharges;
      sellerNewProduct.transportationCharges = data.transportationCharges;
      sellerNewProduct.pricePerItem = data.pricePerItem;
      // sellerNewProduct.numberOfItemsPending = pendingItems;
      sellerNewProduct.totalPayment = payment;
      sellerNewProduct.payment_ID = IDpayment;
      sellerNewProduct.paymentStatus = "Pending"

      seller.reqApproveProductList.push(sellerNewProduct);


      var newProductdistributor = factory.newConcept("org.scms.network.distributor", "ReqApproveProductListForSeller");
      newProductdistributor.seller_ID = seller.seller_ID;
      newProductdistributor.distributor_ID = data.distributor_ID
      newProductdistributor.product_ID = data.product_ID
      //newProductdistributor.numberOfItemsPending = pendingItems;
      newProductdistributor.totalPayment = payment;
      newProductdistributor.payment_ID = IDpayment;
      newProductdistributor.paymentStatus = "Pending"
      distributor.reqApproveProductListForSeller.push(newProductdistributor);

      checkOutFromSellerReqProductList(seller.reqProductList, product.product_ID, distributor.distributor_ID);

      // remove seller request from distributor reqProductListFromSeller
      for (i = 0; i < distributor.reqProductListFromSeller.length; i++) {

            if (distributor.reqProductListFromSeller[i].seller_ID == seller.seller_ID && distributor.reqProductListFromSeller[i].product_ID == product.product_ID) {

                  distributor.reqProductListFromSeller.splice(i, 1);

            }
      }

      var event = factory.newEvent(NS, "ReqAddProductToSellerApproved");
      event.product_ID = data.product_ID;
      event.distributor_ID = data.distributor_ID;
      event.numberOfItemsApproved = data.numberOfItemsApproved;
      event.pricePerItem = data.pricePerItem;
      event.additionalCharges = data.additionalCharges;
      event.transportationCharges = data.transportationCharges;
      emit(event);

      var a = await distributorRegistry.update(distributor);
      return sellerRegistry.update(seller);
}

function getPendingItems(sellerReqProductList, distributorID, productID) {
      for (i = 0; i < sellerReqProductList.length; i++) {
            if (sellerReqProductList[i].distributor_ID == distributorID && sellerReqProductList[i].product_ID == productID) {
                  return sellerReqProductList[i].numberOfItems;
            }
      }
}

function getTotalPayment(numberOfItems, pricePerItem, additionalCharges, transportationCharges) {
      let totalPayment = numberOfItems * pricePerItem + ((numberOfItems * pricePerItem * additionalCharges) / 100) + transportationCharges;
      return totalPayment;
}

function checkSellerReqProductList1(sellerReqProductList, productID, distributorID) {
      flag = 0;
      for (i = 0; i < sellerReqProductList.length; i++) {
            if (sellerReqProductList[i].product_ID != productID && sellerReqProductList[i].distributor_ID != distributorID) {
                  flag = 1;
                  break
            }
      }
      if (flag == 1) {
            throw new Error("Product is Not Requested by Seller");
      }
}


function checkOutFromSellerReqProductList(sellerList, productID, distributorID) {
      for (i = 0; i < sellerList.length; i++) {
            if (sellerList[i].product_ID == productID && sellerList[i].distributor_ID == distributorID) {
                  sellerList.splice(i, 1);
            }
      }
}

/**
 * Approve Product Transaction
 * @param {org.scms.network.product.ApproveProduct} data
 * @transaction
 */
async function ApproveProduct(data) {
      var NS = "org.scms.network.product";
      var factory = getFactory();
      var productRegistry = await getAssetRegistry("org.scms.network.product.Product")
      var product = await productRegistry.get(data.product_ID);
      if (product.status != "Pending") {
            throw new Error("Product is not Listing!!")
      }
      product.status = "Approved";
      var event = factory.newEvent(NS, "ProductApproved");
      event.product_ID = data.product_ID;
      emit(event);
      return productRegistry.update(product);
}


/**
 * Approve Product To Distributor Transaction
 * @param {org.scms.network.distributor.ApproveAddProductToDistributor} data
 * @transaction
 */

async function ApproveAddProductToDistributor(data) {
      var NS = "org.scms.network.distributor";
      var factory = getFactory();
      var productRegistry = await getAssetRegistry("org.scms.network.product.Product");
      var product = await productRegistry.get(data.product_ID);
      var distributorRegistry = await getAssetRegistry("org.scms.network.distributor.Distributor");
      var distributor = await distributorRegistry.get(data.distributor_ID);

      var numberItems = getNumberOfItems(distributor.reqProductList, product.product_ID) - data.numberOfItemsApproved;
      if (distributor.status != "Registered") {
            throw new Error("Distributor not Registered!!");
      }
      if (product.status != "Approved") {
            throw new Error("Product is not Registered")
      }

      if (numberItems < 0) {
            throw new Error("Distributor doesn't Order That much Product!!!");
      }
      checkDistributorRequestedProductList(distributor.reqProductList, product.product_ID);
      removeProductFromDistributorRequestedProductList(distributor.reqProductList, product.product_ID, distributor.distributor_ID);
      var prevNumeberOfItems = getNumberOfItemsOrdered(distributor.reqProductList, product.product_ID);
      var addProduct = factory.newConcept(NS, "ProductList");
      addProduct.product_ID = data.product_ID;
      //addProduct.numberOfItemsOrdered = prevNumeberOfItems;
      addProduct.numberOfItemsApproved = data.numberOfItemsApproved;
      addProduct.pricePerItem = product.totalPrice;
      addProduct.pendingNumberOfItems = numberItems;
      distributor.products.push(addProduct);

      var event = factory.newEvent(NS, "AddProductToDistributorApproved");
      event.product_ID = data.product_ID;
      event.distributor_ID = data.distributor_ID;
      event.numberOfItemsApproved = data.numberOfItemsApproved;
      emit(event);
      var a = await productRegistry.update(product);
      return distributorRegistry.update(distributor);
}

function getNumberOfItems(distributorList, productID) {
      for (i = 0; i < distributorList.length; i++) {
            if (distributorList[i].product_ID == productID) {
                  return distributorList[i].numberOfItems;
            }
      }
}

function getNumberOfItemsOrdered(distributorReqProductlist, productID) {
      for (i = 0; i < distributorReqProductlist.length; i++) {
            if (distributorReqProductlist[i].product_ID == productID) {
                  return distributorReqProductlist[i].numberOfItems;
            }
      }
}

function removeProductFromDistributorRequestedProductList(distributorReqProductList, productID, distributorID) {
      for (i = 0; i < distributorReqProductList.length; i++) {
            if (distributorReqProductList[i].product_ID == productID) {
                  distributorReqProductList.splice(i, 1);
            }
      }
}

function checkDistributorRequestedProductList(distributorReqProductList, productID) {
      flag = 0;
      for (i = 0; i < distributorReqProductList.length; i++) {
            if (distributorReqProductList[i].product_ID == productID) {
                  flag = 1;
                  break
            }
      }
      if (flag == 0) {
            throw new Error("Product is not Requested by Distributor");
      }
}

/**
 * Approve Add Distributor Transaction
 * @param {org.scms.network.seller.ApproveAddDistributor} data
 * @transaction
 */
async function ApproveAddDistributor(data) {
      var NS = "org.scms.network.seller";
      var factory = getFactory();
      var sellerRegistry = await getAssetRegistry("org.scms.network.seller.Seller");
      var seller = await sellerRegistry.get(data.seller_ID);
      var distributorRegistry = await getAssetRegistry("org.scms.network.distributor.Distributor");
      var distributor = await distributorRegistry.get(data.distributor_ID);

      checkSellerReqDistributorList(seller.reqDistributorList, distributor.distributor_ID);

      removeSellerFromDistributor(distributor.reqSellerList, seller.seller_ID);
      removeDistributorFromSellerList(seller.reqDistributorList, distributor.distributor_ID);
      seller.distributorsList.push(distributor);
      var event = factory.newEvent(NS, "DistributorAddApproved")
      event.seller_ID = data.seller_ID;
      emit(event);

      var a = await sellerRegistry.update(seller);
      return distributorRegistry.update(distributor);
}

function checkSellerReqDistributorList(sellerReqDistributorList, distributorID) {
      flag = 0;
      for (i = 0; i < sellerReqDistributorList.length; i++) {
            if (sellerReqDistributorList[i].$identifier == distributorID) {
                  flag = 1;
                  break
            }
      }
      if (flag == 0) {
            throw new Error("Seller not Requested To Distriubutor!!");
      }
}

function removeSellerFromDistributor(distributorList, sellerID) {
      for (var i = 0; i < distributorList.length; i++) {
            if (distributorList[i].$identifier == sellerID) {
                  distributorList.splice(i, 1);
            }
      }
}

function removeDistributorFromSellerList(sellerList, distributorID) {
      for (i = 0; i < sellerList.length; i++) {
            if (sellerList[i].$identifier == distributorID) {
                  sellerList.splice(i, 1);
            }
      }
}

/**
 * Approve Payment Transaction
 * @param {org.scms.network.seller.ApprovePayment} data
 * @transaction
 */
async function ApprovePayment(data) {
      var NS = "org.scms.network.seller";
      var factory = getFactory();
      var productRegistry = await getAssetRegistry("org.scms.network.product.Product");
      var product = await productRegistry.get(data.product_ID);
      var sellerRegistry = await getAssetRegistry("org.scms.network.seller.Seller");
      var seller = await sellerRegistry.get(data.seller_ID);
      var distributorRegistry = await getAssetRegistry("org.scms.network.distributor.Distributor");
      var distributor = await distributorRegistry.get(data.distributor_ID);

      checkPaymentID(seller.reqApproveProductList, data.payment_ID);
      checkSellerPayments(seller.payments, data.payment_ID);
      var pricePerItem = getPricePerItem(seller.reqApproveProductList, data.payment_ID);
      var itemsApproved = getNumberOfItem(seller.reqApproveProductList, data.payment_ID);

      var newPayment = factory.newConcept("org.scms.network.distributor", "PaymentList");
      newPayment.payment_ID = data.payment_ID;
      newPayment.seller_ID = data.seller_ID;
      newPayment.amount_deposited = data.amount_deposited;
      newPayment.demandDraft_or_RTGSNo = data.demandDraft_or_RTGSNo;


      distributor.paymentList.push(newPayment);
      // remove from req Approve Product list 
      removeSellerIDFromDistributorReqApprove(distributor.reqApproveProductListForSeller, seller.seller_ID, data.payment_ID);
      removePaymentIDFromSellerReqApproveProductList(seller.reqApproveProductList, data.payment_ID);

      var newProductForSeller = factory.newConcept(NS, "ProductList");
      newProductForSeller.product_ID = product.product_ID;
      newProductForSeller.distributor_ID = data.distributor_ID;
      newProductForSeller.numberOfItems = itemsApproved;
      newProductForSeller.pricePerItem = pricePerItem;
      seller.products.push(newProductForSeller);
      approvePaymentStatus(seller.payments, data.payment_ID, distributor.distributor_ID);
      var event = factory.newEvent(NS, "PaymentApproved")
      event.payment_ID = data.payment_ID;
      event.seller_ID = data.seller_ID;
      event.distributor_ID = data.distributor_ID;
      event.demandDraft_or_RTGSNo = data.demandDraft_or_RTGSNo;
      event.amount_deposited = data.amount_deposited;
      emit(event);
      var a = await distributorRegistry.update(distributor);
      return sellerRegistry.update(seller);

}

function getPricePerItem(sellerReqApproveProductList, paymentID) {
      flag = 0;
      for (i = 0; i < sellerReqApproveProductList.length; i++) {
            if (sellerReqApproveProductList[i].payment_ID == paymentID) {
                  flag = 1;
                  return (sellerReqApproveProductList[i].totalPayment / sellerReqApproveProductList[i].numberOfItemsApproved);
            }
      }
}

function getNumberOfItem(sellerReqApproveProductList, paymentID) {
      flag = 0;
      for (i = 0; i < sellerReqApproveProductList.length; i++) {
            if (sellerReqApproveProductList[i].payment_ID == paymentID) {
                  flag = 1;
                  return sellerReqApproveProductList[i].numberOfItemsApproved;
            }
      }
}

function checkPaymentID(sellerReqApproveProductList, paymentID) {
      flag = 0;
      for (i = 0; i < sellerReqApproveProductList.length; i++) {
            if (sellerReqApproveProductList[i].payment_ID == paymentID) {
                  flag = 1;
                  break
            }
      }
      if (flag == 0) {
            throw new Error("Payment ID invalid!!");
      }
}

function checkSellerPayments(sellerPaymentList, paymentID) {
      flag = 0;
      for (i = 0; i < sellerPaymentList.length; i++) {
            if (sellerPaymentList[i].payment_ID == paymentID) {
                  flag = 1;
                  break
            }
      }
      if (flag == 0) {
            throw new Error ("Payment Not Done yet!!!");
      }
}

function removeSellerIDFromDistributorReqApprove(distributorReqApproveList, sellerID, paymentID) {
      for (i = 0; i < distributorReqApproveList.length; i++) {
            if (distributorReqApproveList[i].seller_ID == sellerID && distributorReqApproveList[i].payment_ID == paymentID) {
                  distributorReqApproveList.splice(i, 1);
            }
      }
}

function removePaymentIDFromSellerReqApproveProductList(sellerReqApproveProductList, paymentID) {
      for (i = 0; i < sellerReqApproveProductList.length; i++) {
            if (sellerReqApproveProductList[i].payment_ID == paymentID) {
                  sellerReqApproveProductList.splice(i, 1);
            }
      }
}

function approvePaymentStatus(sellerPaymentList, paymentID, distributorID) {
      for (i = 0; i < sellerPaymentList.length; i++) {
            if (sellerPaymentList[i].payment_ID == paymentID && sellerPaymentList[i].distributor_ID == distributorID) {
                  sellerPaymentList[i].status = "Approve"
            }
      }
}
