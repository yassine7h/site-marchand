import { useEffect, useState } from "react";
import { useHttpErrorHandler } from "../hooks/httpErrorHandler";
import { http } from "../utils/HttpClient";
import { User } from "../contexts/GlobalContext";
import { IoCloseSharp } from "react-icons/io5";
import Layout from "../layouts/Layout";

type ProductType = { id?: number; name: string; stock: number; price: number; quantity: number };
type OrderStatusType = "RESERVED" | "VALIDATED" | "CANCELED" | "REJECTED";
type OrderType = {
   id?: number;
   user: User;
   address: string;
   products: ProductType[];
   status: OrderStatusType;
};

export default function OrdersPage() {
   const handleHttpError = useHttpErrorHandler();

   const [orders, setOrders] = useState<OrderType[]>([]);
   const [showValidateModal, setShowValidateModal] = useState(false);
   const [showProductsDetailsModal, setShowProductsDetailsModal] = useState(false);
   const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);

   useEffect(() => {
      fetchOrders();
   }, []);
   const fetchOrders = () => {
      http
         .get("/orders/mine")
         .then((response) => {
            setOrders(response.data as OrderType[]);
         })
         .catch(handleHttpError);
   };

   const handleValidate = (orderId: number | undefined) => {
      http
         .patch(`/orders/${orderId}/cancel`, { status: "CANCELED" })
         .then(() => {
            setShowValidateModal(false);
            fetchOrders();
            closeValidateModal();
         })
         .catch(handleHttpError);
   };

   const openValidateModal = (order: OrderType | null) => {
      if (!order) return;
      setSelectedOrder(order);
      setShowValidateModal(true);
   };
   const openProductsDetailsModal = (order: OrderType | null) => {
      if (!order) return;
      setSelectedOrder(order);
      setShowProductsDetailsModal(true);
   };

   const closeValidateModal = () => {
      setSelectedOrder(null);
      setShowValidateModal(false);
   };
   const closeProductsDetailsModal = () => {
      setSelectedOrder(null);
      setShowProductsDetailsModal(false);
   };

   const handlePrint = () => {
      const printWindow = window.open("", "", "height=500,width=800");
      if (printWindow) {
         printWindow.document.write("<html><head><title>Eshop Invoice</title>");
         printWindow.document.write(`
          <style>
             body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f4f4f4;
                color: #333;
             }
             .invoice-container {
                background-color: #fff;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                max-width: 700px;
                margin: auto;
             }
             h1, h2, h3 {
                font-family: 'Helvetica', sans-serif;
                color: #2C3E50;
             }
             h1 {
                font-size: 28px;
                margin-bottom: 20px;
                text-align: center;
             }
             .order-details {
                margin-bottom: 30px;
                border-bottom: 2px solid #ddd;
                padding-bottom: 10px;
             }
             .order-details div {
                font-size: 16px;
                margin-bottom: 8px;
             }
             .order-details .total {
                font-size: 18px;
                font-weight: bold;
                color: #E74C3C;
                text-align: right;
                margin-top: 10px;
             }
             table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
             }
             table th, table td {
                border: 1px solid #ddd;
                padding: 8px 12px;
                text-align: left;
             }
             table th {
                background-color: #3498db;
                color: white;
             }
             .footer {
                text-align: center;
                margin-top: 40px;
                font-size: 14px;
                color: #7f8c8d;
             }
          </style>
       `);
         printWindow.document.write("</head><body>");
         printWindow.document.write(`
          <div class="invoice-container">
             <h1>Invoice</h1>
             <div class="order-details">
                <div><strong>Order Number:</strong> #${selectedOrder?.id}</div>
                <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
                <div><strong>Shipping Address:</strong> ${selectedOrder?.address}</div>
             </div>
             <h2>Products</h2>
             <table>
                <thead>
                   <tr>
                      <th>#</th>
                      <th>Product Name</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                   </tr>
                </thead>
                <tbody>
                   ${selectedOrder?.products
                      .map(
                         (p) => `
                      <tr>
                         <td>${p.id}</td>
                         <td>${p.name}</td>
                         <td>$${p.price.toFixed(2)}</td>
                         <td>${p.quantity}</td>
                         <td>$${(p.quantity * p.price).toFixed(2)}</td>
                      </tr>
                   `
                      )
                      .join("")}
                </tbody>
             </table>
             <div class="total">
                Total: $${selectedOrder?.products.reduce((total, p) => total + p.quantity * p.price, 0).toFixed(2)}
             </div>
             <div class="footer">
                Thank you for your purchase! <br/>
                <small>Eshop | Bourges | 0100110200</small>
             </div>
          </div>
       `);

         printWindow.document.write("</body></html>");
         printWindow.document.close();
         printWindow.print();
      } else {
         console.error("Failed to open print window");
      }
   };

   return (
      <Layout>
         <div className="w-full bg-gray-100 flex flex-col items-center p-8">
            <div className="bg-white rounded-md shadow-lg w-full max-w-5xl p-6">
               <h2 className="text-xl font-semibold mb-4">My Orders</h2>
               <table className="w-full border-collapse border border-gray-200">
                  <thead className="bg-gray-200">
                     <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left  w-[50px]">ID</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Products</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Address</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Total</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
                     </tr>
                  </thead>
                  <tbody>
                     {orders.length > 0 ? (
                        orders.map((order) => (
                           <tr key={order.id} className="">
                              <td className="border border-gray-300 px-4 py-2">{order.id}</td>
                              <td
                                 onClick={() => openProductsDetailsModal(order)}
                                 className="border cursor-pointer bg-blue-100 hover:bg-blue-300 border-blue-300 px-4 py-2"
                              >
                                 {order.products?.map((p) => (
                                    <div key={p.id}>{p.name}</div>
                                 ))}
                              </td>
                              <td className="border border-gray-300 px-4 py-2">{order.address}</td>
                              <td className="border border-gray-300 px-4 py-2">${order.products?.reduce((a, b) => a + b.price, 0).toFixed(2)}</td>
                              <td className="border relative border-gray-300 px-4 py-2 text-center">
                                 <div
                                    className={
                                       (order.status === "RESERVED"
                                          ? "border-blue-500 text-blue-500"
                                          : order.status === "VALIDATED"
                                          ? "border-green-500 text-green-500"
                                          : "border-red-500 text-red-500") + " w-fit px-2 border-2 rounded-lg mx-auto"
                                    }
                                 >
                                    {order.status}
                                 </div>
                                 {order.status === "RESERVED" && (
                                    <button
                                       onClick={() => openValidateModal(order)}
                                       className="m-1 absolute rounded-full p-1 top-0 right-0 text-white bg-red-500 hover:bg-red-700"
                                    >
                                       <IoCloseSharp />
                                    </button>
                                 )}
                              </td>
                           </tr>
                        ))
                     ) : (
                        <tr>
                           <td colSpan={6} className="border border-gray-300 px-4 py-2 text-center text-gray-500">
                              No orders found
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
               {/* Modals */}
               {showValidateModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                     <div className="bg-white p-6 rounded-md shadow-lg w-[500px]">
                        <h2 className="text-xl font-bold mb-4">Order #{selectedOrder?.id}</h2>
                        <p>Are you sure you want to cancel this order? </p>
                        <div className="mt-4 flex justify-end">
                           <button onClick={closeValidateModal} className="mr-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md">
                              Close
                           </button>
                           <button
                              onClick={() => handleValidate(selectedOrder?.id)}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                           >
                              Confirm
                           </button>
                        </div>
                     </div>
                  </div>
               )}
               {showProductsDetailsModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                     <div className="bg-white max-h-[90vh] p-6 rounded-md shadow-lg w-[400px]">
                        <div>
                           <h2 className="text-xl font-bold mb-4">Order #{selectedOrder?.id}</h2>
                           <h3 className="text-lg font-semibold mb-3">Products</h3>
                           <div className="w-full max-h-[60vh] h-fit overflow-y-scroll">
                              {selectedOrder?.products.map((p) => (
                                 <div key={p.id} className="flex items-start border-t-2">
                                    <div className="font-semibold p-3 w-[50px]">#{p.id}</div>
                                    <div className="p-3 border-l-2 w-full">
                                       <div className="flex gap-2 mb-2">
                                          <div className="font-semibold">Name</div>
                                          <div className="">{p.name}</div>
                                       </div>
                                       <div className="flex gap-2 mb-2">
                                          <div className="font-semibold">Price</div>
                                          <div className="">{p.price}</div>
                                       </div>
                                       <div className="flex gap-2 mb-2">
                                          <div className="font-semibold">Stock</div>
                                          <div className="">{p.stock}</div>
                                       </div>
                                       <div className="flex gap-2 mb-2">
                                          <div className="font-semibold">Ordered quantity</div>
                                          <div className="">{p.quantity}</div>
                                       </div>
                                       <div className="flex gap-2 mb-2 justify-end">
                                          <div className="font-semibold">Total</div>
                                          <div className="">${p.quantity * p.price}</div>
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                           <div className="mt-4 flex w-full justify-end">
                              <button onClick={closeProductsDetailsModal} className="mr-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md">
                                 Close
                              </button>
                              <button onClick={handlePrint} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md">
                                 Print Invoice
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </Layout>
   );
}