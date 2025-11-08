/* eslint-disable react/prop-types */
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "react-toastify";

const PremiumUpgrade = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState("method");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: "",
    upiId: "",
  });
  const [formErrors, setFormErrors] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: "",
    upiId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const GITHUB_REPO_URL = "https://github.com/adityarajsrv/FlowMind-AI";
  const AUTH_API = import.meta.env.VITE_AUTH_API;

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleClose = externalOnClose || (() => setInternalIsOpen(false));

  const userWorkflows = JSON.parse(
    localStorage.getItem("userWorkflows") || "[]"
  );
  const user = JSON.parse(localStorage.getItem("user") || '{"tier": "free"}');
  const isPremium = user.tier === "premium";

  const handleUpgradeClick = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.email && !user.username) {
      toast.error("Please login to upgrade to premium!");
      return;
    }

    if (user.tier === "premium") {
      toast.success(
        "🎉 You are already a Premium member! Enjoy unlimited workflows."
      );
      return;
    }

    if (externalIsOpen === undefined) {
      setInternalIsOpen(true);
    }
    setPaymentStep("method");
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    setPaymentStep(method);
    setFormErrors({
      cardNumber: "",
      expiry: "",
      cvv: "",
      name: "",
      upiId: "",
    });
  };

  const validateCardNumber = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, "");
    if (!cleaned) return "Card number is required";
    if (!/^\d+$/.test(cleaned)) return "Card number must contain only digits";
    if (cleaned.length !== 16) return "Card number must be 16 digits";
    return "";
  };

  const validateExpiry = (expiry) => {
    if (!expiry) return "Expiry date is required";
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return "Format must be MM/YY";

    const [month, year] = expiry.split("/").map(Number);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (month < 1 || month > 12) return "Month must be between 01 and 12";
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return "Card has expired";
    }
    return "";
  };

  const validateCVV = (cvv) => {
    if (!cvv) return "CVV is required";
    if (!/^\d+$/.test(cvv)) return "CVV must contain only digits";
    if (cvv.length < 3 || cvv.length > 4) return "CVV must be 3 or 4 digits";
    return "";
  };

  const validateName = (name) => {
    if (!name.trim()) return "Name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    if (!/^[a-zA-Z\s]+$/.test(name.trim()))
      return "Name can only contain letters and spaces";
    return "";
  };

  const validateUPI = (upiId) => {
    if (!upiId.trim()) return "UPI ID is required";
    if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId.trim())) {
      return "Please enter a valid UPI ID (e.g., name@upi)";
    }
    return "";
  };

  const validateForm = () => {
    const errors = {
      cardNumber: "",
      expiry: "",
      cvv: "",
      name: "",
      upiId: "",
    };

    if (paymentMethod === "card") {
      errors.cardNumber = validateCardNumber(formData.cardNumber);
      errors.expiry = validateExpiry(formData.expiry);
      errors.cvv = validateCVV(formData.cvv);
      errors.name = validateName(formData.name);
    } else if (paymentMethod === "upi") {
      errors.upiId = validateUPI(formData.upiId);
    }

    setFormErrors(errors);
    return !Object.values(errors).some((error) => error !== "");
  };

  const handleCardPayment = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setIsSubmitting(true);
    setPaymentStep("processing");

    setTimeout(() => {
      window.open(GITHUB_REPO_URL, "_blank");

      setTimeout(() => {
        setPaymentStep("success");
        upgradeUserToPremium();
        setIsSubmitting(false);
      }, 2000);
    }, 1500);
  };

  const handleUPIPayment = () => {
    if (!validateForm()) {
      toast.error("Please enter a valid UPI ID");
      return;
    }

    setIsSubmitting(true);
    setPaymentStep("processing");

    setTimeout(() => {
      setPaymentStep("success");
      upgradeUserToPremium();
      setIsSubmitting(false);
    }, 2000);
  };

  const upgradeUserToPremium = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      console.log('🔄 Starting premium upgrade...');
      console.log('User token:', user.token ? 'Present' : 'Missing');
      console.log('User ID:', user._id);

      const response = await fetch(
        `${AUTH_API}/api/stacks/upgrade-to-premium`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Premium upgrade successful:', data);
        
        user.tier = "premium";
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("premiumUpgraded", "true");

        toast.success(
          "🎉 Welcome to Premium! You now have unlimited workflow access."
        );
      } else {
        const errorText = await response.text();
        console.error('❌ Premium upgrade failed:', errorText);
        
        await forcePremiumUpgrade(user);
      }
    } catch (error) {
      console.error('💥 Premium upgrade error:', error);
      await forcePremiumUpgrade(JSON.parse(localStorage.getItem("user") || "{}"));
    }
  };

  const forcePremiumUpgrade = async (user) => {
    try {
      console.log('🔄 Trying force premium upgrade...');
      
      const response = await fetch(
        `${AUTH_API}/api/stacks/force-premium/${user._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Force premium successful:', data);
      } else {
        console.log('⚠️ Force premium failed, using local upgrade');
      }

      user.tier = "premium";
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("premiumUpgraded", "true");
      
      toast.success(
        "🎉 Welcome to Premium! You now have unlimited workflow access."
      );
    } catch (error) {
      console.error('💥 Force premium error:', error);
      user.tier = "premium";
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("premiumUpgraded", "true");
      toast.success(
        "🎉 Welcome to Premium! You now have unlimited workflow access."
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (name === "cardNumber") {
      const formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim()
        .slice(0, 19);
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
      return;
    }

    if (name === "expiry") {
      let formattedValue = value.replace(/\D/g, "").slice(0, 4);
      if (formattedValue.length >= 2) {
        formattedValue =
          formattedValue.slice(0, 2) + "/" + formattedValue.slice(2);
      }
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
      return;
    }

    if (name === "cvv") {
      const formattedValue = value.replace(/\D/g, "").slice(0, 4);
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
      return;
    }

    if (name === "name") {
      const formattedValue = value.replace(/[^a-zA-Z\s]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
      return;
    }

    if (name === "upiId") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;

    if (paymentMethod === "card") {
      switch (name) {
        case "cardNumber":
          setFormErrors((prev) => ({
            ...prev,
            cardNumber: validateCardNumber(value),
          }));
          break;
        case "expiry":
          setFormErrors((prev) => ({
            ...prev,
            expiry: validateExpiry(value),
          }));
          break;
        case "cvv":
          setFormErrors((prev) => ({
            ...prev,
            cvv: validateCVV(value),
          }));
          break;
        case "name":
          setFormErrors((prev) => ({
            ...prev,
            name: validateName(value),
          }));
          break;
        default:
          break;
      }
    } else if (paymentMethod === "upi" && name === "upiId") {
      setFormErrors((prev) => ({
        ...prev,
        upiId: validateUPI(value),
      }));
    }
  };

  const handleModalClose = () => {
    handleClose();
    setPaymentStep("method");
    setFormData({
      cardNumber: "",
      expiry: "",
      cvv: "",
      name: "",
      upiId: "",
    });
    setFormErrors({
      cardNumber: "",
      expiry: "",
      cvv: "",
      name: "",
      upiId: "",
    });
    setIsSubmitting(false);
    if (paymentStep === "success") {
      window.location.reload();
    }
  };

  const buttonText = isPremium
    ? "🎉 Premium"
    : `🚀 Go Premium ${userWorkflows.length >= 3 ? "(Limit Reached!)" : ""}`;

  const buttonClass = isPremium
    ? "ml-4 px-4 py-2 bg-green-600 text-white rounded-full font-semibold cursor-default shadow-sm border border-green-700"
    : "ml-4 px-4 py-2 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-all shadow-sm hover:shadow cursor-pointer";

  return (
    <>
      <button
        onClick={handleUpgradeClick}
        className={buttonClass}
        disabled={isPremium}
      >
        {buttonText}
      </button>

      {isOpen && (
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
                    {userWorkflows.length >= 3 && !isPremium
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
                  {userWorkflows.length >= 3 && !isPremium && (
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
                    onClick={() => handlePaymentMethodSelect("method")}
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
                      Card Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder="4242 4242 4242 4242"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        formErrors.cardNumber
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      required
                      maxLength={19}
                    />
                    {formErrors.cardNumber && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.cardNumber}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        placeholder="MM/YY"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          formErrors.expiry
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        required
                        maxLength={5}
                      />
                      {formErrors.expiry && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.expiry}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        placeholder="123"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          formErrors.cvv ? "border-red-500" : "border-gray-300"
                        }`}
                        required
                        maxLength={4}
                      />
                      {formErrors.cvv && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.cvv}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name on Card <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder="Enter your full name"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        formErrors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.name}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors cursor-pointer shadow-sm mt-4 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Processing..." : "Pay $29.00"}
                  </button>
                </form>
              </div>
            )}
            {paymentStep === "upi" && (
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <button
                    onClick={() => handlePaymentMethodSelect("method")}
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
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                      UPI ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="upiId"
                      value={formData.upiId}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder="yourname@upi"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        formErrors.upiId ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {formErrors.upiId && (
                      <p className="text-red-500 text-xs mt-1 text-left">
                        {formErrors.upiId}
                      </p>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Scan this QR code to pay (Google Lens lol...)
                  </p>
                  <button
                    onClick={handleUPIPayment}
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors cursor-pointer shadow-sm disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Processing..." : "I've Completed Payment"}
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
                onClick={handleModalClose}
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