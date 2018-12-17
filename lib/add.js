/**
 * Add Distributor Transaction
 * @param {org.scms.network.seller.AddDistributor} data
 * @transaction
 */
async function AddDistributor(data) {
      var NS = "org.scms.network.seller"
      var factory = getFactory();
      var sellerRegistry = await getAssetRegistry("org.scms.network.seller.Seller");
      var seller = await sellerRegistry.get(data.seller_ID);
      var distributorRegistry = await getAssetRegistry("org.scms.network.distributor.Distributor");
      var distributor = await distributorRegistry.get(data.distributor_ID);

      if (seller.status != "Registered") {
            throw new Error("Seller is not Registered!!");
      }
      if (distributor.status != "Registered") {
            throw new Error("Distributor is not Registered!!");
      }
      addDistributor(distributor.reqSellerList, seller.seller_ID);
      distributor.reqSellerList.push(seller);

      seller.reqDistributorList.push(distributor);
      var event = factory.newEvent(NS, "DistributorAdd");
      event.seller_ID = data.seller_ID;
      event.distributor_ID = data.distributor_ID;

      var a = await distributorRegistry.update(distributor);
      return sellerRegistry.update(seller);
}

function addDistributor(distributorList, sellerID) {
      flag = 0;
      for (var i = 0; i < distributorList.length; i++) {
            if (distributorList[i].$identifier == sellerID) {
                  flag = 1;
                  break
            }
      }
      if (flag == 1) {
            throw new Error("Seller already requested to Add Distributor!!");
      }
}


/**
 * Reject AddDistributor Transaction
 * @param {org.scms.network.seller.RejectAddDistributor} data
 * @transaction
 */
async function RejectAddDistributor(data) {
      var NS = "org.scms.network.seller";
      var factory = getFactory();
      var sellerRegistry = await getAssetRegistry("org.scms.network.seller.Seller");
      var seller = await sellerRegistry.get(data.seller_ID);
      var distributorRegistry = await getAssetRegistry("org.scms.network.distributor.Distributor");
      var distributor = await distributorRegistry.get(data.distributor_ID);
      if (seller.status != "Registered") {
            throw new Error("Seller is not Registered!!");
      }
      if (distributor.status != "Registered") {
            throw new Error("Distributor is not Registered!!");
      }

      var newRej = factory.newConcept(NS, "RejDistributorList");
      newRej.distributor_ID = data.distributor_ID;
      newRej.reason = data.reason;

      var newrej = factory.newConcept("org.scms.network.distributor", "RejSellerList");
      newrej.seller_ID = data.seller_ID;
      newrej.reason = data.reason;


      rejSeller(distributor.reqSellerList, seller.seller_ID);
      removeDistributor(seller.reqDistributorList, distributor.distributor_ID);
      distributor.rejSellerList.push(newrej);
      seller.rejDistributorList.push(newRej);

      var event = factory.newEvent(NS, "AddDistributorRejected");
      event.seller_ID = data.seller_ID;
      event.distributor_ID = data.distributor_ID;
      event.reason = data.reason;
      emit(event);

      var a = await distributorRegistry.update(distributor);
      return sellerRegistry.update(seller);

}

function rejSeller(distributorList, sellerID) {
      for (var i = 0; i < distributorList.length; i++) {
            if (distributorList[i].$identifier == sellerID) {
                  distributorList.splice(i, 1);
            }
      }
}

function removeDistributor(sellerList, distributorID) {
      for (i = 0; i < sellerList.length; i++) {
            if (sellerList[i].$identifier == distributorID) {
                  sellerList.splice(i, 1);
            }
      }
}

/**
 *  Add Product To Distributor Transaction
 * @param {org.scms.network.distributor.AddProductToDistributor} data
 * @transaction
 */

async function AddProductToDistributor(data) {
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
            throw new Error("Product is not Registered");
      }

      var newAdd = factory.newConcept(NS, "ReqProductList");
      newAdd.product_ID = data.product_ID;
      newAdd.distributor_ID = data.distributor_ID;
      newAdd.numberOfItems = data.numberOfItems;
      newAdd.deliveryEndDate = data.deliveryEndDate;

      checkProductIsRequested(distributor.reqProductList, product.product_ID);
      distributor.reqProductList.push(newAdd);

      var event = factory.newEvent(NS, "ProductAddToDistributor");
      event.product_ID = data.product_ID;
      event.distributor_ID = data.distributor_ID;
      event.numberOfItems = data.numberOfItems;
      emit(event);

      var a = await productRegistry.update(product);
      return distributorRegistry.update(distributor);
}

function checkProductIsRequested(distributorList, productID) {
      flag = 0;
      for (let data of distributorList) {
            if (data.product_ID == productID) {
                  flag = 1;
                  break
            }
      }
      if (flag == 1) {
            throw new Error("Product is already Requested by Distributor!!");
      }
}

/**
 *  Add Product To Seller Transaction
 * @param {org.scms.network.seller.ReqToAddProductToSeller} data
 * @transaction
 */
async function ReqToAddProductToSeller(data) {
      var NS = "org.scms.network.seller";
      var factory = getFactory();
      var productRegistry = await getAssetRegistry("org.scms.network.product.Product");
      var product = await productRegistry.get(data.product_ID);
      var distributorRegistry = await getAssetRegistry("org.scms.network.distributor.Distributor");
      var distributor = await distributorRegistry.get(data.distributor_ID);
      var sellerRegistry = await getAssetRegistry("org.scms.network.seller.Seller");
      var seller = await sellerRegistry.get(data.seller_ID);

      if (distributor.status != "Registered") {
            throw new Error("Distributor not Registered!!");
      }
      if (product.status != "Approved") {
            throw new Error("Product is not Registered");
      }
      if (seller.status != "Registered") {
            throw new Error("Seller is not Registered!!");
      }

      var newpro = factory.newConcept(NS, "ReqProductList");
      newpro.product_ID = data.product_ID;
      newpro.distributor_ID = data.distributor_ID;
      newpro.numberOfItems = data.numberOfItems;
      newpro.pricePerItem = data.pricePerItem;
      newpro.deliveryEndDate = data.deliveryEndDate;

      checkProductInDistributorList(distributor.products, product.product_ID);
      checkDistributorInSellerList(seller.distributorsList, distributor.distributor_ID);

      var newprodistributor = factory.newConcept("org.scms.network.distributor", "ReqProductListFromSeller");
      newprodistributor.seller_ID = data.seller_ID;
      newprodistributor.distributor_ID = data.distributor_ID;
      newprodistributor.product_ID = data.product_ID;
      newprodistributor.pricePerItem = data.pricePerItem
      newprodistributor.numberOfItems = data.numberOfItems;
      newprodistributor.deliveryEndDate = data.deliveryEndDate;

      distributor.reqProductListFromSeller.push(newprodistributor);

      var newproseller = factory.newConcept(NS, "ReqProductList")
      newproseller.product_ID = data.product_ID;
      newproseller.seller_ID = data.seller_ID;
      newproseller.distributor_ID = data.distributor_ID;
      newproseller.numberOfItems = data.numberOfItems;
      newproseller.pricePerItem = data.pricePerItem;
      newproseller.deliveryEndDate = data.deliveryEndDate;

      seller.reqProductList.push(newproseller);

      var event = factory.newEvent(NS, "AddProductToSeller");
      event.product_ID = data.product_ID;
      event.seller_ID = data.seller_ID;
      event.distributor_ID = data.distributor_ID;
      event.numberOfItems = data.numberOfItems;
      event.pricePerItem = data.pricePerItem;
      emit(event);

      var a = await distributorRegistry.update(distributor);
      var b = await productRegistry.update(product);

      return sellerRegistry.update(seller);
}

function checkProductInDistributorList(distributorList, productID) {
      flag = 0;
      for (let data of distributorList) {
            if (data.product_ID == productID) {
                  flag = 1;
                  break;
            }
      }
      if (flag == 0) {
            throw new Error("Product curently is not available!!");
      }
}

function checkDistributorInSellerList(sellerDistributorList, distributorID) {
      flag = 0;
      for (let data of sellerDistributorList) {
            if (data.$identifier == distributorID) {
                  flag = 1;
                  break;
            }
      }
      if (flag == 0) {
            throw new Error("Distributor is not available to seller Distributor List!!");
      }
}
/**
 *  Approve Add Product To Seller Transaction
 * @param {org.scms.network.seller.ApproveToAddProductToSeller} data
 * @transaction
 */

async function ApproveToAddProductToSeller(data) {
      var NS = "org.scms.network.seller";
      var factory = getFactory();

      var productRegistry = await getAssetRegistry("org.scms.network.product.Product");
      var product = await productRegistry.get(data.product_ID);
      var distributorRegistry = await getAssetRegistry("org.scms.network.distributor.Distributor");
      var distributor = await distributorRegistry.get(data.distributor_ID);
      var sellerRegistry = await getAssetRegistry("org.scms.network.seller.Seller");
      var seller = await sellerRegistry.get(data.seller_ID);

      // for (i = 0; i < distributor.reqProductListFromSeller.length; i++) {

      //       if (distributor.reqProductListFromSeller[i].seller_ID != seller.seller_ID && distributor.reqProductListFromSeller[i].product_ID != product.product_ID) {
      //             throw new Error ("Product is not Requested by Seller!!");


      //       }
      // }

      checkReqListForDistributor(distributor.reqProductListFromSeller, seller.seller_ID, product.product_ID);

      var newproseller = factory.newConcept(NS, "ProductList");
      newproseller.product_ID = data.product_ID;
      newproseller.distributor_ID = data.distributor_ID;
      newproseller.numberOfItems = data.numberOfItems;

      seller.products.push(newproseller);

      checkOutFromSellerReq(seller.reqProductList, product.product_ID);

      var newprodistributor = factory.newConcept("org.scms.network.distributor", "ApproveProductListForSeller");
      newprodistributor.seller_ID = data.seller_ID;
      newprodistributor.distributor_ID = data.distributor_ID;
      newprodistributor.product_ID = data.product_ID;
      newprodistributor.numberOfItems = data.numberOfItems;

      distributor.approveProductListForSeller.push(newprodistributor);

      //checkOutFromDistributor(distributor.reqProductListFromSeller, seller.seller_ID, product.product_ID);

      for (i = 0; i < distributor.reqProductListFromSeller.length; i++) {

            if (distributor.reqProductListFromSeller[i].seller_ID == seller.seller_ID && distributor.reqProductListFromSeller[i].product_ID == product.product_ID) {

                  distributor.reqProductListFromSeller.splice(i, 1);

            }
      }


      var event = factory.newEvent(NS, "AddProductToSellerApproved");
      event.product_ID = data.product_ID;
      event.distributor_ID = data.distributor_ID;
      event.seller_ID = data.seller_ID;
      emit(event);

      var a = await distributorRegistry.update(distributor);
      return sellerRegistry.update(seller);
}

function checkOutFromSellerReq(sellerList, productID) {
      for (i = 0; i < sellerList.length; i++) {
            if (sellerList[i].product_ID == productID) {
                  sellerList.splice(i, 1);
            }
      }
}

// function checkOutFromDistributor(distributorList, productID, sellerID) {
//       for (i = 0; i < distributorList.length; i++) {
//             if (distributorList[i].seller_ID == sellerID && distributorList[i].product_ID == productID) {
//                   distributorList.splice(i, 1);
//             }
//       }
// }

function checkReqListForDistributor(distributorList, sellerID, productID) {
      flag = 0;
      for (i = 0; i < distributorList.length; i++) {
            if (distributorList[i].seller_ID == sellerID && distributorList[i].product_ID == productID) {
                  flag = 1;
                  break
            }
      }
      if (flag == 0) {
            throw new Error("Product is not Requested by seller");
      }

}


/**
 *  Reject Add Product To Seller Transaction
 * @param {org.scms.network.seller.RejectToAddProductToSeller} data
 * @transaction
 */

async function RejectToAddProductToSeller(data) {
      var NS = "org.scms.network.seller";
      var factory = getFactory();

      var productRegistry = await getAssetRegistry("org.scms.network.product.Product");
      var product = await productRegistry.get(data.product_ID);
      var distributorRegistry = await getAssetRegistry("org.scms.network.distributor.Distributor");
      var distributor = await distributorRegistry.get(data.distributor_ID);
      var sellerRegistry = await getAssetRegistry("org.scms.network.seller.Seller");
      var seller = await sellerRegistry.get(data.seller_ID);

      checkProductSeller(seller.reqProductList, seller.seller_ID, product.product_ID, distributor.distributor_ID);

      var newPro = factory.newConcept(NS, "RejProductsList");
      newPro.product_ID = data.product_ID;
      newPro.distributor_ID = data.distributor_ID;
      newPro.reason = data.reason;

      seller.rejProductsList.push(newPro);


    //  checKProductfromdistributor(distributor.reqProductListFromSeller, seller.seller_ID, product.product_ID);

      var newDis = factory.newConcept("org.scms.network.distributor", "RejProductListFromSeller");
      newDis.seller_ID = data.seller_ID;
      newDis.distributor_ID = data.distributor_ID;
      newDis.product_ID = data.product_ID;
      newDis.reason = data.reason;

      distributor.rejProductListFromSeller.push(newDis);

      var event = factory.newEvent(NS, "AddProductToSellerRejected");
      event.product_ID = data.product_ID;
      event.distributor_ID = data.distributor_ID;
      event.reason = data.reason;
      emit(event);

      var a = await distributorRegistry.update(distributor);
      var b = await productRegistry.update(product);

      return sellerRegistry.update(seller);
}

function checkProductSeller(sellerProductList, sellerID, productID, distributorID) {
      flag = 0;
      for (let data of sellerProductList) {
            if (data.seller_ID == sellerID && data.product_ID == productID && data.distributor_ID == distributorID) {
                  flag = 1;
                  break
            }
      }
      if (flag == 0) {
            throw new Error("Product is not Requested by Seller !!");
      }
}

// function checKProductfromdistributor(distributorList, productID, sellerID) {
//       flag = 0;
//       for (i = 0; i < distributorList.length; i++) {
//             if (distributorList[i].product_ID == productID && distributorList[i].seller_ID == sellerID) {
//                   flag = 1;
//                   break
//             }
//       }
//       if (flag == 0) {
//             throw new Error("Seller not requested for Product to Distributor!!");
//       }

// }