import './App.css';
import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, User, Home, Play, Store, Calendar, Search, Plus, Minus, X, Eye, EyeOff, ArrowLeft, Check, Clock, Bot, Wallet, Heart, HeartOff, Camera, Upload, DollarSign, MapPin, Package, CreditCard, Smartphone, Send
} from 'lucide-react';

// Enhanced MongoDB service with proper API calls
const dbService = {
  API_BASE: 'http://localhost:5000/api',

  // Save user action to MongoDB
  async saveUserAction(userId, action, data) {
    try {
      const response = await fetch(`${this.API_BASE}/user-actions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          userId,
          action,
          data,
          timestamp: new Date()
        })
      });
      
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.log('API call failed, storing locally:', { userId, action, data });
      // Fallback to localStorage
      const actions = JSON.parse(localStorage.getItem('userActions') || '[]');
      actions.push({ userId, action, data, timestamp: new Date() });
      localStorage.setItem('userActions', JSON.stringify(actions));
      return { success: true, stored: 'locally' };
    }
  },

  // Register/Login user
  async authenticateUser(userData) {
    try {
      const response = await fetch(`${this.API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) throw new Error('Auth failed');
      const result = await response.json();
      
      if (result.token) {
        localStorage.setItem('authToken', result.token);
      }
      
      return result;
    } catch (error) {
      console.log('Auth API failed, creating local user');
      const user = {
        id: Date.now(),
        email: userData.email,
        name: userData.email.split('@')[0],
        createdAt: new Date()
      };
      localStorage.setItem('currentUser', JSON.stringify(user));
      return { success: true, user, stored: 'locally' };
    }
  },

  // Save product listing
  async saveProductListing(userId, productData) {
    try {
      const response = await fetch(`${this.API_BASE}/listings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          sellerId: userId,
          ...productData,
          createdAt: new Date()
        })
      });
      
      if (!response.ok) throw new Error('Listing save failed');
      return await response.json();
    } catch (error) {
      console.log('Listing API failed, storing locally:', productData);
      const products = JSON.parse(localStorage.getItem('userProducts') || '[]');
      const newProduct = { id: Date.now(), sellerId: userId, ...productData, createdAt: new Date() };
      products.push(newProduct);
      localStorage.setItem('userProducts', JSON.stringify(products));
      return { success: true, product: newProduct, stored: 'locally' };
    }
  },

  // Save wallet transaction
  async saveWalletTransaction(userId, transactionData) {
    try {
      const response = await fetch(`${this.API_BASE}/wallet/transaction`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          userId,
          ...transactionData,
          timestamp: new Date()
        })
      });
      
      if (!response.ok) throw new Error('Wallet transaction failed');
      return await response.json();
    } catch (error) {
      console.log('Wallet API failed, storing locally:', transactionData);
      const transactions = JSON.parse(localStorage.getItem('walletTransactions') || '[]');
      transactions.push({ userId, ...transactionData, timestamp: new Date() });
      localStorage.setItem('walletTransactions', JSON.stringify(transactions));
      return { success: true, stored: 'locally' };
    }
  }
};

function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [currentPage, setCurrentPage] = useState('main');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [authForm, setAuthForm] = useState({ email: '', password: '', otp: '' });
  
  // Enhanced states
  const [showAI, setShowAI] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showSellProduct, setShowSellProduct] = useState(false);
  const [walletBalance, setWalletBalance] = useState(1500);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [interestedAds, setInterestedAds] = useState(new Set());
  const [removedAds, setRemovedAds] = useState(new Set());
  const [aiMessages, setAiMessages] = useState([
    { type: 'bot', message: 'Hello! I am your Quddle AI assistant. How can I help you today?' }
  ]);
  const [aiInput, setAiInput] = useState('');
  
  const [sellForm, setSellForm] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'new',
    address: '',
    category: '',
    images: []
  });

  // Enhanced deals with more ads
  const deals = [
    {
      id: 1,
      title: '50% Off Electronics',
      subtitle: 'TechMart',
      time: '2:30:15',
      price: 299,
      originalPrice: 599,
      image: '📱',
      category: 'electronics',
      isAd: true
    },
    {
      id: 2,
      title: 'Buy 1 Get 1 Pizza',
      subtitle: 'PizzaHub',
      time: '1:20:15',
      price: 15,
      originalPrice: 30,
      image: '🍕',
      category: 'food',
      isAd: false
    },
    {
      id: 3,
      title: '30% Off Fashion',
      subtitle: 'StyleZone',
      time: '4:10:45',
      price: 49,
      originalPrice: 70,
      image: '👕',
      category: 'fashion',
      isAd: true
    },
    {
      id: 4,
      title: 'Gaming Headset Deal',
      subtitle: 'GameWorld',
      time: '3:45:20',
      price: 79,
      originalPrice: 120,
      image: '🎧',
      category: 'gaming',
      isAd: true
    },
    {
      id: 5,
      title: 'Luxury Watch Collection',
      subtitle: 'TimeZone',
      time: '5:15:30',
      price: 299,
      originalPrice: 500,
      image: '⌚',
      category: 'fashion',
      isAd: true
    },
    {
      id: 6,
      title: 'Home Workout Equipment',
      subtitle: 'FitPro',
      time: '2:45:10',
      price: 199,
      originalPrice: 350,
      image: '💪',
      category: 'services',
      isAd: true
    },
    {
      id: 7,
      title: 'Fresh Organic Groceries',
      subtitle: 'FreshMart',
      time: '1:30:45',
      price: 45,
      originalPrice: 65,
      image: '🥗',
      category: 'food',
      isAd: true
    },
    {
      id: 8,
      title: 'Smart Home Devices',
      subtitle: 'SmartTech',
      time: '4:55:20',
      price: 159,
      originalPrice: 220,
      image: '🏡',
      category: 'electronics',
      isAd: true
    },
    {
      id: 9,
      title: 'Professional Photography',
      subtitle: 'PhotoPro',
      time: '3:20:30',
      price: 250,
      originalPrice: 400,
      image: '📸',
      category: 'services',
      isAd: true
    },
    {
      id: 10,
      title: 'Car Accessories Bundle',
      subtitle: 'AutoZone',
      time: '2:10:15',
      price: 89,
      originalPrice: 150,
      image: '🚗',
      category: 'cars',
      isAd: true
    }
  ];

  const categories = [
    { id: 'realestate', name: 'Real Estate', icon: '🏠' },
    { id: 'jobs', name: 'Jobs', icon: '💼' },
    { id: 'fashion', name: 'Fashion', icon: '👔' },
    { id: 'gaming', name: 'Gaming', icon: '🎮' },
    { id: 'food', name: 'Food', icon: '🍔' },
    { id: 'electronics', name: 'Electronics', icon: '📱' },
    { id: 'cars', name: 'Cars', icon: '🚗' },
    { id: 'services', name: 'Services', icon: '🛠️' }
  ];

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Enhanced auth with proper MongoDB integration
  const handleLogin = async () => {
    if (authMode === 'register') {
      if (!otpSent) {
        setOtpSent(true);
        // Log OTP request
        await dbService.saveUserAction('anonymous', 'otp_requested', { email: authForm.email });
        return;
      }
      if (authForm.otp === '1234') {
        const userData = { 
          email: authForm.email, 
          password: authForm.password, 
          action: 'register' 
        };
        
        const result = await dbService.authenticateUser(userData);
        
        if (result.success || result.user) {
          const newUser = result.user || { 
            id: Date.now(), 
            email: authForm.email, 
            name: authForm.email.split('@')[0] 
          };
          
          setUser(newUser);
          localStorage.setItem('currentUser', JSON.stringify(newUser));
          setShowAuth(false);
          setOtpSent(false);
          setAuthForm({ email: '', password: '', otp: '' });
          
          // Log successful registration
          await dbService.saveUserAction(newUser.id, 'user_registered', { 
            email: authForm.email,
            registeredAt: new Date()
          });
        }
      }
    } else {
      if (authForm.email && authForm.password) {
        const userData = { 
          email: authForm.email, 
          password: authForm.password, 
          action: 'login' 
        };
        
        const result = await dbService.authenticateUser(userData);
        
        if (result.success || result.user) {
          const loginUser = result.user || { 
            id: Date.now(), 
            email: authForm.email, 
            name: authForm.email.split('@')[0] 
          };
          
          setUser(loginUser);
          localStorage.setItem('currentUser', JSON.stringify(loginUser));
          setShowAuth(false);
          setAuthForm({ email: '', password: '', otp: '' });
          
          // Log successful login
          await dbService.saveUserAction(loginUser.id, 'user_login', { 
            email: authForm.email,
            loginAt: new Date()
          });
        }
      }
    }
  };

  const handleLogout = async () => {
    if (user) {
      await dbService.saveUserAction(user.id, 'user_logout', { logoutAt: new Date() });
    }
    setUser(null);
    setCart([]);
    setWalletBalance(1500);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  };

  // Enhanced cart functions with logging
  const addToCart = async (item) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === item.id);
      if (existing) {
        return prev.map(p => 
          p.id === item.id ? {...p, quantity: p.quantity + 1} : p
        );
      }
      return [...prev, {...item, quantity: 1}];
    });
    
    if (user) {
      await dbService.saveUserAction(user.id, 'item_added_to_cart', { 
        itemId: item.id, 
        itemTitle: item.title,
        price: item.price,
        category: item.category,
        isAd: item.isAd
      });
    }
  };

  const updateQuantity = async (id, quantity) => {
    if (quantity === 0) {
      setCart(prev => prev.filter(item => item.id !== id));
      if (user) {
        await dbService.saveUserAction(user.id, 'item_removed_from_cart', { itemId: id });
      }
    } else {
      setCart(prev => prev.map(item => 
        item.id === id ? {...item, quantity} : item
      ));
      if (user) {
        await dbService.saveUserAction(user.id, 'cart_quantity_updated', { itemId: id, quantity });
      }
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleBuyNow = (item) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    addToCart(item);
    setShowCart(true);
  };

  const handleCheckout = async () => {
    const total = getTotalPrice();
    
    if (paymentMethod === 'wallet' && walletBalance < total) {
      alert('Insufficient wallet balance!');
      return;
    }

    if (paymentMethod === 'wallet') {
      setWalletBalance(prev => prev - total);
      await dbService.saveWalletTransaction(user.id, {
        type: 'debit',
        amount: total,
        description: 'Purchase payment',
        items: cart.map(item => ({ id: item.id, title: item.title, quantity: item.quantity }))
      });
    }

    // Log purchase
    await dbService.saveUserAction(user.id, 'purchase_completed', {
      items: cart,
      total: total,
      paymentMethod: paymentMethod,
      purchasedAt: new Date()
    });

    setOrderSuccess(true);
    setCart([]);
    setShowCart(false);
    setTimeout(() => setOrderSuccess(false), 3000);
  };

  // Ad interaction functions
  const handleAdInterest = async (dealId, interested) => {
    if (interested) {
      setInterestedAds(prev => new Set([...prev, dealId]));
    } else {
      setInterestedAds(prev => {
        const newSet = new Set(prev);
        newSet.delete(dealId);
        return newSet;
      });
    }
    
    if (user) {
      await dbService.saveUserAction(user.id, 'ad_interaction', { 
        adId: dealId, 
        interested: interested,
        interactionAt: new Date()
      });
    }
  };

  const handleRemoveAd = async (dealId) => {
    setRemovedAds(prev => new Set([...prev, dealId]));
    if (user) {
      await dbService.saveUserAction(user.id, 'ad_removed', { 
        adId: dealId,
        removedAt: new Date()
      });
    }
  };

  // Sell product functions
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setSellForm(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  const handleSellProduct = async () => {
    if (!sellForm.title || !sellForm.price || !sellForm.address) {
      alert('Please fill all required fields');
      return;
    }

    const productData = {
      ...sellForm,
      sellerId: user.id,
      sellerName: user.name,
      sellerEmail: user.email,
      createdAt: new Date()
    };

    const result = await dbService.saveProductListing(user.id, productData);
    
    if (result.success) {
      await dbService.saveUserAction(user.id, 'product_listed', {
        productTitle: sellForm.title,
        price: sellForm.price,
        category: sellForm.category,
        listedAt: new Date()
      });

      alert('Product listed successfully!');
      setShowSellProduct(false);
      setSellForm({
        title: '',
        description: '',
        price: '',
        condition: 'new',
        address: '',
        category: '',
        images: []
      });
    }
  };

  // Enhanced AI Chat functionality
  const handleSendAIMessage = async () => {
    if (!aiInput.trim()) return;

    const userMessage = aiInput;
    setAiMessages(prev => [...prev, { type: 'user', message: userMessage }]);
    setAiInput('');

    // Log AI interaction
    if (user) {
      await dbService.saveUserAction(user.id, 'ai_interaction', {
        userMessage: userMessage,
        interactionAt: new Date()
      });
    }

    // Simple AI response logic
    setTimeout(() => {
      let botResponse = "I'm here to help you with Quddle!";
      
      const lowerMessage = userMessage.toLowerCase();
      
      if (lowerMessage.includes('deals') || lowerMessage.includes('offer')) {
        botResponse = "Check out our amazing flash deals! We have electronics, fashion, food, and more with great discounts.";
      } else if (lowerMessage.includes('sell')) {
        botResponse = "You can sell your products easily! Click the 'Sell' button in the header to list your items.";
      } else if (lowerMessage.includes('wallet')) {
        botResponse = `Your current wallet balance is $${walletBalance}. You can use it for quick payments!`;
      } else if (lowerMessage.includes('categories')) {
        botResponse = "We have 8 main categories: Real Estate, Jobs, Fashion, Gaming, Food, Electronics, Cars, and Services.";
      } else if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
        botResponse = "I can help you find deals, manage your wallet, sell products, or navigate the app. What do you need help with?";
      }
      
      setAiMessages(prev => [...prev, { type: 'bot', message: botResponse }]);
    }, 1000);
  };

  // Enhanced Deal Card
  const DealCard = ({ deal }) => {
    if (removedAds.has(deal.id)) return null;

    return (
      <div className="deal-card" style={{ position: 'relative' }}>
        {deal.isAd && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            display: 'flex',
            gap: '4px',
            zIndex: 10
          }}>
            <span style={{
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
              color: 'white',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}>
              AD
            </span>
            <button
              onClick={() => handleAdInterest(deal.id, !interestedAds.has(deal.id))}
              style={{
                background: interestedAds.has(deal.id) ? '#e91e63' : '#f5f5f5',
                color: interestedAds.has(deal.id) ? 'white' : '#666',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={interestedAds.has(deal.id) ? "Remove from interested" : "Mark as interested"}
            >
              <Heart size={12} fill={interestedAds.has(deal.id) ? 'white' : 'none'} />
            </button>
            <button
              onClick={() => handleRemoveAd(deal.id)}
              style={{
                background: '#ff5722',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Remove this ad"
            >
              <X size={12} />
            </button>
          </div>
        )}
        
        <div className="deal-header">
          <div className="deal-info">
            <h3>{deal.title}</h3>
            <p>{deal.subtitle}</p>
          </div>
          <div className="deal-timer">
            <Clock size={16} />
            <span>{deal.time}</span>
          </div>
        </div>
        
        <div className="deal-footer">
          <div className="deal-product">
            <span className="deal-emoji">{deal.image}</span>
            <div className="deal-prices">
              <span className="deal-price">${deal.price}</span>
              <span className="deal-original-price">${deal.originalPrice}</span>
            </div>
          </div>
          <div className="deal-actions">
            <button onClick={() => addToCart(deal)} className="btn-add-cart">
              Add to Cart
            </button>
            <button onClick={() => handleBuyNow(deal)} className="btn-buy-now">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced AI Modal
  const AIModal = () => (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px', height: '600px', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #dda0dd)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={20} color="white" />
            </div>
            Quddle AI Assistant
          </h2>
          <button onClick={() => setShowAI(false)} className="close-btn">
            <X size={24} />
          </button>
        </div>
        
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '16px', 
          background: '#f8f9fa',
          borderRadius: '8px',
          margin: '0 16px'
        }}>
          {aiMessages.map((msg, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '12px'
              }}
            >
              <div
                style={{
                  background: msg.type === 'user' 
                    ? 'linear-gradient(45deg, #667eea, #764ba2)' 
                    : 'linear-gradient(45deg, #f093fb, #f5576c)',
                  color: 'white',
                  padding: '10px 14px',
                  borderRadius: '18px',
                  maxWidth: '75%',
                  fontSize: '14px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                {msg.message}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ padding: '16px', display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="Ask me anything..."
            style={{
              flex: 1,
              padding: '12px',
              border: '2px solid #e1e5e9',
              borderRadius: '24px',
              outline: 'none',
              fontSize: '14px'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSendAIMessage()}
          />
          <button
            onClick={handleSendAIMessage}
            style={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="App">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">Q</div>
            <h1 className="logo-text">Quddle</h1>
          </div>
          
          <div className="header-actions">
            <button className="search-btn">
              <Search size={24} />
            </button>
            
            {user && (
              <button onClick={() => setShowWallet(true)} className="wallet-btn">
                <Wallet size={24} />
                <span style={{ fontSize: '12px', marginLeft: '4px' }}>
                  ${walletBalance}
                </span>
              </button>
            )}
            
            <button onClick={() => setShowCart(true)} className="cart-btn">
              <ShoppingCart size={24} />
              {cart.length > 0 && (
                <span className="cart-badge">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
            
            {user ? (
              <div className="user-info">
                <span className="user-name">Hi, {user.name}!</span>
                <button onClick={() => setShowSellProduct(true)} className="sell-btn">
                  <DollarSign size={20} />
                  Sell
                </button>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAuth(true)} className="login-btn">
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Floating AI Button - Enhanced with colorful gradient */}
      {!showAI && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '20px',
          zIndex: 1000
        }}>
          <button
            onClick={() => setShowAI(true)}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #dda0dd)',
              backgroundSize: '300% 300%',
              animation: 'gradient-shift 3s ease infinite',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 12px 30px rgba(0,0,0,0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
            }}
          >
            <Bot size={28} color="white" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        {currentTab === 'home' && (
          <>
            {currentPage === 'main' ? (
              <>
                <section>
                  {deals.slice(0, 4).map(deal => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
                </section>

                <div className="categories-section">
                  <h2 className="section-title">Categories</h2>
                  <div className="categories-grid">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setCurrentPage(`category-${category.id}`)}
                        className="category-card"
                      >
                        <span className="category-emoji">{category.icon}</span>
                        <span className="category-name">{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : currentPage.startsWith('category-') ? (
              <div>
                <div className="page-header">
                  <button onClick={() => setCurrentPage('main')} className="back-btn">
                    <ArrowLeft size={20} />
                  </button>
                  <div className="page-title">
                    {categories.find(c => c.id === currentPage.replace('category-', ''))?.name}
                  </div>
                </div>
                {deals
                  .filter(deal => deal.category === currentPage.replace('category-', ''))
                  .map(deal => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
              </div>
            ) : null}
          </>
        )}

        {currentTab === 'market' && (
          <section>
            <h2 className="section-title">All Deals</h2>
            {deals.map(deal => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </section>
        )}

        {currentTab === 'videos' && (
          <div className="empty-state">
            <Play size={64} className="empty-state-icon" />
            <h2 className="empty-state-title">Videos</h2>
            <p className="empty-state-text">Video content coming soon!</p>
          </div>
        )}

        {currentTab === 'events' && (
          <div className="empty-state">
            <Calendar size={64} className="empty-state-icon" />
            <h2 className="empty-state-title">Events</h2>
            <p className="empty-state-text">No upcoming events</p>
          </div>
        )}

        {currentTab === 'profile' && (
          <div>
            {user ? (
              <div>
                {/* User Info Section */}
                <div className="empty-state" style={{ paddingBottom: '1rem' }}>
                  <User size={64} className="empty-state-icon" />
                  <h2 className="empty-state-title">{user.name}</h2>
                  <p className="empty-state-text">{user.email}</p>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button
                      onClick={() => setShowSellProduct(true)}
                      style={{
                        background: 'linear-gradient(45deg, #10b981, #059669)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Package size={16} />
                      Sell Product
                    </button>
                    <button
                      onClick={() => setShowWallet(true)}
                      style={{
                        background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Wallet size={16} />
                      My Wallet
                    </button>
                  </div>
                </div>

                {/* My Products Section */}
                <div style={{ marginTop: '2rem' }}>
                  <h2 className="section-title">My Products</h2>
                  {JSON.parse(localStorage.getItem('userProducts') || '[]')
                    .filter(product => product.sellerId === user.id || product.sellerId === user.email)
                    .length === 0 ? (
                    <div style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '2rem',
                      textAlign: 'center',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                    }}>
                      <Package size={48} color="#a0aec0" />
                      <h3 style={{ color: '#2d3748', margin: '1rem 0 0.5rem 0' }}>No Products Listed</h3>
                      <p style={{ color: '#718096', marginBottom: '1rem' }}>Start selling by listing your first product</p>
                      <button
                        onClick={() => setShowSellProduct(true)}
                        style={{
                          background: 'linear-gradient(45deg, #10b981, #059669)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          cursor: 'pointer'
                        }}
                      >
                        List Your First Product
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                      {JSON.parse(localStorage.getItem('userProducts') || '[]')
                        .filter(product => product.sellerId === user.id || product.sellerId === user.email)
                        .map((product, index) => (
                          <div key={index} style={{
                            background: 'white',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                            transition: 'transform 0.3s ease'
                          }}>
                            {/* Product Images */}
                            <div style={{
                              height: '200px',
                              background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative'
                            }}>
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.title}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                              ) : (
                                <Package size={48} color="#a0aec0" />
                              )}
                              <div style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: categories.find(c => c.id === product.category)?.id ? '#10b981' : '#6b7280',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}>
                                {categories.find(c => c.id === product.category)?.name || 'General'}
                              </div>
                            </div>

                            {/* Product Details */}
                            <div style={{ padding: '1rem' }}>
                              <h3 style={{
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                color: '#2d3748',
                                marginBottom: '0.5rem',
                                lineHeight: '1.3'
                              }}>
                                {product.title}
                              </h3>
                              
                              <p style={{
                                color: '#718096',
                                fontSize: '0.9rem',
                                marginBottom: '0.75rem',
                                lineHeight: '1.4',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}>
                                {product.description || 'No description provided'}
                              </p>

                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.75rem'
                              }}>
                                <span style={{
                                  fontSize: '1.5rem',
                                  fontWeight: '700',
                                  color: '#10b981'
                                }}>
                                  ${product.price}
                                </span>
                                <span style={{
                                  background: product.condition === 'new' ? '#10b981' : product.condition === 'like-new' ? '#3b82f6' : '#f59e0b',
                                  color: 'white',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  textTransform: 'capitalize'
                                }}>
                                  {product.condition?.replace('-', ' ')}
                                </span>
                              </div>

                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: '#718096',
                                fontSize: '0.8rem',
                                marginBottom: '1rem'
                              }}>
                                <MapPin size={14} />
                                <span>{product.address || 'Location not specified'}</span>
                              </div>

                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: '#718096',
                                fontSize: '0.8rem'
                              }}>
                                <Clock size={14} />
                                <span>Listed {new Date(product.createdAt).toLocaleDateString()}</span>
                              </div>

                              {/* Additional Images Preview */}
                              {product.images && product.images.length > 1 && (
                                <div style={{
                                  display: 'flex',
                                  gap: '4px',
                                  marginTop: '0.75rem',
                                  flexWrap: 'wrap'
                                }}>
                                  {product.images.slice(1, 4).map((img, imgIndex) => (
                                    <img
                                      key={imgIndex}
                                      src={img}
                                      alt={`${product.title} ${imgIndex + 2}`}
                                      style={{
                                        width: '40px',
                                        height: '40px',
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        border: '2px solid #e5e7eb'
                                      }}
                                    />
                                  ))}
                                  {product.images.length > 4 && (
                                    <div style={{
                                      width: '40px',
                                      height: '40px',
                                      background: '#f3f4f6',
                                      borderRadius: '8px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '12px',
                                      color: '#6b7280',
                                      fontWeight: '600'
                                    }}>
                                      +{product.images.length - 4}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  style={{
                    background: 'linear-gradient(45deg, #ef4444, #dc2626)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    marginTop: '2rem',
                    width: '100%',
                    fontWeight: '600'
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="empty-state">
                <User size={64} className="empty-state-icon" />
                <h2 className="empty-state-title">Profile</h2>
                <button
                  onClick={() => setShowAuth(true)}
                  className="submit-btn"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {[
          { id: 'home', icon: Home, label: 'Home' },
          { id: 'videos', icon: Play, label: 'Videos' },
          { id: 'market', icon: Store, label: 'Market' },
          { id: 'events', icon: Calendar, label: 'Events' },
          { id: 'profile', icon: User, label: 'Profile' }
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setCurrentTab(id)}
            className={`nav-button ${currentTab === id ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Enhanced Auth Modal */}
      {showAuth && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {authMode === 'login' ? 'Welcome Back' : 'Join Quddle'}
              </h2>
              <button onClick={() => setShowAuth(false)} className="close-btn">
                <X size={24} />
              </button>
            </div>
            
            <div className="form-group">
              <input
                type="email"
                placeholder="Email Address"
                value={authForm.email}
                onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                className="form-input"
              />
              
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                  className="form-input"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {authMode === 'register' && otpSent && (
                <div>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={authForm.otp}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, otp: e.target.value }))}
                    className="form-input"
                  />
                  <p style={{ fontSize: '12px', color: '#10b981', textAlign: 'center' }}>
                    Demo OTP: 1234
                  </p>
                </div>
              )}

              <button onClick={handleLogin} className="submit-btn">
                {authMode === 'register' && !otpSent 
                  ? 'Send OTP' 
                  : authMode === 'register' 
                  ? 'Verify & Register' 
                  : 'Login'
                }
              </button>
            </div>

            <div className="auth-switch">
              <button
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setOtpSent(false);
                  setAuthForm({ email: '', password: '', otp: '' });
                }}
                className="switch-btn"
              >
                {authMode === 'login' 
                  ? "Don't have an account? Register" 
                  : "Already have an account? Login"
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Cart Modal */}
      {showCart && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Shopping Cart</h2>
              <button onClick={() => setShowCart(false)} className="close-btn">
                <X size={24} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-state">
                <ShoppingCart size={64} className="empty-state-icon" />
                <p className="empty-state-text">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-image">{item.image}</div>
                      <div className="cart-item-info">
                        <h3 className="cart-item-title">{item.title}</h3>
                        <p className="cart-item-price">${item.price}</p>
                      </div>
                      <div className="quantity-controls">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="quantity-btn decrease"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="quantity-btn increase"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Enhanced Payment Selection */}
                <div className="payment-selection">
                  <h4>Choose Payment Method</h4>
                  <div className="payment-options">
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="wallet"
                        checked={paymentMethod === 'wallet'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div style={{
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        borderRadius: '8px',
                        padding: '4px',
                        color: 'white'
                      }}>
                        <Wallet size={20} />
                      </div>
                      <div className="payment-details">
                        <span>Quddle Wallet</span>
                        <span style={{
                          fontSize: '12px',
                          color: walletBalance >= getTotalPrice() ? '#10b981' : '#ef4444'
                        }}>
                          Balance: ${walletBalance}
                        </span>
                      </div>
                    </label>
                    
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div style={{
                        background: 'linear-gradient(45deg, #f093fb, #f5576c)',
                        borderRadius: '8px',
                        padding: '4px',
                        color: 'white'
                      }}>
                        <CreditCard size={20} />
                      </div>
                      <div className="payment-details">
                        <span>Credit/Debit Card</span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          **** **** **** 1234
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="cart-total">
                  <div className="total-amount">
                    Total: ${getTotalPrice().toLocaleString()}
                  </div>
                  <button
                    onClick={handleCheckout}
                    style={{
                      background: paymentMethod === 'wallet' && walletBalance < getTotalPrice()
                        ? '#9ca3af'
                        : 'linear-gradient(45deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: paymentMethod === 'wallet' && walletBalance < getTotalPrice() ? 'not-allowed' : 'pointer',
                      width: '100%'
                    }}
                    disabled={paymentMethod === 'wallet' && walletBalance < getTotalPrice()}
                  >
                    {paymentMethod === 'wallet' && walletBalance < getTotalPrice() 
                      ? 'Insufficient Balance' 
                      : 'Complete Purchase'
                    }
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Wallet Modal */}
      {showWallet && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Wallet size={18} color="white" />
                </div>
                Quddle Wallet
              </h2>
              <button onClick={() => setShowWallet(false)} className="close-btn">
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '24px',
                borderRadius: '16px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', opacity: 0.9 }}>Available Balance</h3>
                <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
                  ${walletBalance.toLocaleString()}
                </div>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Ready to spend</p>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <button
                  onClick={() => {
                    const amount = prompt('Enter amount to add (minimum $10):');
                    if (amount && !isNaN(amount) && parseFloat(amount) >= 10) {
                      const addAmount = parseFloat(amount);
                      setWalletBalance(prev => prev + addAmount);
                      if (user) {
                        dbService.saveWalletTransaction(user.id, {
                          type: 'credit',
                          amount: addAmount,
                          description: `Added money to wallet`
                        });
                        dbService.saveUserAction(user.id, 'wallet_topup', {
                          amount: addAmount,
                          topupAt: new Date()
                        });
                      }
                      alert(`Successfully added ${addAmount} to your wallet!`);
                    } else {
                      alert('Please enter a valid amount (minimum $10)');
                    }
                  }}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(45deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontWeight: '600'
                  }}
                >
                  <Plus size={18} />
                  Add Money
                </button>
                <button
                  style={{
                    flex: 1,
                    background: 'linear-gradient(45deg, #f093fb, #f5576c)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontWeight: '600'
                  }}
                >
                  <Smartphone size={18} />
                  Send Money
                </button>
              </div>
              
              <div style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '12px',
                border: '1px solid #e9ecef'
              }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#495057' }}>Quick Stats</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
                      ${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>Cart Total</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#667eea' }}>
                      {user ? '5' : '0'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>Transactions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Sell Product Modal */}
      {showSellProduct && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  background: 'linear-gradient(45deg, #10b981, #059669)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Package size={18} color="white" />
                </div>
                Sell Your Product
              </h2>
              <button onClick={() => setShowSellProduct(false)} className="close-btn">
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Product Title *
                  </label>
                  <input
                    type="text"
                    value={sellForm.title}
                    onChange={(e) => setSellForm(prev => ({...prev, title: e.target.value}))}
                    placeholder="What are you selling?"
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Description
                  </label>
                  <textarea
                    value={sellForm.description}
                    onChange={(e) => setSellForm(prev => ({...prev, description: e.target.value}))}
                    placeholder="Describe your product in detail"
                    className="form-input"
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      value={sellForm.price}
                      onChange={(e) => setSellForm(prev => ({...prev, price: e.target.value}))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                      Condition
                    </label>
                    <select
                      value={sellForm.condition}
                      onChange={(e) => setSellForm(prev => ({...prev, condition: e.target.value}))}
                      className="form-input"
                    >
                      <option value="new">Brand New</option>
                      <option value="like-new">Like New</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Category
                  </label>
                  <select
                    value={sellForm.category}
                    onChange={(e) => setSellForm(prev => ({...prev, category: e.target.value}))}
                    className="form-input"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Location/Address *
                  </label>
                  <input
                    type="text"
                    value={sellForm.address}
                    onChange={(e) => setSellForm(prev => ({...prev, address: e.target.value}))}
                    placeholder="Enter your location"
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Product Images
                  </label>
                  <div style={{
                    border: '2px dashed #d1d5db',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center',
                    marginBottom: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.borderColor = '#10b981'}
                  onMouseLeave={(e) => e.target.style.borderColor = '#d1d5db'}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
                      <Camera size={32} color="#6b7280" style={{ marginBottom: '8px' }} />
                      <p style={{ margin: 0, color: '#6b7280' }}>Click to upload product images</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
                        Upload multiple images for better visibility
                      </p>
                    </label>
                  </div>
                  
                  {sellForm.images.length > 0 && (
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
                      gap: '8px' 
                    }}>
                      {sellForm.images.map((img, index) => (
                        <div key={index} style={{ position: 'relative' }}>
                          <img
                            src={img}
                            alt={`Product ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '80px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '2px solid #e5e7eb'
                            }}
                          />
                          <button
                            onClick={() => setSellForm(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index)
                            }))}
                            style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              cursor: 'pointer',
                              fontSize: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSellProduct}
                  disabled={!sellForm.title || !sellForm.price || !sellForm.address}
                  style={{
                    background: (!sellForm.title || !sellForm.price || !sellForm.address) 
                      ? '#9ca3af' 
                      : 'linear-gradient(45deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: (!sellForm.title || !sellForm.price || !sellForm.address) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '8px'
                  }}
                >
                  <Upload size={18} />
                  List My Product
                </button>
                
                {(!sellForm.title || !sellForm.price || !sellForm.address) && (
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#ef4444', 
                    textAlign: 'center', 
                    margin: '8px 0 0 0' 
                  }}>
                    Please fill in all required fields (*)
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {showAI && <AIModal />}

      {/* Success Message */}
      {orderSuccess && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(45deg, #10b981, #059669)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: '600'
        }}>
          <Check size={24} />
          <span>Order placed successfully!</span>
        </div>
      )}

      {/* CSS Animation for floating AI button */}
      <style>
        {`
          @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </div>
  );
}

export default App;