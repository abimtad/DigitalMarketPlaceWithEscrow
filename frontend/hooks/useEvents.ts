import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useContract } from './useContract';

export interface EscrowEvent {
  type: string;
  orderId: number;
  data: any;
  timestamp: Date;
}

export function useEvents() {
  const { contract, provider } = useContract();
  const [events, setEvents] = useState<EscrowEvent[]>([]);

  useEffect(() => {
    if (!contract || !provider) return;

    const listeners: Array<() => void> = [];

    // Listen to EscrowCreated events
    const createdListener = contract.on('EscrowCreated', (orderId, buyer, seller, amount, productId, event) => {
      setEvents((prev) => [
        {
          type: 'EscrowCreated',
          orderId: Number(orderId),
          data: { buyer, seller, amount: ethers.formatEther(amount), productId },
          timestamp: new Date(),
        },
        ...prev,
      ]);
    });

    // Listen to OrderAccepted events
    const acceptedListener = contract.on('OrderAccepted', (orderId, seller, event) => {
      setEvents((prev) => [
        {
          type: 'OrderAccepted',
          orderId: Number(orderId),
          data: { seller },
          timestamp: new Date(),
        },
        ...prev,
      ]);
    });

    // Listen to OrderShipped events
    const shippedListener = contract.on('OrderShipped', (orderId, event) => {
      setEvents((prev) => [
        {
          type: 'OrderShipped',
          orderId: Number(orderId),
          data: {},
          timestamp: new Date(),
        },
        ...prev,
      ]);
    });

    // Listen to DeliveryConfirmed events
    const confirmedListener = contract.on('DeliveryConfirmed', (orderId, event) => {
      setEvents((prev) => [
        {
          type: 'DeliveryConfirmed',
          orderId: Number(orderId),
          data: {},
          timestamp: new Date(),
        },
        ...prev,
      ]);
    });

    // Listen to DisputeOpened events
    const disputeListener = contract.on('DisputeOpened', (orderId, buyer, reason, event) => {
      setEvents((prev) => [
        {
          type: 'DisputeOpened',
          orderId: Number(orderId),
          data: { buyer, reason },
          timestamp: new Date(),
        },
        ...prev,
      ]);
    });

    // Listen to DisputeResolved events
    const resolvedListener = contract.on('DisputeResolved', (orderId, winner, amount, arbitrator, event) => {
      setEvents((prev) => [
        {
          type: 'DisputeResolved',
          orderId: Number(orderId),
          data: { winner, amount: ethers.formatEther(amount), arbitrator },
          timestamp: new Date(),
        },
        ...prev,
      ]);
    });

    listeners.push(
      () => contract.off('EscrowCreated', createdListener),
      () => contract.off('OrderAccepted', acceptedListener),
      () => contract.off('OrderShipped', shippedListener),
      () => contract.off('DeliveryConfirmed', confirmedListener),
      () => contract.off('DisputeOpened', disputeListener),
      () => contract.off('DisputeResolved', resolvedListener)
    );

    return () => {
      listeners.forEach((cleanup) => cleanup());
    };
  }, [contract, provider]);

  return events;
}
