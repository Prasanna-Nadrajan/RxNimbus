import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2, FileText, Search, ShoppingCart } from 'lucide-react';
import jsPDF from 'jspdf';
import api from '../api/axios';

const POS = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);

  const { data: medicines, isLoading } = useQuery({
    queryKey: ['medicines-pos'],
    queryFn: async () => {
      const response = await api.get('/medicines');
      return response.data;
    }
  });

  const createOrderMutation = useMutation({
    mutationFn: (orderData) => api.post('/orders', orderData),
    onSuccess: (data) => {
      generateInvoice(data);
      setCart([]);
      setDiscountPercent(0);
      alert('Order placed successfully! Invoice Downloaded.');
    },
    onError: (error) => {
      alert(`Error placing order: ${error.response?.data?.message || error.message}`);
    }
  });

  const filteredMedicines = useMemo(() => {
    if (!medicines) return [];
    return medicines.filter((m) => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) && m.stockQuantity > 0
    );
  }, [medicines, searchTerm]);

  const addToCart = (medicine) => {
    const existingIdx = cart.findIndex(c => c.medicine === medicine._id);
    if (existingIdx >= 0) {
      if (cart[existingIdx].quantity >= medicine.stockQuantity) {
        alert('Not enough stock available!');
        return;
      }
      const newCart = [...cart];
      newCart[existingIdx].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { 
        medicine: medicine._id, 
        name: medicine.name, 
        price: medicine.retailPrice, 
        quantity: 1,
        maxStock: medicine.stockQuantity
      }]);
    }
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const updateQuantity = (index, delta) => {
    const item = cart[index];
    if (item.quantity + delta > item.maxStock) {
       alert('Exceeds available stock');
       return;
    }
    if (item.quantity + delta < 1) return;
    
    const newCart = [...cart];
    newCart[index].quantity += delta;
    setCart(newCart);
  };

  // Financials
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const taxAmount = (subtotal - discountAmount) * 0.05; // 5% flat tax
  const totalAmount = subtotal - discountAmount + taxAmount;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const orderData = {
      orderItems: cart.map(c => ({
        medicine: c.medicine,
        name: c.name,
        quantity: c.quantity,
        price: c.price
      })),
      taxAmount: taxAmount,
      discountAmount: discountAmount,
      totalAmount: totalAmount
    };

    createOrderMutation.mutate(orderData);
  };

  const generateInvoice = (orderData) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text('RxNimbus Pharmacy', 14, 20);
    doc.setFontSize(12);
    doc.text('Tax Invoice', 14, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 37);
    doc.text(`Order ID: ${orderData._id}`, 14, 44);

    // Table Header
    doc.setLineWidth(0.5);
    doc.line(14, 50, 196, 50);
    doc.text('Item', 14, 56);
    doc.text('Qty', 100, 56);
    doc.text('Price', 140, 56);
    doc.text('Total', 170, 56);
    doc.line(14, 60, 196, 60);

    // Items
    let y = 68;
    cart.forEach((item) => {
      doc.text(item.name, 14, y);
      doc.text(item.quantity.toString(), 100, y);
      doc.text(`$${item.price.toFixed(2)}`, 140, y);
      doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 170, y);
      y += 8;
    });

    // Totals
    doc.line(120, y + 5, 196, y + 5);
    y += 12;
    doc.text('Subtotal:', 140, y);
    doc.text(`$${subtotal.toFixed(2)}`, 170, y);
    y += 8;
    doc.text('Discount:', 140, y);
    doc.text(`-$${discountAmount.toFixed(2)}`, 170, y);
    y += 8;
    doc.text('Tax (5%):', 140, y);
    doc.text(`$${taxAmount.toFixed(2)}`, 170, y);
    y += 8;
    
    doc.setFontSize(14);
    doc.text('Total:', 140, y);
    doc.text(`$${totalAmount.toFixed(2)}`, 170, y);

    doc.save(`invoice_${orderData._id}.pdf`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Point of Sale (POS)</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search & Products */}
        <div className="flat-card lg:col-span-2 min-h-[500px] flex flex-col">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search medicines by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flat-input pl-10"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2">
            {isLoading ? (
              <p className="text-gray-500">Loading medicines...</p>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredMedicines.map((med) => (
                  <div 
                    key={med._id} 
                    onClick={() => addToCart(med)}
                    className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-primary-blue hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800 w-3/4 truncate" title={med.name}>{med.name}</h3>
                      <button className="text-gray-400 group-hover:text-primary-blue bg-gray-50 rounded-full p-1 leading-none">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{med.category}</p>
                    <div className="flex justify-between items-end mt-auto">
                      <span className="font-bold text-lg text-primary-navy">${med.retailPrice.toFixed(2)}</span>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                        Stock: {med.stockQuantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart Sidebar */}
        <div className="flat-card flex flex-col min-h-[500px]">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <ShoppingCart className="mr-2 w-5 h-5 text-gray-500" />
            Current Cart
          </h2>
          
          <div className="flex-1 overflow-y-auto mb-4">
            {cart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                Cart is empty
              </div>
            ) : (
              <ul className="space-y-4">
                {cart.map((item, idx) => (
                  <li key={item.medicine} className="flex flex-col border-b border-gray-100 pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-800 w-3/4 truncate">{item.name}</span>
                      <button onClick={() => removeFromCart(idx)} className="text-gray-400 hover:text-danger-crimson">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => updateQuantity(idx, -1)} className="bg-gray-100 w-6 h-6 rounded flex items-center justify-center hover:bg-gray-200 text-gray-600 font-bold">-</button>
                        <span className="w-6 text-center font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(idx, 1)} className="bg-gray-100 w-6 h-6 rounded flex items-center justify-center hover:bg-gray-200 text-gray-600 font-bold">+</button>
                      </div>
                      <span className="font-semibold text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Cart Summary */}
          <div className="border-t border-gray-200 pt-4 space-y-3 bg-gray-50 -mx-6 px-6 pb-2 mt-auto">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 items-center">
              <span>Discount (%)</span>
              <input 
                type="number" 
                className="w-16 border-gray-300 rounded px-2 py-1 text-right text-sm border focus:outline-none focus:border-primary-blue bg-white"
                value={discountPercent}
                min="0"
                max="100"
                onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600 border-b border-gray-200 pb-3">
              <span>Tax (5%)</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-800 py-1">
              <span>Total</span>
              <span className="text-primary-blue">${totalAmount.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handleCheckout} 
              disabled={cart.length === 0 || createOrderMutation.isPending}
              className={`w-full py-3 rounded-lg flex justify-center items-center text-white font-medium transition-colors ${
                cart.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-success-emerald hover:bg-emerald-600 shadow-md'
              }`}
            >
              <FileText className="w-5 h-5 mr-2" />
              {createOrderMutation.isPending ? 'Processing...' : 'Complete Sale && Print'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;
