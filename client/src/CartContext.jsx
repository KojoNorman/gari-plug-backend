import { createContext, useState, useContext } from 'react';

// 1. Create the Context (The Backpack)
const CartContext = createContext();

// 2. Create the Provider (The person handing out the backpacks)
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Function to add a product to the cart
  const addToCart = (product, priceToCharge) => {
    setCart((prevCart) => {
      // Check if the item is already in the cart
      const existingItem = prevCart.find((item) => item._id === product._id);
      
      if (existingItem) {
        // If it exists, just increase the quantity by 1
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // If it's new, add it to the cart with a quantity of 1
        return [...prevCart, { ...product, quantity: 1, activePrice: priceToCharge }];
      }
    });
    alert(`🛒 ${product.name} added to your cart!`);
  };

  // Function to empty the cart after a successful checkout
  const clearCart = () => setCart([]);

  // Calculate the total number of items in the cart
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Calculate the total price of the cart
  const cartTotal = cart.reduce((total, item) => total + (item.activePrice * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, clearCart, cartItemCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

// 3. Create a custom hook so our pages can easily open the backpack
export const useCart = () => useContext(CartContext);