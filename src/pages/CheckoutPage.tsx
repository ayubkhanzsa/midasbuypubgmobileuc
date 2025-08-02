import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, AlertCircle, Eye, EyeOff, Upload, X, Copy } from "lucide-react";
import Header from "@/components/Header";
import ProcessingPaymentScreen from "@/components/ProcessingPaymentScreen";
import { getPackageById } from "@/data/ucPackages";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { detectCardType } from "@/utils/cardUtils";
import { sendReceiptEmail, sendReceiptEmailFallback } from "@/utils/emailService";
import CreditCardDisplay from "@/components/CreditCardDisplay";

interface CheckoutPageProps {
  onLogout: () => void;
}

const paymentMethods = [
  { 
    id: "mobilepay", 
    name: "", 
    icon: "/lovable-uploads/38a987e8-736d-4dd1-afd6-a468185c3eba.png" 
  },
  { 
    id: "card", 
    name: "Debit Card", 
    logoComponent: (
      <div className="flex items-center gap-1">
        <img src="/lovable-uploads/83bab1f5-3ee2-4dd1-ab6e-7baab1fa72d1.png" alt="Payment Cards" className="h-7" />
      </div>
    )
  },
  { 
    id: "paypal", 
    name: "PayPal", 
    icon: "/lovable-uploads/2cabc096-1cf2-484c-9608-bca24f15e622.png" 
  },
];

const CheckoutPage = ({ onLogout }: CheckoutPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState("mobilepay");
  const [showProcessingScreen, setShowProcessingScreen] = useState(false);
  
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [showCVV, setShowCVV] = useState(false);
  const [showExpiry, setShowExpiry] = useState(false);
  const [cardType, setCardType] = useState("unknown");
  
  const [paypalEmail, setPaypalEmail] = useState("");
  const [paypalPassword, setPaypalPassword] = useState("");
  const [showPaypalPassword, setShowPaypalPassword] = useState(false);
  
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [playerID, setPlayerID] = useState("");
  const [username, setUsername] = useState("");

  const ucPackage = id ? getPackageById(id) : undefined;

  useEffect(() => {
    if (!ucPackage) {
      navigate("/");
      return;
    }

    const storedPlayerID = localStorage.getItem("playerID");
    const storedUsername = localStorage.getItem("pubgUsername");
    
    if (!storedPlayerID) {
      navigate(`/purchase/${id}`);
      return;
    }
    
    setPlayerID(storedPlayerID);
    
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      setUsername("PUBG Player");
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [ucPackage, navigate, id]);

  useEffect(() => {
    if (cardNumber) {
      setCardType(detectCardType(cardNumber));
    }
  }, [cardNumber]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const formattedValue = value
      .replace(/(.{4})/g, "$1 ")
      .trim();
    setCardNumber(formattedValue);
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 2) {
      setExpiryDate(value);
    } else {
      setExpiryDate(`${value.slice(0, 2)}/${value.slice(2, 4)}`);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setCvv(value);
  };

  const validateCardDetails = () => {
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all card details",
        variant: "destructive",
      });
      return false;
    }
    
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      toast({
        title: "Invalid Card Number",
        description: "Please enter a valid 16-digit card number",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const validatePaypalDetails = () => {
    if (!paypalEmail || !paypalPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in your PayPal email and password",
        variant: "destructive",
      });
      return false;
    }
    
    if (!paypalEmail.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload JPG, PNG or PDF files only",
          variant: "destructive",
        });
        return;
      }
      
      setReceiptFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setReceiptPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setReceiptPreview(null);
      }
      
      toast({
        title: "Receipt Uploaded",
        description: "Your payment receipt has been uploaded successfully",
      });
    }
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    // Reset the file input
    const fileInput = document.getElementById('receiptUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
    }
  };

  const handleCompletePurchase = async () => {
    let isValid = false;
    
    if (selectedPayment === "card") {
      // Show error for card payments
      toast({
        title: "Payment Method Not Available",
        description: "Credit/Debit cards are temporarily unavailable. Please use JazzCash, NayaPay, or SadaPay instead.",
        variant: "destructive",
      });
      return;
    } else if (selectedPayment === "paypal") {
      // Show error for PayPal payments
      toast({
        title: "Payment Method Not Available", 
        description: "PayPal is temporarily unavailable. Please use JazzCash, NayaPay, or SadaPay instead.",
        variant: "destructive",
      });
      return;
    } else if (selectedPayment === "mobilepay") {
      if (!receiptFile) {
        toast({
          title: "Receipt Required",
          description: "Please upload your payment receipt before completing the purchase",
          variant: "destructive",
        });
        return;
      }
      isValid = true;
    }
    
    if (!isValid) {
      return;
    }
    
    setIsProcessing(true);
    setShowProcessingScreen(true);

    setTimeout(async () => {
      setIsProcessing(false);
      setShowProcessingScreen(false);
      
      if (ucPackage) {
        const verifiedUsername = localStorage.getItem("pubgUsername") || username;
        
        const purchaseDetails = {
          packageId: ucPackage.id,
          baseAmount: ucPackage.baseAmount,
          bonusAmount: ucPackage.bonusAmount,
          price: ucPackage.price,
          playerID,
          username: verifiedUsername,
          paymentMethod: selectedPayment,
          transactionId: "TX" + Math.floor(Math.random() * 1000000000),
          purchaseDate: new Date().toISOString(),
          receiptFile: receiptFile || undefined,
        };
        
        localStorage.setItem("purchaseAmount", ucPackage.price.toString());
        localStorage.setItem("ucAmount", (ucPackage.baseAmount + ucPackage.bonusAmount).toString());
        localStorage.setItem("playerId", playerID);
        localStorage.setItem("playerName", verifiedUsername);
        localStorage.setItem("paymentMethod", 
          selectedPayment === "card" ? "Credit Card" : 
          selectedPayment === "paypal" ? "PayPal" :
          selectedPayment === "mobilepay" ? "Mobile Payment" : "Mobile Payment"
        );
        
        localStorage.setItem("purchaseDetails", JSON.stringify(purchaseDetails));
        
        // Receipt is available for download on the Thank You page
        // Email sending has been removed as requested
      }
      
      navigate("/thankyou");
    }, 5000);
  };

  if (isLoading || !ucPackage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-midasbuy-darkBlue">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-midasbuy-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400 animate-pulse">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midasbuy-darkBlue overflow-x-hidden">
      <AnimatePresence>
        {showProcessingScreen && (
          <ProcessingPaymentScreen paymentMethod={selectedPayment} />
        )}
      </AnimatePresence>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 w-full h-[50vh] bg-hero-pattern bg-cover bg-center opacity-20 z-0"></div>
      </div>
      
      <Header onLogout={onLogout} />
      
      <main className="pt-24 pb-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span>Back to Player Info</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 order-1 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-effect rounded-xl p-6 mb-6"
              >
                <h2 className="text-xl font-bold mb-4 text-white">Payment Info</h2>
                
                <div className="mb-6 space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedPayment === method.id 
                          ? "border-midasbuy-blue bg-midasbuy-blue/10" 
                          : "border-gray-700 bg-midasbuy-navy/30 hover:bg-midasbuy-navy/50"
                      }`}
                      onClick={() => setSelectedPayment(method.id)}
                    >
                       <div className="flex items-center justify-between w-full">
                         <div className="flex items-center">
                           {method.id === "card" ? (
                             method.logoComponent
                           ) : method.id === "mobilepay" ? (
                             <img src={method.icon} alt="Mobile Payment" className="h-8 mr-3" />
                           ) : (
                             <img src={method.icon} alt={method.name} className="h-6 mr-3" />
                           )}
                           {method.name && (
                             <span className="text-white font-medium">{method.name}</span>
                           )}
                         </div>
                         
                           <div className="flex items-center gap-3">
                             <span className="text-midasbuy-gold font-semibold text-sm sm:text-base">
                               PKR {ucPackage?.price.toLocaleString()}
                             </span>
                           {selectedPayment === method.id && (
                             <div className="bg-midasbuy-blue w-5 h-5 rounded-full flex items-center justify-center">
                               <Check className="w-3 h-3 text-white" />
                             </div>
                           )}
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
                
                {selectedPayment === "card" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="mb-6">
                      <CreditCardDisplay 
                        cardNumber={cardNumber}
                        cardholderName={cardholderName}
                        expiryDate={expiryDate}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-300 mb-1">
                        Card No.
                      </label>
                      <Input
                        id="cardNumber"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="bg-midasbuy-navy/50 border-midasbuy-blue/30 text-white focus:border-midasbuy-blue focus:ring-midasbuy-blue/20"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-300 mb-1">
                          Expiry Date
                        </label>
                        <div className="relative">
                          <Input
                            id="expiryDate"
                            value={expiryDate}
                            onChange={handleExpiryDateChange}
                            placeholder="MM/YY"
                            maxLength={5}
                            type={showExpiry ? "text" : "password"}
                            className="bg-midasbuy-navy/50 border-midasbuy-blue/30 text-white focus:border-midasbuy-blue focus:ring-midasbuy-blue/20 pr-10"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                            onClick={() => setShowExpiry(!showExpiry)}
                          >
                            {showExpiry ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-gray-300 mb-1">
                          CVV
                        </label>
                        <div className="relative">
                          <Input
                            id="cvv"
                            value={cvv}
                            onChange={handleCvvChange}
                            placeholder="123"
                            maxLength={3}
                            type={showCVV ? "text" : "password"}
                            className="bg-midasbuy-navy/50 border-midasbuy-blue/30 text-white focus:border-midasbuy-blue focus:ring-midasbuy-blue/20 pr-10"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                            onClick={() => setShowCVV(!showCVV)}
                          >
                            {showCVV ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-300 mb-1">
                        Cardholder Name
                      </label>
                      <Input
                        id="cardholderName"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        placeholder="John Doe"
                        className="bg-midasbuy-navy/50 border-midasbuy-blue/30 text-white focus:border-midasbuy-blue focus:ring-midasbuy-blue/20"
                      />
                    </div>
                    
                    <div className="flex items-start mt-2">
                      <AlertCircle className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-400">
                        Your card information is secure and encrypted.
                      </p>
                    </div>
                  </motion.div>
                )}
                
                {selectedPayment === "paypal" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="bg-midasbuy-navy/30 rounded-lg p-6">
                      <img 
                        src="/lovable-uploads/2cabc096-1cf2-484c-9608-bca24f15e622.png" 
                        alt="PayPal" 
                        className="h-12 mx-auto mb-4" 
                      />
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="paypalEmail" className="block text-sm font-medium text-gray-300 mb-1">
                            PayPal Email
                          </label>
                          <Input
                            id="paypalEmail"
                            type="email"
                            value={paypalEmail}
                            onChange={(e) => setPaypalEmail(e.target.value)}
                            placeholder="email@example.com"
                            className="bg-midasbuy-navy/50 border-midasbuy-blue/30 text-white focus:border-midasbuy-blue focus:ring-midasbuy-blue/20"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="paypalPassword" className="block text-sm font-medium text-gray-300 mb-1">
                            PayPal Password
                          </label>
                          <div className="relative">
                            <Input
                              id="paypalPassword"
                              type={showPaypalPassword ? "text" : "password"}
                              value={paypalPassword}
                              onChange={(e) => setPaypalPassword(e.target.value)}
                              placeholder="Enter your PayPal password"
                              className="bg-midasbuy-navy/50 border-midasbuy-blue/30 text-white focus:border-midasbuy-blue focus:ring-midasbuy-blue/20 pr-10"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                              onClick={() => setShowPaypalPassword(!showPaypalPassword)}
                            >
                              {showPaypalPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start mt-4">
                        <AlertCircle className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-400">
                          Your PayPal information is secure and encrypted. We never store your PayPal password.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {selectedPayment === "mobilepay" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="bg-midasbuy-navy/30 rounded-lg p-6">
                      <img 
                        src={paymentMethods.find(m => m.id === selectedPayment)?.icon} 
                        alt={paymentMethods.find(m => m.id === selectedPayment)?.name} 
                        className="h-12 mx-auto mb-4" 
                      />
                      
                       <div className="bg-midasbuy-blue/10 border border-midasbuy-blue/30 rounded-lg p-4 mb-4">
                         <h3 className="text-white font-medium mb-3">Account Details</h3>
                         <div className="space-y-3">
                           <div className="flex items-center justify-between bg-midasbuy-navy/20 rounded-lg p-3">
                             <div className="flex-1">
                               <span className="text-gray-300 text-sm block">Account Name:</span>
                               <span className="text-white font-medium">Muhammad Ayub Khan</span>
                             </div>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => copyToClipboard("Muhammad Ayub Khan", "Account Name")}
                               className="text-midasbuy-blue hover:text-midasbuy-blue hover:bg-midasbuy-blue/10 p-2"
                             >
                               <Copy className="w-4 h-4" />
                             </Button>
                           </div>
                           <div className="flex items-center justify-between bg-midasbuy-navy/20 rounded-lg p-3">
                             <div className="flex-1">
                               <span className="text-gray-300 text-sm block">Account Number:</span>
                               <span className="text-white font-medium">03182317686</span>
                             </div>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => copyToClipboard("03182317686", "Account Number")}
                               className="text-midasbuy-blue hover:text-midasbuy-blue hover:bg-midasbuy-blue/10 p-2"
                             >
                               <Copy className="w-4 h-4" />
                             </Button>
                           </div>
                         </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="receiptUpload" className="block text-sm font-medium text-gray-300 mb-2">
                            Upload Payment Receipt
                          </label>
                          
                          {receiptFile && receiptPreview ? (
                            <div className="space-y-3">
                              <div className="relative bg-midasbuy-navy/30 rounded-lg p-3 border border-midasbuy-blue/30">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <img 
                                      src={receiptPreview} 
                                      alt="Receipt preview" 
                                      className="w-12 h-12 object-cover rounded border border-gray-600"
                                    />
                                    <div>
                                      <p className="text-white text-sm font-medium truncate max-w-[150px]">
                                        {receiptFile.name}
                                      </p>
                                      <p className="text-gray-400 text-xs">
                                        {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={removeReceipt}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="relative">
                                <input
                                  id="receiptUpload"
                                  type="file"
                                  accept="image/*,application/pdf"
                                  onChange={handleReceiptUpload}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="border border-midasbuy-blue/30 rounded-lg p-3 text-center hover:border-midasbuy-blue transition-colors cursor-pointer">
                                  <p className="text-midasbuy-blue text-sm">
                                    Click to change receipt
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="relative">
                              <input
                                id="receiptUpload"
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={handleReceiptUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div className="border-2 border-dashed border-midasbuy-blue/50 rounded-lg p-6 text-center hover:border-midasbuy-blue transition-colors">
                                <Upload className="w-8 h-8 text-midasbuy-blue mx-auto mb-2" />
                                <p className="text-gray-300 text-sm">
                                  Click to upload payment receipt
                                </p>
                                <p className="text-gray-500 text-xs mt-1">
                                  JPG, PNG or PDF files only
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-start mt-4">
                        <AlertCircle className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-400">
                          After payment, upload your receipt. It will be verification your package send just 5 minutes.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
            
            <div className="lg:col-span-1 order-2 lg:order-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-effect rounded-xl p-6 sticky top-24"
              >
                <h2 className="text-xl font-bold mb-4 text-white">Order Information</h2>
                
                <div className="flex items-center mb-6 pb-4 border-b border-gray-700">
                  <img src="/lovable-uploads/ecae37c2-470f-4c72-8005-270d82abe96f.png" alt="UC Coins" className="w-[70px] mr-4" />
                  
                  <div>
                    <div className="flex items-baseline">
                      <span className="text-white text-xl">{ucPackage.baseAmount}</span>
                      {ucPackage.bonusAmount > 0 && (
                        <span className="text-midasbuy-gold ml-1">+{ucPackage.bonusAmount}</span>
                      )}
                      <span className="text-white ml-1">UC</span>
                    </div>
                    
                    <div className="mt-1">
                      <span className="text-midasbuy-gold font-medium">PKR {ucPackage.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-300 mb-1">Player Information:</div>
                  <div className="p-3 bg-midasbuy-navy/50 rounded-md">
                    <div className="flex justify-between">
                      <span className="text-gray-400">ID:</span>
                      <span className="text-white font-medium">{playerID}</span>
                    </div>
                    {username && (
                      <div className="flex justify-between mt-1 border-t border-midasbuy-navy/80 pt-1">
                        <span className="text-gray-400">Username:</span>
                        <span className="text-white font-medium">{username}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Subtotal</span>
                    <span className="text-white">PKR {ucPackage.price.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Taxes</span>
                    <span className="text-white">0.00 PKR</span>
                  </div>
                  
                  {ucPackage.originalPrice > ucPackage.price && (
                    <div className="flex justify-between text-sm">
                      <span className="text-midasbuy-gold">Discount</span>
                      <span className="text-midasbuy-gold">
                        -PKR {(ucPackage.originalPrice - ucPackage.price).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between mb-6 pb-2 border-b border-gray-700">
                  <span className="font-bold text-white">Total</span>
                  <span className="font-bold text-white text-xl">PKR {ucPackage.price.toLocaleString()}</span>
                </div>
                
                <Button 
                  className="w-full h-12 bg-midasbuy-blue hover:bg-blue-600 text-white font-medium text-lg"
                  onClick={handleCompletePurchase}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    "Complete Purchase"
                  )}
                </Button>
                
                <div className="mt-4 text-xs text-center text-gray-400">
                  By clicking "Complete Purchase", you agree to our Terms of Service and Privacy Policy.
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-midasbuy-navy py-6 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-400 text-sm">
            <p>© 2025 Midasbuy. All Rights Reserved.</p>
            <div className="mt-2">
              <a href="#" className="text-gray-400 hover:text-gray-300 mx-2">Terms of Service</a>
              <span className="text-gray-600">|</span>
              <a href="#" className="text-gray-400 hover:text-gray-300 mx-2">Privacy Policy</a>
              <span className="text-gray-600">|</span>
              <a href="#" className="text-gray-400 hover:text-gray-300 mx-2">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CheckoutPage;

