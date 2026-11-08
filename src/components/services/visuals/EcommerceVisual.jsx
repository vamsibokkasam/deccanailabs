import { CreditCard, ShoppingCart } from "lucide-react";

function EcommerceVisual() {
  return (
    <div className="svc-visual svc-visual--ecommerce">
      <div className="svc-visual-stage" aria-hidden="true">
        <div className="svc-visual-glow" />

        <div className="svc-shop-grid">
          <div className="svc-product-card svc-float-soft" style={{ animationDelay: "0s" }}>
            <div className="svc-product-thumb" />
            <div className="svc-visual-skeleton svc-visual-skeleton--line" />
            <div className="svc-product-price">₹1,299</div>
          </div>
          <div className="svc-product-card svc-float-soft" style={{ animationDelay: "0.35s" }}>
            <div className="svc-product-thumb alt" />
            <div className="svc-visual-skeleton svc-visual-skeleton--line" />
            <div className="svc-product-price">₹899</div>
          </div>

          <div className="svc-cart-panel svc-float-soft" style={{ animationDelay: "0.7s" }}>
            <div className="svc-cms-panel-head">
              <ShoppingCart size={14} />
              <span>Cart · 2 items</span>
            </div>
            <div className="svc-cart-row">
              <span /><span>₹2,198</span>
            </div>
            <div className="svc-cart-row muted">
              <span>Delivery</span>
              <span>Free</span>
            </div>
            <div className="svc-cms-btn solid wide">Checkout</div>
          </div>
        </div>

        <div className="svc-pay-badge svc-float-soft" style={{ animationDelay: "1.1s" }}>
          <CreditCard size={14} />
          <span>UPI · Cards · Razorpay</span>
        </div>

        <div className="svc-stat-badge svc-stat-badge--tl" style={{ animationDelay: "0.25s" }}>
          Secure payments
        </div>
        <div className="svc-stat-badge svc-stat-badge--br" style={{ animationDelay: "0.95s" }}>
          Sell 24/7
        </div>
      </div>
    </div>
  );
}

export default EcommerceVisual;
