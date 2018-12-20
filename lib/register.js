/**
 * Register Distributor Transaction
 * @param {org.scms.network.distributor.RegisterDistributor} distributorData
 * @transaction
 */

async function RegisterDistributor(distributorData) {
    var NS = "org.scms.network.distributor";
    var factory = getFactory();

    var distributorRegistry = await getAssetRegistry("org.scms.network.distributor.Distributor");
    var distributor_ID = distributorData.brand_name + distributorData.gst_registration_number.slice(15);
    var distributor = factory.newResource(NS, 'Distributor', distributor_ID);
    distributor.distributor_name = distributorData.distributor_name;
    distributor.distributor_registration_number = distributorData.distributor_registration_number;
    distributor.gst_registration_number = distributorData.gst_registration_number;
    distributor.brand_name = distributorData.brand_name;
    distributor.state = distributorData.state;
    distributor.email = distributorData.email;
    distributor.phone_number = distributorData.phone_number;
    distributor.fax_number = distributorData.fax_number;
    distributor.additional_documents = distributorData.additional_documents;
    distributor.status = "Registered";
    distributor.rejProductList = [];
    distributor.reqProductList = [];
    distributor.products = [];
    distributor.reqProductListFromSeller = [];
    distributor.rejProductListFromSeller = [];
    distributor.reqApproveProductListForSeller = [];
    distributor.reqSellerList = [];
    distributor.rejSellerList = [];
    distributor.paymentList = [];
    return distributorRegistry.add(distributor);
}
/**
 * Register Seller Transaction
 * @param {org.scms.network.seller.Registerseller} sellerData
 * @transaction
 */

async function Registerseller(sellerData) {
    var NS = "org.scms.network.seller";
    var factory = getFactory();
    var sellerRegistry = await getAssetRegistry("org.scms.network.seller.Seller")
    var seller_ID = sellerData.gst_number.slice(2, 12);
    var seller = factory.newResource(NS, 'Seller', seller_ID);
    seller.seller_name = sellerData.seller_name;
    seller.state = sellerData.state;
    seller.district = sellerData.district;
    seller.gst_number = sellerData.gst_number;
    seller.email = sellerData.email;
    seller.phone_number = sellerData.phone_number;
    seller.fax_number = sellerData.fax_number;
    seller.address = sellerData.address;
    seller.status = "Registered";
    seller.reqApproveProductList = [];
    seller.products = [];
    seller.rejProductsList = [];
    seller.reqProductList = [];
    seller.distributorsList = [];
    seller.rejDistributorList = [];
    seller.reqDistributorList = [];
    seller.payments = [];
    seller.rejectPaymentList = [];
    return sellerRegistry.add(seller);
}

/**
 * Register Product Transaction
 * @param {org.scms.network.product.RegisterProduct} productData
 * @transaction
 */
async function RegisterProduct(productData) {
    var NS = "org.scms.network.product";
    var factory = getFactory();

    var productRegistry = await getAssetRegistry("org.scms.network.product.Product");
    var product = factory.newResource(NS, "Product", productData.product_ID);
    product.category = productData.category;
    product.brand_name = productData.brand_name;
    product.ideal_for = productData.ideal_for;
    product.msrp = productData.msrp;
    product.salesTax = productData.salesTax;
    product.totalPrice = productData.msrp + (productData.msrp * (productData.salesTax / 100));
    product.size = productData.size;
    product.color = productData.color;
    product.description = productData.description;
    product.status = "Pending";
    product.rejectReasonList = [];

    var event = factory.newEvent(NS, "ProductApprovePending");
    event.product_ID = productData.product_ID;
    emit(event);

    return productRegistry.add(product);
}
