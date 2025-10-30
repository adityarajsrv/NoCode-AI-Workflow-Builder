import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const PremiumUpgrade = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState("method");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: "",
    upiId: "",
  });

  const GITHUB_REPO_URL =
    "https://github.com/adityarajsrv/NoCode-AI-Workflow-Builder";

  const handleUpgradeClick = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.email && !user.username) {
      alert("Please login to upgrade to premium!");
      return;
    }

    if (user.tier === "premium") {
      alert("🎉 You are already a Premium member! Enjoy unlimited workflows.");
      return;
    }

    setShowPaymentModal(true);
    setPaymentStep("method");
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    setPaymentStep(method);
  };

  const handleCardPayment = (e) => {
    e.preventDefault();
    setPaymentStep("processing");

    setTimeout(() => {
      window.open(GITHUB_REPO_URL, "_blank");

      setTimeout(() => {
        setPaymentStep("success");
        upgradeUserToPremium();
      }, 2000);
    }, 1500);
  };

  const upgradeUserToPremium = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    user.tier = "premium";
    localStorage.setItem("user", JSON.stringify(user));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "cardNumber") {
      const formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim();
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
      return;
    }

    if (name === "expiry") {
      const formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2");
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const userWorkflows = JSON.parse(
    localStorage.getItem("userWorkflows") || "[]"
  );
  const user = JSON.parse(localStorage.getItem("user") || '{"tier": "free"}');

  const buttonText =
    user.tier === "premium"
      ? "🎉 Premium"
      : `🚀 Go Premium ${userWorkflows.length >= 3 ? "(Limit Reached!)" : ""}`;

  const buttonClass =
    user.tier === "premium"
      ? "ml-4 px-4 py-2 bg-green-600 text-white rounded-full font-semibold cursor-default shadow-sm border border-green-700"
      : "ml-4 px-4 py-2 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-all shadow-sm hover:shadow cursor-pointer";

  return (
    <>
      <button
        onClick={handleUpgradeClick}
        className={buttonClass}
        disabled={user.tier === "premium"}
      >
        {buttonText}
      </button>

      {showPaymentModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🚀</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Upgrade to Premium</h2>
                  <p className="text-purple-100 text-sm">
                    {userWorkflows.length >= 3
                      ? "You've reached the free tier limit!"
                      : "Unlock unlimited workflows"}
                  </p>
                </div>
              </div>
            </div>
            {paymentStep === "method" && (
              <div className="p-6">
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">Premium Plan</h3>
                      <p className="text-gray-600 text-sm">
                        Unlimited workflows & premium features
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        $29<span className="text-sm text-gray-600">/month</span>
                      </div>
                      <div className="text-sm text-gray-500 line-through">
                        $99
                      </div>
                    </div>
                  </div>
                  {userWorkflows.length >= 3 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                      <p className="text-yellow-800 text-sm font-medium">
                        ⚠️ You&apos;ve created {userWorkflows.length}/3
                        workflows
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => handlePaymentMethodSelect("card")}
                    className="w-full bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-4 text-left transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            Credit/Debit Card
                          </h4>
                          <p className="text-gray-600 text-sm">
                            Pay with Visa, Mastercard, or RuPay
                          </p>
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </button>
                  <button
                    onClick={() => handlePaymentMethodSelect("upi")}
                    className="w-full bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-4 text-left transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            UPI Payment
                          </h4>
                          <p className="text-gray-600 text-sm">
                            Instant payment with any UPI app
                          </p>
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </button>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-gray-500 text-xs">
                    🔒 Secure payment • No money charged • Demo simulation
                  </p>
                </div>
              </div>
            )}
            {paymentStep === "card" && (
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <button
                    onClick={() => setPaymentStep("method")}
                    className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer p-1 hover:bg-gray-100 rounded"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Card Payment
                  </h3>
                </div>
                <form onSubmit={handleCardPayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="4242 4242 4242 4242"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors cursor-pointer shadow-sm mt-4"
                  >
                    Pay $29.00
                  </button>
                </form>
              </div>
            )}
            {paymentStep === "upi" && (
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <button
                    onClick={() => setPaymentStep("method")}
                    className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer p-1 hover:bg-gray-100 rounded"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900">
                    UPI Payment
                  </h3>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
                  <div className="mb-4 flex justify-center items-center">
                    <QRCodeSVG value={GITHUB_REPO_URL} size={160} />
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-300">
                      <p className="text-gray-600 text-sm">Amount</p>
                      <p className="text-gray-900 font-semibold">$29.00</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Scan this QR code to pay (Google Lens lol...)
                  </p>
                  <button
                    onClick={() => {
                      setPaymentStep("processing");
                      setTimeout(() => {
                        setPaymentStep("success");
                        upgradeUserToPremium();
                      }, 2000);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors cursor-pointer shadow-sm"
                  >
                    I&apos;ve Completed Payment
                  </button>
                </div>
              </div>
            )}
            {paymentStep === "processing" && (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Processing Payment
                </h3>
                <p className="text-gray-600 mb-4">
                  {paymentMethod === "card"
                    ? "Verifying card details and processing payment..."
                    : "Processing UPI payment request..."}
                </p>
                <div className="bg-gray-100 rounded-lg p-3 border border-gray-300">
                  <p className="text-gray-700 text-sm">
                    Redirecting to secure payment gateway...
                  </p>
                </div>
              </div>
            )}
            {paymentStep === "success" && (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Welcome to Premium! 🎉
                </h3>
                <p className="text-gray-600 mb-4">
                  Your payment was successful and premium features are now
                  active
                </p>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200 mb-4">
                  <h4 className="font-semibold text-green-900 mb-2">
                    Premium Features Unlocked
                  </h4>
                  <div className="space-y-1 text-sm text-green-800 text-left">
                    <div className="flex items-center space-x-2">
                      <span>✓</span>
                      <span>Unlimited workflow creations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>✓</span>
                      <span>Advanced AI models access</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>✓</span>
                      <span>Priority customer support</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>✓</span>
                      <span>Export & API capabilities</span>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 text-sm">
                    <strong>Note:</strong> This is a demo simulation. No actual
                    payment was processed.
                    <br />
                    <a
                      href={GITHUB_REPO_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-900"
                    >
                      View project repository
                    </a>
                  </p>
                </div>
              </div>
            )}
            <div className="px-6 pb-6">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentStep("method");
                  setFormData({
                    cardNumber: "",
                    expiry: "",
                    cvv: "",
                    name: "",
                    upiId: "",
                  });
                  if (paymentStep === "success") {
                    window.location.reload();
                  }
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-colors cursor-pointer border border-gray-300"
              >
                {paymentStep === "success"
                  ? "Start Building 🚀"
                  : "Cancel Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PremiumUpgrade;
