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
 * Add Product To Distributor Transaction
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
      checkDistributorRequestedProductList1(distributor.reqProductList, product.product_ID);

      var newAddProduct = factory.newConcept(NS, "ReqProductList");
      newAddProduct.product_ID = data.product_ID;
      newAddProduct.distributor_ID = data.distributor_ID;
      newAddProduct.numberOfItems = data.numberOfItems;
      newAddProduct.deliveryEndDate = data.deliveryEndDate;

      distributor.reqProductList.push(newAddProduct);

      var event = factory.newEvent(NS, "ProductAddToDistributor");
      event.product_ID = data.product_ID;
      event.distributor_ID = data.distributor_ID;
      event.numberOfItems = data.numberOfItems;
      emit(event);

      return distributorRegistry.update(distributor);
}

function checkDistributorRequestedProductList1(distributorReqProductList, productID) {
      flag = 0;
      for (let data of distributorReqProductList) {
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
      var IDpayment = product.product_ID.slice(4) + seller.seller_ID.slice(5) + distributor.gst_registration_number.slice(8, 15);
      var flag = 0;
      for (i = 0; i < distributor.reqApproveProductListForSeller.length; i++) {
            if (distributor.reqApproveProductListForSeller[i].seller_ID == seller.seller_ID && distributor.reqApproveProductListForSeller[i].payment_ID == IDpayment) {
                  flag = 1;
                  break
            }
      }
      if (flag == 1) {
            throw new Error(`Payment DUE for this paymentID ${IDpayment}`);
      }
      checkDistributorProductList(distributor.products, product.product_ID);
      checkSellerDistributorList(seller.distributorsList, distributor.distributor_ID);
      checkSellerReqProductList(seller.reqProductList, product.product_ID, distributor.distributor_ID);

      var newprodistributor = factory.newConcept("org.scms.network.distributor", "ReqProductListFromSeller");
      newprodistributor.seller_ID = data.seller_ID;
      newprodistributor.distributor_ID = data.distributor_ID;
      newprodistributor.product_ID = data.product_ID;
      newprodistributor.numberOfItems = data.numberOfItems;
      newprodistributor.deliveryEndDate = data.deliveryEndDate;

      distributor.reqProductListFromSeller.push(newprodistributor);

      var newproseller = factory.newConcept(NS, "ReqProductList")
      newproseller.product_ID = data.product_ID;
      newproseller.distributor_ID = data.distributor_ID;
      newproseller.numberOfItems = data.numberOfItems;
      newproseller.deliveryEndDate = data.deliveryEndDate;

      seller.reqProductList.push(newproseller);

      var event = factory.newEvent(NS, "AddProductToSeller");
      event.product_ID = data.product_ID;
      event.seller_ID = data.seller_ID;
      event.distributor_ID = data.distributor_ID;
      event.numberOfItems = data.numberOfItems;
      event.deliveryEndDate = data.deliveryEndDate;
      emit(event);

      var a = await distributorRegistry.update(distributor);
      return sellerRegistry.update(seller);
}

function checkSellerReqProductList(sellerReqProductList, productID, distributorID) {
      flag = 0;
      for (i = 0; i < sellerReqProductList.length; i++) {
            if (sellerReqProductList[i].product_ID == productID && sellerReqProductList[i].distributor_ID == distributorID) {
                  flag = 1;
                  break
            }
      }
      if (flag == 1) {
            throw new Error("Product is already Requested by Seller");
      }
}

function checkDistributorProductList(distributorList, productID) {
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

function checkSellerDistributorList(sellerDistributorList, distributorID) {
      flag = 0;
      for (i = 0; i < sellerDistributorList.length; i++) {
            if (sellerDistributorList[i].$identifier == distributorID) {
                  flag = 1;
                  break;
            }
      }
      if (flag == 0) {
            throw new Error("Distributor is not available to seller Distributor List!!");
      }
}

/**
 * Payment Transaction
 * @param {org.scms.network.seller.Payment} data
 * @transaction
 */
async function Payment(data) {
      var NS = "org.scms.network.seller";
      var factory = getFactory();
      var sellerRegistry = await getAssetRegistry("org.scms.network.seller.Seller");
      var seller = await sellerRegistry.get(data.seller_ID);

      checkPaymentID(seller.reqApproveProductList, data.payment_ID);
      var totalPay = getTotalAmount(seller.reqApproveProductList, data.payment_ID)
      var duePayment = totalPay - data.amount_deposited;

      if (duePayment > 0) {
            throw new Error(`Your Total Deposited amount should be ${totalPay}`);
      }

      var newPayment = factory.newConcept(NS, "Payments");
      newPayment.distributor_ID = data.distributor_ID;
      newPayment.payment_ID = data.payment_ID;
      newPayment.demandDraft_or_RTGSNo = data.demandDraft_or_RTGSNo;
      newPayment.amount_deposited = data.amount_deposited;
      newPayment.bank_name = data.bank_name;
      newPayment.branch_address = data.branch_address;
      newPayment.issuing_bank = data.issuing_bank;
      newPayment.issue_Date = data.issue_Date;
      newPayment.status = "Pending";
      seller.payments.push(newPayment);

      var event = factory.newEvent(NS, "PaymentPending");
      event.payment_ID = data.payment_ID;
      event.distributor_ID = data.distributor_ID;
      event.demandDraft_or_RTGSNo = data.demandDraft_or_RTGSNo;
      event.amount_deposited = data.amount_deposited;
      event.seller_ID = seller.seller_ID;

      return sellerRegistry.update(seller);
}

function checkPaymentID(sellerReqApproveProductList, paymentID) {
      flag = 0;
      for (i = 0; i < sellerReqApproveProductList.length; i++) {
            if (sellerReqApproveProductList[i].payment_ID == paymentID) {
                  flag = 1
                  break
            }
      }
      if (flag == 0) {
            throw new Error("Payment ID invalid!!");
      }
}

function getTotalAmount(sellerReqApproveProductList, payment_ID) {
      for (i = 0; i < sellerReqApproveProductList.length; i++) {
            if (sellerReqApproveProductList[i].payment_ID == payment_ID) {
                  return sellerReqApproveProductList[i].totalPayment;
            }
      }
}
