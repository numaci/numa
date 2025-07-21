"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ClientLayout from "@/components/layout/ClientLayout";
import AddressMapSelector from "@/components/checkout/AddressMapSelector";
import AddressForm from "@/components/checkout/AddressForm";
import CheckoutSummary from "@/components/checkout/CheckoutSummary";
import { Button } from "@/components/ui/Button";
import { MapPin, CreditCard, Truck, CheckCircle, Phone, Upload } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { FaMobileAlt } from "react-icons/fa";
import { upload as imagekitUpload } from "@imagekit/next";

interface Address {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  country: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
}

interface DeliveryZone {
  name: string;
  center: [number, number];
  deliveryTime: string;
  deliveryFee: number;
  description: string;
}

interface PaymentInfo {
  clientPhone: string;
  receiptImage: File | null;
  receiptPreview: string | null;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState<Address>({
    firstName: "",
    lastName: "",
    address1: "",
    city: "Sikasso",
    country: "Mali",
    phone: "",
  });
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    clientPhone: "",
    receiptImage: null,
    receiptPreview: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [addressError, setAddressError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  // 1. State pour le mode de paiement
  const [paymentMethod, setPaymentMethod] = useState<"mobile" | "cod">("mobile");
  // State pour le numéro WhatsApp configuré
  const [whatsappNumber, setWhatsappNumber] = useState<string>("+22384054004"); // Valeur par défaut
  // State pour les numéros de paiement
  const [paymentNumbers, setPaymentNumbers] = useState<{name: string, number: string}[]>([]);
  // State pour le numéro de paiement principal affiché
  const [primaryPaymentNumber, setPrimaryPaymentNumber] = useState<string>("+22384054004");
  // State pour sauvegarder les articles de la commande
  const [savedOrderItems, setSavedOrderItems] = useState<any[]>([]);

  // Fonction pour récupérer le numéro WhatsApp configuré et les numéros de paiement
  const fetchWhatsappNumbers = async () => {
    try {
      const response = await fetch('/api/admin/whatsapp');
      if (response.ok) {
        const data = await response.json();
        // Numéro WhatsApp pour l'envoi de commande
        const orderConfig = data.whatsappConfigs.find((config: any) => config.type === 'order' && config.isActive);
        if (orderConfig) {
          setWhatsappNumber(orderConfig.number);
        }
        // Numéros de paiement (type 'payment')
        const paymentConfigs = data.whatsappConfigs.filter((config: any) => config.type === 'payment' && config.isActive);
        // Si aucun en base, fallback sur ceux codés en dur
        if (paymentConfigs.length > 0) {
          const paymentNumbersList = paymentConfigs.map((c: any) => ({ name: c.label || c.name || 'Paiement', number: c.number }));
          setPaymentNumbers(paymentNumbersList);
          // Utiliser le premier numéro de paiement comme numéro principal affiché
          if (paymentNumbersList.length > 0) {
            setPrimaryPaymentNumber(paymentNumbersList[0].number);
          }
        } else {
          const defaultPaymentNumbers = [
            { name: "Orange Money", number: "+223 70 12 34 56" },
            { name: "Moov Money", number: "+223 90 12 34 56" },
            { name: "Wave", number: "+223 80 12 34 56" },
          ];
          setPaymentNumbers(defaultPaymentNumbers);
          setPrimaryPaymentNumber(defaultPaymentNumbers[0].number);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des numéros WhatsApp:', error);
    }
  };

  // Récupérer le numéro WhatsApp au chargement
  useEffect(() => {
    fetchWhatsappNumbers();
  }, []);

  const isAddressValid = shippingAddress.address1 && shippingAddress.city === "Sikasso";

  // Rediriger si non connecté
  if (status === "loading") {
    return (
      <ClientLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 via-white to-orange-50">
          <div className="w-full max-w-3xl mx-auto bg-white/90 rounded-2xl shadow-2xl p-8">
            Chargement...
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login?callbackUrl=/checkout");
    return null;
  }

  const handleAddressSelect = (coords: { latitude: number; longitude: number }) => {
    setShippingAddress(addr => ({ ...addr, ...coords }));
    
    // Déterminer le point de livraison le plus proche basé sur les coordonnées
    const deliveryPoints: DeliveryZone[] = [
      {
        name: "Centre-ville Sikasso",
        center: [11.3167, -5.6667],
        deliveryTime: "30-45 minutes",
        deliveryFee: 500,
        description: "Zone centrale de Sikasso - Livraison rapide"
      },
      {
        name: "Quartier Hamdallaye",
        center: [11.3200, -5.6700],
        deliveryTime: "45-60 minutes",
        deliveryFee: 750,
        description: "Zone résidentielle - Livraison standard"
      },
      {
        name: "Zone Industrielle",
        center: [11.3100, -5.6800],
        deliveryTime: "60-90 minutes",
        deliveryFee: 1000,
        description: "Zone industrielle - Livraison étendue"
      },
      {
        name: "Quartier Missirikoro",
        center: [11.3250, -5.6600],
        deliveryTime: "45-75 minutes",
        deliveryFee: 800,
        description: "Zone résidentielle - Service de livraison disponible"
      },
      {
        name: "Marché Central",
        center: [11.3180, -5.6680],
        deliveryTime: "30-60 minutes",
        deliveryFee: 600,
        description: "Zone commerciale - Livraison rapide"
      },
      {
        name: "Gare Routière",
        center: [11.3220, -5.6750],
        deliveryTime: "45-75 minutes",
        deliveryFee: 900,
        description: "Zone de transport - Service disponible"
      },
      // Points couvrant la région élargie de Sikasso
      {
        name: "Sikasso Nord",
        center: [11.3500, -5.6667],
        deliveryTime: "60-90 minutes",
        deliveryFee: 1200,
        description: "Zone nord de Sikasso - Service de livraison"
      },
      {
        name: "Sikasso Sud",
        center: [11.2800, -5.6667],
        deliveryTime: "60-90 minutes",
        deliveryFee: 1200,
        description: "Zone sud de Sikasso - Service de livraison"
      },
      {
        name: "Sikasso Est",
        center: [11.3167, -5.6200],
        deliveryTime: "75-105 minutes",
        deliveryFee: 1500,
        description: "Zone est de Sikasso - Livraison étendue"
      },
      {
        name: "Sikasso Ouest",
        center: [11.3167, -5.7200],
        deliveryTime: "75-105 minutes",
        deliveryFee: 1500,
        description: "Zone ouest de Sikasso - Livraison étendue"
      },
      {
        name: "Périphérie Nord-Est",
        center: [11.3400, -5.6400],
        deliveryTime: "90-120 minutes",
        deliveryFee: 1800,
        description: "Périphérie nord-est - Service disponible"
      },
      {
        name: "Périphérie Sud-Ouest",
        center: [11.2900, -5.6900],
        deliveryTime: "90-120 minutes",
        deliveryFee: 1800,
        description: "Périphérie sud-ouest - Service disponible"
      }
    ];

    const getNearestPoint = (lat: number, lng: number): DeliveryZone | null => {
      let nearestPoint: DeliveryZone | null = null;
      let minDistance = Infinity;

      for (const point of deliveryPoints) {
        const distance = Math.sqrt(
          Math.pow(lat - point.center[0], 2) + Math.pow(lng - point.center[1], 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestPoint = point;
        }
      }

      // Zone de couverture étendue pour toute la région de Sikasso (0.15 degrés)
      return minDistance <= 0.15 ? nearestPoint : null;
    };

    const point = getNearestPoint(coords.latitude, coords.longitude);
    setSelectedZone(point);
  };

  const handleAddressSubmit = async () => {
    setIsLoading(true);
    setAddressError("");
    try {
      if (shippingAddress.city !== "Sikasso") {
        setAddressError("La livraison n'est disponible qu'à Sikasso, Mali.");
        setIsLoading(false);
        errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      if (!selectedZone && !isAddressValid) {
        setAddressError("Veuillez sélectionner un point sur la carte ou remplir l'adresse manuellement.");
        setIsLoading(false);
        errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      setCurrentStep(2);
    } catch (error) {
      setAddressError("Erreur lors de la sauvegarde de l'adresse.");
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSubmit = async () => {
    setIsSubmitting(true);
    setPaymentError("");
    try {
      // SUPPRIME la vérification stricte sur selectedZone OU adresse manuelle valide
      // On laisse l'utilisateur valider même si selectedZone est null
      // if (!selectedZone && !isAddressValid) {
      //   setPaymentError("Erreur : Données manquantes. Veuillez sélectionner un point sur la carte ou remplir l'adresse manuellement.");
      //   setIsSubmitting(false);
      //   errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      //   return;
      // }
      if (paymentMethod === "mobile") {
        if (!paymentInfo.clientPhone.trim()) {
          setPaymentError("Veuillez saisir le numéro de téléphone utilisé pour le paiement.");
          setIsSubmitting(false);
          errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        if (!paymentInfo.receiptImage) {
          setPaymentError("Veuillez téléverser une capture d'écran ou photo du reçu de paiement.");
          setIsSubmitting(false);
          errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
      }
      // Si paiement mobile, upload du reçu
      let receiptImageUrl = null;
      if (paymentMethod === "mobile" && paymentInfo.receiptImage) {
        // Utiliser directement l'URL ImageKit uploadée côté client
        receiptImageUrl = paymentInfo.receiptImage;
      }
      // Calculer le total
      const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      const shipping = selectedZone ? (subtotal >= 50000 ? 0 : selectedZone.deliveryFee) : 1500;
      const total = subtotal + shipping;
      // Créer la commande
      const orderData = {
        shippingAddress,
        selectedZone,
        paymentInfo: paymentMethod === "mobile" ? {
          clientPhone: paymentInfo.clientPhone,
          receiptImage: receiptImageUrl,
        } : {},
        paymentMethod,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total
      };
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      if (!orderResponse.ok) {
        const orderError = await orderResponse.json();
        // Affiche le message d'erreur retourné par l'API, ou un message explicite
        setPaymentError(orderError.error || `Erreur lors de la création de la commande (${orderResponse.status}) : Veuillez vérifier que votre adresse est correcte ou contactez le support.`);
        setIsSubmitting(false);
        errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      const orderResult = await orderResponse.json();
      // Sauvegarder les articles avant de vider le panier
      const savedItems = [...items];
      clearCart();
      setOrderNumber(orderResult.orderId);
      setCurrentStep(3);
      
      // Stocker les articles sauvegardés pour le message WhatsApp
      setSavedOrderItems(savedItems);
    } catch (error) {
      setPaymentError(`Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`);
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReceiptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 1. Récupérer le token d'auth ImageKit
      const res = await fetch("/api/upload-auth");
      if (!res.ok) {
        setPaymentError("Erreur d'authentification ImageKit");
        return;
      }
      const { signature, expire, token, publicKey } = await res.json();
      try {
        // 2. Upload direct sur ImageKit
        const uploadResponse = await imagekitUpload({
          file,
          fileName: file.name,
          token,
          signature,
          expire,
          publicKey,
          folder: "/receipts",
        });
        // 3. Stocker l'URL dans le state
        setPaymentInfo(prev => ({
          ...prev,
          receiptImage: uploadResponse.url || "",
          receiptPreview: uploadResponse.url || "",
        }));
      } catch (err) {
        setPaymentError("Erreur lors de l'upload sur ImageKit");
      }
    }
  };

  const steps = [
    { id: 1, name: "Adresse de livraison", icon: MapPin },
    { id: 2, name: "Paiement", icon: CreditCard },
    { id: 3, name: "Confirmation", icon: Truck },
  ];

  // Numéros de paiement
  // const paymentNumbers = [
  //   { name: "Orange Money", number: "+223 70 12 34 56", color: "bg-orange-500" },
  //   { name: "Moov Money", number: "+223 90 12 34 56", color: "bg-blue-500" },
  //   { name: "Wave", number: "+223 80 12 34 56", color: "bg-green-500" },
  // ];

  // Calcul du montant total à payer (hors return)
  const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const shipping = selectedZone ? (subtotal >= 50000 ? 0 : selectedZone.deliveryFee) : 1500;
  const total = subtotal + shipping;

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 py-8 flex items-center justify-center">
        <div className="w-full max-w-3xl mx-auto bg-white/90 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-amber-700">Finaliser votre commande</h1>
            <p className="mt-2 text-amber-600">Livraison disponible uniquement à Sikasso, Mali</p>
          </div>

          {/* Steps indicator */}
          <div className="mb-8">
            <div className="flex flex-row items-center justify-center gap-4 sm:gap-8 w-full overflow-x-auto px-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-row items-center w-auto">
                  <div className={`flex items-center justify-center rounded-full border-2 ${
                    currentStep >= step.id 
                      ? "bg-amber-500 border-amber-500 text-white" 
                      : "bg-white border-amber-200 text-amber-400"
                  } w-7 h-7 sm:w-12 sm:h-12`}> 
                    <step.icon className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                  <span className={`ml-2 sm:ml-3 text-xs sm:text-sm font-medium ${
                    currentStep >= step.id ? "text-amber-600" : "text-amber-400"
                  }`}>
                    {step.name}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`ml-2 sm:ml-8 w-6 sm:w-16 h-0.5 ${
                      currentStep > step.id ? "bg-amber-500" : "bg-amber-200"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              {currentStep === 1 && (
                <div className="bg-white rounded-lg shadow-sm border border-amber-200 p-6">
                  <h2 className="text-xl font-semibold mb-6 text-amber-700">Adresse de livraison - Sikasso, Mali</h2>
                  
                  {/* Zone de livraison info */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-amber-900 mb-2">Zone de livraison</h3>
                    <p className="text-amber-700">
                      La livraison est actuellement disponible uniquement dans la ville de Sikasso, Mali.
                      Sélectionnez votre adresse précise sur la carte pour voir les informations de livraison.
                    </p>
                  </div>
                  
                  {/* Map selector */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4 text-amber-700">Sélectionnez votre adresse sur la carte</h3>
                    <AddressMapSelector 
                      onAddressSelect={handleAddressSelect}
                      initialAddress={shippingAddress}
                    />
                  </div>

                  {/* Address form */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4 text-amber-700">Ou saisissez manuellement</h3>
                    <AddressForm 
                      address={shippingAddress}
                      onAddressChange={setShippingAddress}
                    />
                  </div>

                  {addressError && (
                    <div ref={errorRef} className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm font-medium">
                      {addressError}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <Button 
                      onClick={handleAddressSubmit}
                      disabled={isLoading || !isAddressValid}
                      className="px-8 bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      {isLoading ? "Chargement..." : "Continuer vers le paiement"}
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="bg-white rounded-lg shadow-sm border border-amber-200 p-6">
                  <h2 className="text-xl font-semibold mb-6 text-amber-700">Paiement</h2>
                  {/* Choix du mode de paiement */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4 text-amber-700">Mode de paiement</h3>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2">
                        <FaMobileAlt className="text-amber-500" />
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="mobile"
                          checked={paymentMethod === "mobile"}
                          onChange={() => setPaymentMethod("mobile")}
                        />
                        <span>Paiement mobile (Orange, Moov, Wave...)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={() => setPaymentMethod("cod")}
                        />
                        <span>Paiement à la livraison</span>
                      </label>
                    </div>
                  </div>
                  {paymentMethod === "mobile" && (
                    <>
                      <div className="flex items-center gap-2 mt-3 mb-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <FaMobileAlt className="text-amber-500" />
                        <span className="text-amber-700 font-semibold">
                          Vous pouvez effectuer votre paiement Orange Money, Moov Money ou Wave sur le numéro <span className="font-bold">{primaryPaymentNumber}</span>.
                        </span>
                      </div>
                      <div className="mb-4">
                        <span className="block text-amber-700 font-medium">Montant total à payer (livraison incluse) :</span>
                        <span className="text-2xl font-bold text-amber-900">{total > 0 ? total.toLocaleString('fr-FR') : ''} FCFA</span>
                      </div>
                    </>
                  )}
                  {/* Affichage conditionnel du formulaire */}
                  {paymentMethod === "mobile" && (
                    <>
                      {/* Instructions de paiement */}
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                        <h3 className="font-medium text-amber-900 mb-2">Instructions de paiement</h3>
                        <p className="text-amber-700 mb-3">
                          Veuillez effectuer le paiement sur l'un des numéros ci-dessous, puis fournir les informations demandées.
                        </p>
                        <div className="text-sm text-amber-600">
                          <p><strong>Étapes :</strong></p>
                          <ol className="list-decimal list-inside space-y-1 mt-2">
                            <li>Effectuez le paiement sur l'un des numéros ci-dessous</li>
                            <li>Saisissez le numéro utilisé pour le paiement</li>
                            <li>Téléversez une capture d'écran du reçu</li>
                            <li>Validez votre commande</li>
                          </ol>
                        </div>
                      </div>
                      {/* Numéros de paiement */}
                      {!isMobile && paymentMethod === "mobile" && paymentNumbers.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-medium mb-4 text-amber-700">Numéros de paiement disponibles</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {paymentNumbers.map((payment, index) => (
                              <div key={index} className="border border-amber-200 rounded-lg p-4 text-center bg-amber-50">
                                <div className="w-12 h-12 bg-amber-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                                  <Phone className="w-6 h-6 text-white" />
                                </div>
                                <h4 className="font-medium text-amber-900 mb-2">{payment.name}</h4>
                                <p className="text-lg font-mono text-amber-700">{payment.number}</p>
                                <button
                                  onClick={() => navigator.clipboard.writeText(payment.number)}
                                  className="mt-2 text-sm text-amber-600 hover:text-amber-800"
                                >
                                  Copier le numéro
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Formulaire de paiement */}
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-amber-700 mb-2">
                            Numéro de téléphone utilisé pour le paiement *
                          </label>
                          <input
                            type="tel"
                            value={paymentInfo.clientPhone}
                            onChange={(e) => setPaymentInfo(prev => ({ ...prev, clientPhone: e.target.value }))}
                            className="w-full px-3 py-2 border border-amber-400 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                            placeholder="+223 012345678"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-amber-700 mb-2">
                            Capture d'écran ou photo du reçu de paiement *
                          </label>
                          <div className="border-2 border-dashed border-amber-400 rounded-lg p-6 text-center bg-amber-50">
                            <Upload className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                            <p className="text-sm text-amber-600 mb-2">
                              Cliquez pour sélectionner ou glissez-déposez une image
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleReceiptUpload}
                              className="hidden"
                              id="receipt-upload"
                              required
                            />
                            <label
                              htmlFor="receipt-upload"
                              className="cursor-pointer bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition-colors"
                            >
                              Sélectionner une image
                            </label>
                          </div>
                          
                          {paymentInfo.receiptPreview && (
                            <div className="mt-4">
                              <p className="text-sm text-amber-600 mb-2">Aperçu :</p>
                              <img
                                src={paymentInfo.receiptPreview}
                                alt="Aperçu du reçu"
                                className="max-w-xs rounded-lg border border-amber-200"
                              />
                            </div>
                          )}
                        </div>

                        {paymentError && (
                          <div ref={errorRef} className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm font-medium">
                            {paymentError}
                          </div>
                        )}

                        <div className="flex justify-end">
                          <Button 
                            onClick={handlePaymentSubmit}
                            disabled={isSubmitting || !paymentInfo.clientPhone || !paymentInfo.receiptImage}
                            className="px-8 bg-amber-500 hover:bg-amber-600 text-white"
                          >
                            {isSubmitting ? "Validation en cours..." : "Valider la commande"}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                  {paymentMethod === "cod" && (
                    <>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-green-700 font-semibold">
                          Vous paierez le montant total à la livraison de votre commande.
                        </p>
                      </div>
                      
                      {/* Bouton de validation pour paiement à la livraison */}
                      <div className="flex justify-end">
                        <Button 
                          onClick={handlePaymentSubmit}
                          disabled={isSubmitting}
                          className="px-8 bg-green-500 hover:bg-green-600 text-white"
                        >
                          {isSubmitting ? "Validation en cours..." : "Valider la commande"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div className="bg-white rounded-lg shadow-sm border border-amber-200 p-6">
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-amber-700 mb-4">Commande confirmée !</h2>
                    {orderNumber && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-amber-600 mb-1">Numéro de commande :</p>
                        <p className="text-lg font-mono font-bold text-amber-900">{orderNumber}</p>
                      </div>
                    )}
                    <p className="text-amber-600 mb-6">
                      {paymentMethod === "cod" 
                        ? "Votre commande a été reçue et sera traitée. Vous paierez le montant total à la livraison." 
                        : "Votre commande a été reçue et sera traitée après vérification du paiement."
                      }<br />
                      <strong>Cliquez sur le bouton WhatsApp ci-dessous pour envoyer les détails de votre commande à notre équipe.</strong>
                    </p>
                    
                    {/* Bouton WhatsApp pour envoyer les détails de la commande */}
                    <div className="flex flex-col items-center gap-3">
                      <Button 
                        onClick={() => {
                          // Utiliser les articles sauvegardés de la commande
                          const itemsList = savedOrderItems && savedOrderItems.length > 0 
                            ? savedOrderItems.map(item => `• ${item.name || 'Produit'} x${item.quantity || 1} - ${(item.price || 0).toLocaleString('fr-FR')} FCFA`).join('\n')
                            : 'Aucun article dans la commande';
                          // Recalculer le total avec les articles sauvegardés
                          const subtotalFromSaved = savedOrderItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
                          const shippingFromSaved = selectedZone ? (subtotalFromSaved >= 50000 ? 0 : selectedZone.deliveryFee) : 1500;
                          const totalFromSaved = subtotalFromSaved + shippingFromSaved;
                          const message = `🔔 *NOUVELLE COMMANDE* 🔔\n\n📋 *Numéro de commande :* ${orderNumber}\n👤 *Client :* ${shippingAddress.firstName} ${shippingAddress.lastName}\n📱 *Téléphone :* ${shippingAddress.phone || 'Non renseigné'}\n📍 *Adresse :* ${shippingAddress.address1}${shippingAddress.address2 ? ', ' + shippingAddress.address2 : ''}, ${shippingAddress.city}\n${shippingAddress.latitude && shippingAddress.longitude ? `🗺️ *Coordonnées GPS :* ${shippingAddress.latitude}, ${shippingAddress.longitude}` : ''}\n\n💰 *Montant total :* ${totalFromSaved.toLocaleString('fr-FR')} FCFA\n🚚 *Mode de paiement :* ${paymentMethod === 'mobile' ? 'Paiement mobile' : 'Paiement à la livraison'}\n${paymentMethod === 'mobile' ? `📱 *Numéro de paiement :* ${paymentInfo.clientPhone}` : ''}\n\n🛒 *Articles commandés :*\n${itemsList}\n\n${selectedZone ? `📍 *Zone de livraison :* ${selectedZone.name} (${selectedZone.deliveryTime})` : ''}\n\nMerci de traiter cette commande ! 🚀`;
                          const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
                          window.open(whatsappUrl, '_blank');
                        }}
                        className={`w-full flex items-center justify-center gap-2 font-semibold transition-all duration-200
                          ${isMobile ? 'text-base px-4 py-2 rounded-lg' : 'text-lg px-8 py-3 rounded-xl'}
                          bg-green-500 hover:bg-green-600 text-white`}
                        style={{ maxWidth: isMobile ? 320 : 480 }}
                      >
                        <svg className={isMobile ? "w-5 h-5" : "w-6 h-6"} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                        Envoyer la commande sur WhatsApp
                      </Button>
                      <Button
                        onClick={() => router.push('/')}
                        className={`w-full mt-2 flex items-center justify-center gap-2 font-semibold transition-all duration-200
                          ${isMobile ? 'text-base px-4 py-2 rounded-lg' : 'text-lg px-8 py-3 rounded-xl'}
                          bg-amber-500 hover:bg-amber-600 text-white`}
                        style={{ maxWidth: isMobile ? 320 : 480 }}
                      >
                        Retour à l'accueil
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar : n'affiche pas le récapitulatif à l'étape 3 */}
            {currentStep !== 3 && (
              <div className="lg:col-span-1">
                <CheckoutSummary selectedZone={selectedZone} currentStep={currentStep} />
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 