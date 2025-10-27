// Global State
const state = {
    cart: [],
    customPerfume: {
        top: null,
        heart: null,
        base: null
    },
    currentStep: 1
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializePerfumeCreator();
    initializeProductFilters();
    initializeCart();
    initializeScrollAnimations();
    initializeMobileMenu();
    loadCartFromStorage();
});

// Navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.querySelector('.header');

    // Smooth scroll for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Sticky header effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Mobile Menu
function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
    }
}

// Perfume Creator
function initializePerfumeCreator() {
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.step-content');
    const prevBtn = document.getElementById('prevStep');
    const nextBtn = document.getElementById('nextStep');
    const fragranceCards = document.querySelectorAll('.fragrance-card');

    // Step navigation
    steps.forEach((step, index) => {
        step.addEventListener('click', () => {
            if (index + 1 <= state.currentStep || validatePreviousSteps(index + 1)) {
                goToStep(index + 1);
            }
        });
    });

    // Fragrance selection
    fragranceCards.forEach(card => {
        const selectBtn = card.querySelector('.select-btn');
        selectBtn.addEventListener('click', () => {
            selectFragrance(card);
        });

        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('select-btn')) {
                selectFragrance(card);
            }
        });
    });

    // Navigation buttons
    prevBtn?.addEventListener('click', () => {
        if (state.currentStep > 1) {
            goToStep(state.currentStep - 1);
        }
    });

    nextBtn?.addEventListener('click', () => {
        if (state.currentStep < 4) {
            if (validateCurrentStep()) {
                goToStep(state.currentStep + 1);
            } else {
                showNotification('Please select a fragrance before proceeding', 'warning');
            }
        }
    });

    // Add custom perfume to cart
    const addCustomBtn = document.querySelector('.add-custom-to-cart');
    addCustomBtn?.addEventListener('click', () => {
        addCustomPerfumeToCart();
    });

    // Bottle size change
    const bottleSizeSelect = document.querySelector('.bottle-size');
    bottleSizeSelect?.addEventListener('change', updateCustomPerfumePrice);
}

function selectFragrance(card) {
    const layer = card.dataset.layer;
    const scent = card.dataset.scent;

    // Remove previous selection in the same layer
    document.querySelectorAll(`.fragrance-card[data-layer="${layer}"]`).forEach(c => {
        c.classList.remove('selected');
    });

    // Add selection
    card.classList.add('selected');
    state.customPerfume[layer] = scent;

    // Update summary if on review step
    if (state.currentStep === 4) {
        updatePerfumeSummary();
    }
}

function goToStep(stepNumber) {
    // Update step indicators
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.toggle('active', index + 1 <= stepNumber);
    });

    // Update step content
    document.querySelectorAll('.step-content').forEach((content, index) => {
        content.classList.toggle('active', index + 1 === stepNumber);
    });

    // Update navigation buttons
    const prevBtn = document.getElementById('prevStep');
    const nextBtn = document.getElementById('nextStep');

    if (prevBtn) prevBtn.disabled = stepNumber === 1;
    if (nextBtn) {
        if (stepNumber === 4) {
            nextBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'block';
            nextBtn.textContent = stepNumber === 3 ? 'Review Creation' : 'Next Step';
        }
    }

    state.currentStep = stepNumber;

    // Update summary when reaching review step
    if (stepNumber === 4) {
        updatePerfumeSummary();
    }
}

function validateCurrentStep() {
    switch (state.currentStep) {
        case 1:
            return state.customPerfume.top !== null;
        case 2:
            return state.customPerfume.heart !== null;
        case 3:
            return state.customPerfume.base !== null;
        default:
            return true;
    }
}

function validatePreviousSteps(targetStep) {
    for (let i = 1; i < targetStep; i++) {
        state.currentStep = i;
        if (!validateCurrentStep()) {
            state.currentStep = targetStep;
            return false;
        }
    }
    state.currentStep = targetStep;
    return true;
}

function updatePerfumeSummary() {
    document.getElementById('selected-top').textContent =
        state.customPerfume.top ? capitalize(state.customPerfume.top) : '-';
    document.getElementById('selected-heart').textContent =
        state.customPerfume.heart ? capitalize(state.customPerfume.heart) : '-';
    document.getElementById('selected-base').textContent =
        state.customPerfume.base ? capitalize(state.customPerfume.base) : '-';
}

function updateCustomPerfumePrice() {
    const bottleSizeSelect = document.querySelector('.bottle-size');
    const priceDisplay = document.querySelector('.price-value');

    const prices = {
        '30ml': 89,
        '50ml': 129,
        '100ml': 199
    };

    if (bottleSizeSelect && priceDisplay) {
        const selectedSize = bottleSizeSelect.value;
        priceDisplay.textContent = `$${prices[selectedSize]}`;
    }
}

function addCustomPerfumeToCart() {
    if (!state.customPerfume.top || !state.customPerfume.heart || !state.customPerfume.base) {
        showNotification('Please complete your perfume creation first', 'warning');
        return;
    }

    const bottleSizeSelect = document.querySelector('.bottle-size');
    const customLabel = document.querySelector('.custom-label');

    const prices = {
        '30ml': 89,
        '50ml': 129,
        '100ml': 199
    };

    const customProduct = {
        id: `custom_${Date.now()}`,
        name: customLabel.value || 'Custom Creation',
        description: `${capitalize(state.customPerfume.top)} • ${capitalize(state.customPerfume.heart)} • ${capitalize(state.customPerfume.base)}`,
        price: prices[bottleSizeSelect.value],
        size: bottleSizeSelect.value,
        type: 'custom',
        quantity: 1
    };

    addToCart(customProduct);

    // Reset custom perfume
    state.customPerfume = { top: null, heart: null, base: null };
    document.querySelectorAll('.fragrance-card').forEach(card => {
        card.classList.remove('selected');
    });
    goToStep(1);

    showNotification('Your custom perfume has been added to cart!', 'success');
}

// Product Filters
function initializeProductFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter products
            productCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Add to cart buttons
    const addToCartBtns = document.querySelectorAll('.btn-add-to-cart');
    addToCartBtns.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.product-card');
            const product = extractProductInfo(card, index);
            addToCart(product);
        });
    });
}

function extractProductInfo(card, index) {
    const name = card.querySelector('h4').textContent;
    const description = card.querySelector('.product-description').textContent;
    const priceText = card.querySelector('.price').textContent;
    const price = parseInt(priceText.replace('$', ''));

    return {
        id: `product_${index}`,
        name,
        description,
        price,
        quantity: 1
    };
}

// Shopping Cart
function initializeCart() {
    const cartBtn = document.querySelector('.cart-btn');
    const cartModal = document.getElementById('cartModal');
    const closeCartBtn = document.querySelector('.close-cart');

    cartBtn?.addEventListener('click', () => {
        cartModal.classList.add('active');
        renderCart();
    });

    closeCartBtn?.addEventListener('click', () => {
        cartModal.classList.remove('active');
    });

    cartModal?.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('active');
        }
    });
}

function addToCart(product) {
    const existingItem = state.cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        state.cart.push(product);
    }

    updateCartCount();
    saveCartToStorage();

    // Animate cart icon
    const cartBtn = document.querySelector('.cart-btn');
    cartBtn.classList.add('bounce');
    setTimeout(() => cartBtn.classList.remove('bounce'), 500);

    showNotification(`${product.name} added to cart!`, 'success');
}

function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id !== productId);
    updateCartCount();
    saveCartToStorage();
    renderCart();
}

function updateQuantity(productId, change) {
    const item = state.cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCartToStorage();
            renderCart();
        }
    }
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const totalPriceElement = document.querySelector('.total-price');

    if (state.cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Your cart is empty</p>';
        totalPriceElement.textContent = '$0';
        return;
    }

    let total = 0;
    cartItems.innerHTML = state.cart.map(item => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item">
                <div class="cart-item-image"></div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart('${item.id}')" style="background: none; border: none; color: #999; cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }).join('');

    totalPriceElement.textContent = `$${total}`;
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Storage
function saveCartToStorage() {
    localStorage.setItem('perfume_cart', JSON.stringify(state.cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('perfume_cart');
    if (savedCart) {
        state.cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

// Animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Stagger animations for grid items
                if (entry.target.classList.contains('product-card') ||
                    entry.target.classList.contains('collection-card')) {
                    const cards = entry.target.parentElement.querySelectorAll('.visible');
                    entry.target.style.animationDelay = `${cards.length * 0.1}s`;
                }
            }
        });
    }, observerOptions);

    // Observe elements
    document.querySelectorAll('.product-card, .collection-card, .feature, .section-header').forEach(el => {
        observer.observe(el);
    });
}

// Newsletter
document.querySelector('.newsletter-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    showNotification(`Thank you for subscribing with ${email}!`, 'success');
    e.target.reset();
});

// Utility Functions
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS for notifications and animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    @keyframes bounce {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.2);
        }
    }

    .cart-btn.bounce {
        animation: bounce 0.5s ease-in-out;
    }

    .header.scrolled {
        padding: 0.5rem 0;
        box-shadow: 0 5px 30px rgba(0,0,0,0.1);
    }

    .nav-menu.active {
        display: flex !important;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        flex-direction: column;
        background: white;
        padding: 20px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .mobile-menu-btn.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }

    .mobile-menu-btn.active span:nth-child(2) {
        opacity: 0;
    }

    .mobile-menu-btn.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }

    .visible {
        animation: fadeInUp 0.6s ease-out forwards;
    }

    @media (max-width: 768px) {
        .notification {
            right: 10px !important;
            left: 10px !important;
            max-width: calc(100% - 20px) !important;
        }
    }
`;
document.head.appendChild(style);

// Hero section parallax
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-bottle');

    parallaxElements.forEach(el => {
        const speed = el.classList.contains('bottle-1') ? 0.5 :
                      el.classList.contains('bottle-2') ? 0.3 : 0.7;
        el.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Collection cards hover effect
document.querySelectorAll('.collection-card').forEach(card => {
    card.addEventListener('mouseenter', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// Smooth page load
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Search functionality
document.querySelector('.search-btn')?.addEventListener('click', () => {
    showNotification('Search feature coming soon!', 'info');
});

// User account
document.querySelector('.user-btn')?.addEventListener('click', () => {
    showNotification('User accounts coming soon!', 'info');
});

console.log('Essence of Arabia - Luxury Perfume Shop Initialized ✨');