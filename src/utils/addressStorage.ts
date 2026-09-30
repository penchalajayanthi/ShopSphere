import type { Address } from "../types/address";
import { storage } from "./storage";

const ADDRESSES_KEY = "shopsphere_addresses";

export const addressStorage = {
  getAll(): Address[] {
    return storage.get<Address[]>(
      ADDRESSES_KEY,
      [],
    );
  },

  getByUser(userId: number): Address[] {
    return addressStorage
      .getAll()
      .filter(
        (address) =>
          address.userId === userId,
      );
  },

  getDefault(userId: number): Address | null {
    const addresses =
      addressStorage.getByUser(userId);

    return (
      addresses.find(
        (address) => address.isDefault,
      ) ?? null
    );
  },

  add(address: Address): void {
    const addresses =
      addressStorage.getAll();

    let updatedAddresses = addresses;

    if (address.isDefault) {
      updatedAddresses = addresses.map(
        (item) =>
          item.userId === address.userId
            ? {
                ...item,
                isDefault: false,
              }
            : item,
      );
    }

    storage.set(ADDRESSES_KEY, [
      address,
      ...updatedAddresses,
    ]);
  },

  update(address: Address): void {
    const addresses =
      addressStorage.getAll();

    let updatedAddresses = addresses;

    if (address.isDefault) {
      updatedAddresses = addresses.map(
        (item) =>
          item.userId === address.userId
            ? {
                ...item,
                isDefault: false,
              }
            : item,
      );
    }

    updatedAddresses = updatedAddresses.map(
      (item) =>
        item.id === address.id
          ? {
              ...address,
              updatedAt:
                new Date().toISOString(),
            }
          : item,
    );

    storage.set(
      ADDRESSES_KEY,
      updatedAddresses,
    );
  },

  remove(addressId: string): void {
    const addresses =
      addressStorage.getAll();

    const addressToRemove =
      addresses.find(
        (address) =>
          address.id === addressId,
      );

    let updatedAddresses =
      addresses.filter(
        (address) =>
          address.id !== addressId,
      );

    if (
      addressToRemove?.isDefault
    ) {
      const replacement =
        updatedAddresses.find(
          (address) =>
            address.userId ===
            addressToRemove.userId,
        );

      if (replacement) {
        updatedAddresses =
          updatedAddresses.map(
            (address) =>
              address.id ===
              replacement.id
                ? {
                    ...address,
                    isDefault: true,
                    updatedAt:
                      new Date().toISOString(),
                  }
                : address,
          );
      }
    }

    storage.set(
      ADDRESSES_KEY,
      updatedAddresses,
    );
  },

  setDefault(
    addressId: string,
    userId: number,
  ): void {
    const addresses =
      addressStorage.getAll();

    const updatedAddresses =
      addresses.map((address) => {
        if (
          address.userId !== userId
        ) {
          return address;
        }

        return {
          ...address,
          isDefault:
            address.id === addressId,
          updatedAt:
            new Date().toISOString(),
        };
      });

    storage.set(
      ADDRESSES_KEY,
      updatedAddresses,
    );
  },
};