import { CheckoutStep1 } from "./checkout/CheckoutStep1";
import { CheckoutStep2 } from "./checkout/CheckoutStep2";
import { CheckoutStep3 } from "./checkout/CheckoutStep3";
import { useCheckoutLogic } from "../../hooks/useCheckoutLogic";

interface CheckoutViewProps {
  onBack: () => void;
  onComplete: () => void;
}

export function CheckoutView({ onBack, onComplete }: CheckoutViewProps) {
  const checkoutProps = useCheckoutLogic(onComplete);
  const { step, setStep } = checkoutProps;

  if (step === 3) {
    return (
      <CheckoutStep3
        generatedOrderId={checkoutProps.generatedOrderId}
        finalTotal={checkoutProps.finalTotal}
        onBack={onBack}
      />
    );
  }

  if (step === 2) {
    return (
      <CheckoutStep2
        total={checkoutProps.total}
        onBack={() => setStep(1)}
        comprobanteFile={checkoutProps.comprobanteFile}
        setComprobanteFile={checkoutProps.setComprobanteFile}
        isUploading={checkoutProps.isUploading}
        showConfirmDialog={checkoutProps.showConfirmDialog}
        setShowConfirmDialog={checkoutProps.setShowConfirmDialog}
        isProcessing={checkoutProps.isProcessing}
        handleConfirmPayment={checkoutProps.handleConfirmPayment}
      />
    );
  }

  return (
    <CheckoutStep1
      carrito={checkoutProps.carrito}
      productos={checkoutProps.productos}
      total={checkoutProps.total}
      subtotal={checkoutProps.subtotal}
      onBack={onBack}
      direccionEnvio={checkoutProps.direccionEnvio}
      setDireccionEnvio={checkoutProps.setDireccionEnvio}
      ciudadEnvio={checkoutProps.ciudadEnvio}
      setCiudadEnvio={checkoutProps.setCiudadEnvio}
      departamentoEnvio={checkoutProps.departamentoEnvio}
      setDepartamentoEnvio={checkoutProps.setDepartamentoEnvio}
      handleContinuarPago={checkoutProps.handleContinuarPago}
      stockValidated={checkoutProps.stockValidated}
    />
  );
}
