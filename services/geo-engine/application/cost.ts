import { CostAnalysis, Coordinates } from "../domain/types";
import { calculateDistance } from "./distance";

const TRANSPORT_COST_PER_KM = 2000;
const DELIVERY_BASE_COST = 5000;

export function analyzeTotalCost(
    origin: Coordinates,
    destination: Coordinates,
    productPrice: number,
    hasDelivery = false
): CostAnalysis {
    const distance = calculateDistance(origin, destination, "driving");
    const transportCost = distance.kilometers * TRANSPORT_COST_PER_KM;
    const deliveryCost = hasDelivery ? DELIVERY_BASE_COST : 0;
    const totalCost = productPrice + transportCost + deliveryCost;
    const savings = 0;

    let recommendation: string;
    if (distance.kilometers < 1) {
        recommendation = "Puedes ir caminando. Ahorras en transporte.";
    } else if (transportCost < productPrice * 0.1) {
        recommendation = "Vale la pena desplazarse. El ahorro supera el costo de transporte.";
    } else {
        recommendation = "Considera domicilio. El desplazamiento puede no ser rentable.";
    }

    return {
        productPrice,
        transportCost,
        deliveryCost,
        totalCost,
        savings,
        recommendation
    };
}
