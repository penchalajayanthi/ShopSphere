import {
  useEffect,
  useState,
} from "react";

import {
  MapPin,
  Plus,
} from "lucide-react";

import type { Address } from "../../types/address";

import { addressStorage } from "../../utils/addressStorage";

import AddressCard from "./AddressCard";
import AddressForm from "./AddressForm";

interface AddressManagerProps {
  userId: number;
}

function AddressManager({
  userId,
}: AddressManagerProps) {
  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [showForm, setShowForm] =
    useState(false);

  const [editingAddress, setEditingAddress] =
    useState<Address | null>(null);

  const loadAddresses = () => {
    setAddresses(
      addressStorage.getByUser(userId),
    );
  };

  useEffect(() => {
    loadAddresses();
  }, [userId]);

  const handleSave = (
    address: Address,
  ) => {
    if (editingAddress) {
      addressStorage.update(address);
    } else {
      addressStorage.add(address);
    }

    loadAddresses();

    setShowForm(false);
    setEditingAddress(null);
  };

  const handleEdit = (
    address: Address,
  ) => {
    setEditingAddress(address);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = (
    address: Address,
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete the address for ${address.fullName}?`,
      );

    if (!confirmed) {
      return;
    }

    addressStorage.remove(
      address.id,
    );

    loadAddresses();
  };

  const handleSetDefault = (
    address: Address,
  ) => {
    addressStorage.setDefault(
      address.id,
      userId,
    );

    loadAddresses();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <section className="mt-6 rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">

      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-[#d97706]">
            <MapPin size={21} />
          </div>

          <div>
            <h2 className="text-xl font-black text-[#29221b]">
              Addresses
            </h2>

            <p className="text-xs text-[#8c7a63]">
              Manage your delivery addresses
            </p>
          </div>

        </div>

        {!showForm && (
          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#ec4899] px-4 py-2.5 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Plus size={18} />
            Add Address
          </button>
        )}

      </div>

      {/* Form */}

      {showForm && (
        <div className="mt-6">
          <AddressForm
            address={editingAddress}
            userId={userId}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Empty state */}

      {!showForm &&
        addresses.length === 0 && (
          <div className="mt-6 rounded-2xl border-2 border-dashed border-orange-100 bg-[#fffaf0] px-6 py-10 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-[#f59e0b]">
              <MapPin size={30} />
            </div>

            <h3 className="mt-4 text-lg font-black text-[#29221b]">
              No saved addresses
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-[#8c7a63]">
              Add your delivery address so
              checkout becomes faster and
              easier.
            </p>

            <button
              type="button"
              onClick={handleAddNew}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#ec4899] px-5 py-3 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5"
            >
              <Plus size={17} />
              Add Your First Address
            </button>

          </div>
        )}

      {/* Address list */}

      {!showForm &&
        addresses.length > 0 && (
          <div className="mt-6 grid gap-5 md:grid-cols-2">

            {addresses.map(
              (address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSetDefault={
                    handleSetDefault
                  }
                />
              ),
            )}

          </div>
        )}

    </section>
  );
}

export default AddressManager;