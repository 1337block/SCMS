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
      checkSellerReqToDistributor(seller.reqDistributorList, distributor.distributor_ID);

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

function checkSellerReqToDistributor(sellerReqDistributorList, distributorID) {
      flag = 0;
      for (i = 0; i < sellerReqDistributorList.length; i++) {
            if (sellerReqDistributorList[i].$identifier == distributorID) {
                  flag = 1;
                  break
            }
      }
      if (flag == 0) {
            throw new Error("Seller Not requested to distributor!!");
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

      checkProductReqListForSeller(seller.reqProductList, product.product_ID, distributor.distributor_ID);

      var newPro = factory.newConcept(NS, "RejProductsList");
      newPro.product_ID = data.product_ID;
      newPro.distributor_ID = data.distributor_ID;
      newPro.reason = data.reason;

      seller.rejProductsList.push(newPro);

      var newDis = factory.newConcept("org.scms.network.distributor", "RejProductListFromSeller");
      newDis.seller_ID = data.seller_ID;
      newDis.distributor_ID = data.distributor_ID;
      newDis.product_ID = data.product_ID;
      newDis.reason = data.reason;

      distributor.rejProductListFromSeller.push(newDis);

      checkOutSellerReqProductList(seller.reqProductList, product.product_ID, distributor.distributor_ID);
      checkOutDistributorReqProductListForSeller(distributor.reqProductListFromSeller, seller.seller_ID, product.product_ID);

      var event = factory.newEvent(NS, "AddProductToSellerRejected");
      event.product_ID = data.product_ID;
      event.distributor_ID = data.distributor_ID;
      event.reason = data.reason;
      emit(event);

      var a = await distributorRegistry.update(distributor);
      var b = await productRegistry.update(product);

      return sellerRegistry.update(seller);
}

function checkProductReqListForSeller(sellerProductList, productID, distributorID) {
      flag = 0;
      for (i = 0; i < sellerProductList.length; i++) {
            if (sellerProductList[i].product_ID != productID && sellerProductList[i].distributor_ID != distributorID) {
                  flag = 1;
                  break
            }
      }
      if (flag == 1) {
            throw new Error("Product is not Requested by Seller !!");
      }
}

function checkOutSellerReqProductList(sellerReqProductList, productID, distributorID) {
      for (i = 0; i < sellerReqProductList.length; i++) {
            if (sellerReqProductList[i].product_ID == productID && sellerReqProductList[i].distributor_ID == distributorID) {
                  sellerReqProductList.splice(i, 1);
            }
      }
}

function checkOutDistributorReqProductListForSeller(distributorReqProductListFromSeller, sellerID, productID) {
      for (i = 0; i < distributorReqProductListFromSeller.length; i++) {
            if (distributorReqProductListFromSeller[i].seller_ID == sellerID && distributorReqProductListFromSeller[i].product_ID == productID) {
                  distributorReqProductListFromSeller.splice(i, 1);
            }
      }
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

      checkDistributorRequestProductList(distributor.reqProductList, product.product_ID);
      if (distributor.status != "Registered") {
            throw new Error("Distributor not Registered!!");
      }
      if (product.status != "Approved") {
            throw new Error("Product is not Registered!!");
      }

      var newRej = factory.newConcept(NS, "RejProductList");
      newRej.product_ID = data.product_ID;
      newRej.reason = data.reason;
      distributor.rejProductList.push(newRej);

      removeProductReq(distributor.reqProductList, product.product_ID, distributor.distributor_ID);
      var event = factory.newEvent(NS, "AddProductToDistributorRejected");
      event.product_ID = data.product_ID;
      event.distributor_ID = data.distributor_ID;
      event.reason = data.reason;
      emit(event);
      var a = await productRegistry.update(product);
      return distributorRegistry.update(distributor);

}

function checkDistributorRequestProductList(distributorReqProductList1, productID) {
      let flag = 0;
      for (i = 0; i < distributorReqProductList1.length; i++) {
            if (distributorReqProductList1[i].product_ID == productID) {
                  flag = 1;
                  break
            }
      }
      if (flag == 0) {
            throw new Error("Product Is Not requested by distributor!!");
      }
}

function removeProductReq(distributorList, productID, distributorID) {
      for (i = 0; i < distributorList.length; i++) {
            if (distributorList[i].product_ID == productID && distributorList[i].distributor_ID == distributorID) {
                  distributorList.splice(i, 1);
            }
      }
}

/**
 *  Reject Payment Transaction
 * @param {org.scms.network.seller.RejectPayment} data
 * @transaction
 */
async function RejectPayment(data) {
      var NS = "org.scms.network.seller";
      var factory = getFactory();
      var distributorRegistry = await getAssetRegistry("org.scms.network.distributor.Distributor");
      var distributor = await distributorRegistry.get(data.distributor_ID);
      var sellerRegistry = await getAssetRegistry("org.scms.network.seller.Seller");
      var seller = await sellerRegistry.get(data.seller_ID);

      checkPaymentID(seller.reqApproveProductList, data.payment_ID);
      changeSellerReqApproveProductListStatus(seller.reqApproveProductList, data.payment_ID);
      var paymentReject = factory.newConcept(NS, "RejectPaymentList");
      paymentReject.payment_ID = data.payment_ID;
      paymentReject.distributor_ID = data.distributor_ID;
      paymentReject.demandDraft_or_RTGSNo = data.demandDraft_or_RTGSNo;
      paymentReject.reason = data.reason;
      seller.rejectPaymentList.push(paymentReject)

      return sellerRegistry.update(seller);
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

function changeSellerReqApproveProductListStatus(sellerReqApproveProductList, paymentID) {
      for (i = 0; i < sellerReqApproveProductList.length; i++) {
            if (sellerReqApproveProductList[i].payment_ID == paymentID) {
                  sellerReqApproveProductList[i].paymentStatus = "Rejected";
            }
      }
}