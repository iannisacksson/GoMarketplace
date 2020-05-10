import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import api from '../services/api';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStorage = await AsyncStorage.getItem('@GoMarketplace');

      if (productsStorage) {
        setProducts(JSON.parse(productsStorage));
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function saveCart(): Promise<void> {
      await AsyncStorage.setItem('@GoMarketplace', JSON.stringify(products));
    }

    saveCart();
  }, [products]);

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);

      products[productIndex].quantity += 1;

      setProducts([...products]);
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const checkProductExist = products.find(
        productState => productState.id === product.id,
      );

      const newProduct = {
        ...product,
        quantity: 1,
      };

      if (!checkProductExist) {
        setProducts([...products, newProduct]);

        return null;
      }

      increment(product.id);
    },
    [products, increment],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);

      if (products[productIndex].quantity > 1) {
        products[productIndex].quantity -= 1;

        setProducts([...products]);
      } else {
        products.splice(productIndex, 1);

        setProducts([...products]);
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
