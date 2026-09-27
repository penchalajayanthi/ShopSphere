import {
  Check,
  Edit3,
  MapPin,
  Star,
  Trash2,
} from "lucide-react";

import type { Address } from "../../types/address";

interface AddressCardProps {
  address: Address;

  onEdit: (address: Address) => void;

  onDelete: (address: Address) => void;

  onSetDefault: (
    address: Address,
  ) => void;
}

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) {
  return (
    <article
      className={`relative rounded-3xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
        address.isDefault
          ? "border-[#f59e0b] ring-2 ring-orange-100"
          : "border-orange-100"
      }`}
    >
      {/* Default badge */}

      {address.isDefault && (
        <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-[#d97706]">
          <Star
            size={13}
            className="fill-current"
          />
          Default
        </div>
      )}

      {/* Header */}

      <div className="flex items-start gap-3 pr-20">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#d97706]">
          <MapPin size={21} />
        </div>

        <div>
          <h3 className="font-black text-[#29221b]">
            {address.fullName}
          </h3>

          <p className="mt-1 text-sm font-semibold text-[#6b5b47]">
            {address.phone}
          </p>
        </div>

      </div>

      {/* Address */}

      <div className="mt-5 rounded-2xl bg-[#fffaf0] p-4">

        <p className="text-sm leading-6 text-[#6b5b47]">
          {address.addressLine}
        </p>

        <p className="mt-1 text-sm font-semibold text-[#29221b]">
          {address.city},{" "}
          {address.state} -{" "}
          {address.pincode}
        </p>

        {address.landmark && (
          <p className="mt-1 text-xs text-[#8c7a63]">
            Landmark:{" "}
            {address.landmark}
          </p>
        )}

      </div>

      {/* Actions */}

      <div className="mt-4 flex flex-wrap gap-2">

        {!address.isDefault && (
          <button
            type="button"
            onClick={() =>
              onSetDefault(address)
            }
            className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-black text-[#d97706] transition hover:bg-orange-50"
          >
            <Check size={15} />
            Set Default
          </button>
        )}

        <button
          type="button"
          onClick={() =>
            onEdit(address)
          }
          className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-black text-[#8b5cf6] transition hover:bg-purple-100"
        >
          <Edit3 size={15} />
          Edit
        </button>

        <button
          type="button"
          onClick={() =>
            onDelete(address)
          }
          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-500 transition hover:bg-red-100"
        >
          <Trash2 size={15} />
          Delete
        </button>

      </div>
    </article>
  );
}

export default AddressCard;