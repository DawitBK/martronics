// import React, { useEffect } from "react";
// import { useParams } from "react-router-dom";
// import useOrderStore from "../../stores/orderStore.js";

// const OrderDetail = () => {
//   const { id } = useParams();
//   const { currentOrder, getOrder, loading, error } = useOrderStore();

//   useEffect(() => {
//     getOrder(id);
//   }, [id, getOrder]);

//   if (loading) return <div>Loading order...</div>;
//   if (error) return <div className="text-red-500">{error}</div>;
//   if (!currentOrder) return <div>Order not found</div>;

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">Order #{currentOrder.id}</h1>
//       <ul className="space-y-2">
//         {currentOrder.orderItems.map((item) => (
//           <li key={item.id} className="border p-2 rounded">
//             {item.product.name} x {item.quantity} = $
//             {item.price_at_purchase * item.quantity}
//           </li>
//         ))}
//       </ul>
//       <p className="mt-4 font-semibold">Total: ${currentOrder.total_amount}</p>
//       <p>Status: {currentOrder.status}</p>
//     </div>
//   );
// };

// export default OrderDetail;
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useOrderStore from "../../stores/orderStore.js";

const OrderDetail = () => {
  const { id } = useParams();
  const { currentOrder, getOrder, loading, error } = useOrderStore();

  useEffect(() => {
    getOrder(id);
  }, [id, getOrder]);

  if (loading) return <div>Loading order...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!currentOrder) return <div>Order not found</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Order #{currentOrder.id}</h1>
      <p>
        User: {currentOrder.user?.firstName} {currentOrder.user?.lastName}
      </p>

      <ul className="space-y-2 mt-2">
        {currentOrder.orderItems.map((item) => (
          <li key={item.id} className="border p-2 rounded">
            {item.product.name} x {item.quantity} = $
            {item.price_at_purchase * item.quantity}
          </li>
        ))}
      </ul>

      <p className="mt-4 font-semibold">Total: ${currentOrder.total_amount}</p>
      <p>Status: {currentOrder.status}</p>
    </div>
  );
};

export default OrderDetail;
