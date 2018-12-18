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
 * Reject Product Transaction
 * @param {org.scms.network.product.RejectProduct} data
 * @transaction
 */
async function RejectProduct(data) {
      var NS = "org.scms.network.product";
      var factory = getFactory();
      var productRegistry = await getAssetRegistry("org.scms.network.product.Product");
      var product = await productRegistry.get(data.product_ID);

      if (product.status != "Pending") {
            throw new Error("Product is not Listing!!")
      }

      var newpro = factory.newConcept(NS, "RejectReason");
      newpro.product_ID = data.product_ID;
      newpro.reason = data.reason;

      product.rejectReasonList.push(newpro);

      product.status = "Rejected";
      var event = factory.newEvent(NS, "ProductRejected");
      event.product_ID = data.product_ID;
      event.reason = data.reason;
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

      if (distributor.status != "Registered") {
            throw new Error("Distributor not Registered!!");
      }
      if (product.status != "Approved") {
            throw new Error("Product is not Registered")
      }

      var numberItems = getNumberOfItems(distributor.reqProductList, product.product_ID);
      if(numberItems < 0) {
            throw new Error ("Distributor doesn't Order That much Product!!!");
      }
      checkDistributorRequestedProductList(distributor.reqProductList, product.product_ID);
      removeProductFromDistributorRequestedProductList(distributor.reqProductList, product.product_ID, distributor.distributor_ID);

      var addProduct = factory.newConcept(NS, "ProductList");
      addProduct.product_ID = data.product_ID;
      addProduct.numberOfItemsOrdered = getNumberOfItemsOrdered(distributor.reqProductList,product.product_ID);
      addProduct.numberOfItemsApproved = data.numberOfItemsApproved;
      addProduct.pricePerItem = data.pricePerItem;
      addProduct.pendingNumberOfItems = numberItems - data.numberOfItemsApproved;
      distributor.products.push(addProduct);

      var event = factory.newEvent(NS, "AddProductToDistributorApproved");
      event.product_ID = data.product_ID;
      event.distributor_ID = data.distributor_ID;
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
      for (i=0;i<distributorReqProductlist.length;i++) {
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
 * Reject Product To Distributor Transaction
 * @param {org.scms.network.distributor.RejectAddProductToDistributor} data
 * @transaction
 */

async function RejectAddProductToDistributor(data) {
      var NS = "org.scms.network.distributor";
      var factory = getFactory();
      var productRegistry = await getAssetRegistry("org.scms.network.product.Product");
      var product = await productRegistry.get(data.product_ID);
      var distributorRegistry = await getAssetRegistry("org.scms.network.distributor.Distributor");
      var distributor = await distributorRegistry.get(data.distributor_ID);

      if (distributor.status != "Registered") {
            throw new Error("Distributor not Registered!!");
      }
      if (product.status != "Approved") {
            throw new Error("Product is not Registered!!");
      }

      removeProductReq(distributor.reqProductList, product.product_ID, distributor.distributor_ID);

      var newRej = factory.newConcept(NS, "RejProductList");
      newRej.product_ID = data.product_ID;
      newRej.reason = data.reason;
      distributor.rejProductList.push(newRej);

      var event = factory.newEvent(NS, "AddProductToDistributorRejected");
      event.product_ID = data.product_ID;
      event.distributor_ID = data.distributor_ID;
      event.reason = data.reason;
      emit(event);
      var a = await productRegistry.update(product);
      return distributorRegistry.update(distributor);

}

function removeProductReq(distributorList, productID, distributorID) {
      for (i = 0; i < distributorList.length; i++) {
            if (distributorList[i].product_ID == productID && distributorList[i].distributor_ID == distributorID) {
                  distributorList.splice(i, 1);
            }
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

      seller.distributorsList.push(distributor);

      removeSellerFromDistributor(distributor.reqSellerList, seller.seller_ID);
      removeDistributorFromSellerList(seller.reqDistributorList, distributor.distributor_ID);
      var event = factory.newEvent(NS, "DistributorAddApproved")
      event.seller_ID = data.seller_ID;
      emit(event);

      var a = await sellerRegistry.update(seller);
      return distributorRegistry.update(distributor);
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
