import {useEffect,useState} from "react";
import type { SyntheticEvent } from "react";
import {MapPin,Save,X,} from "lucide-react";
import type { Address } from "../../types/address";

interface AddressFormProps {
  address?: Address | null;
  userId: number;
  onSave: (address: Address) => void;
  onCancel: () => void;
}

interface FormData {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  isDefault: boolean;
}

const emptyForm: FormData = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
  isDefault: false,
};

function AddressForm({address,userId,onSave,onCancel,}: AddressFormProps) {
  const [formData, setFormData] =useState<FormData>(emptyForm);
  const [errors, setErrors] =useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    if (address) {
      setFormData({
        fullName: address.fullName,
        phone: address.phone,
        addressLine:address.addressLine,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        landmark:address.landmark ?? "",
        isDefault: address.isDefault,
      });
    } else {
      setFormData(emptyForm);
    }

    setErrors({});
  }, [address]);

  const handleChange = (field: keyof FormData,value: string | boolean,) => {
    setFormData((current) => ({ ...current, [field]: value,}));
    setErrors((current) => ({...current, [field]: "", }));
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.fullName.trim()) {newErrors.fullName = "Full name is required.";}

    if (!formData.phone.trim()) {
      newErrors.phone =
        "Phone number is required.";
    } else if (
      !/^[6-9]\d{9}$/.test(
        formData.phone.trim(),
      )
    ) {
      newErrors.phone =
        "Enter a valid 10-digit Indian mobile number.";
    }

    if (!formData.addressLine.trim()) {
      newErrors.addressLine =
        "Address is required.";
    }

    if (!formData.city.trim()) {
      newErrors.city =
        "City is required.";
    }

    if (!formData.state.trim()) {
      newErrors.state =
        "State is required.";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode =
        "PIN code is required.";
    } else if (
      !/^\d{6}$/.test(
        formData.pincode.trim(),
      )
    ) {
      newErrors.pincode =
        "PIN code must contain 6 digits.";
    }

    setErrors(newErrors);

    return (Object.keys(newErrors).length === 0);
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>,) => {event.preventDefault();

    if (!validate()) {
      return;
    }

    const now =new Date().toISOString();

    const savedAddress: Address = {
      id:address?.id ??`address-${Date.now()}`,
      userId,
      fullName:formData.fullName.trim(),
      phone:formData.phone.trim(),
      addressLine:formData.addressLine.trim(),
      city:formData.city.trim(),
      state:formData.state.trim(),
      pincode:formData.pincode.trim(),
      landmark: formData.landmark.trim() || undefined,
      isDefault:formData.isDefault,
      createdAt: address?.createdAt ?? now,
      updatedAt: now,
    };
    onSave(savedAddress);
  };

  const inputClass ="mt-2 w-full rounded-xl border border-orange-200 bg-[#fffaf0] px-4 py-3 text-sm text-[#29221b] outline-none transition focus:border-[#f59e0b] focus:ring-2 focus:ring-orange-100";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-orange-100 bg-white p-6 shadow-lg sm:p-7"
    >
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-[#d97706]">
            <MapPin size={22} />
          </div>

          <div>
            <h3 className="text-xl font-black text-[#29221b]">
              {address
                ? "Edit Address"
                : "Add New Address"}
            </h3>

            <p className="mt-1 text-sm text-[#8c7a63]">
              {address
                ? "Update your saved delivery address."
                : "Add a delivery address to your account."}
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={onCancel}
          aria-label="Close address form"
          className="rounded-xl p-2 text-gray-500 transition hover:bg-orange-50 hover:text-[#d97706]"
        >
          <X size={21} />
        </button>
      </div>

      {/* Form */}
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Full Name */}
        <div>
          <label
            htmlFor="address-full-name"
            className="text-sm font-bold text-[#29221b]"
          >
            Full Name *
          </label>

          <input
            id="address-full-name"
            type="text"
            value={formData.fullName}
            onChange={(event) =>
              handleChange(
                "fullName",
                event.target.value,
              )
            }
            placeholder="Enter full name"
            className={inputClass}
            aria-invalid={
              Boolean(errors.fullName)
            }
          />

          {errors.fullName && (
            <p className="mt-1 text-xs font-semibold text-red-500">
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Phone */}

        <div>
          <label
            htmlFor="address-phone"
            className="text-sm font-bold text-[#29221b]"
          >
            Phone Number *
          </label>

          <input
            id="address-phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={formData.phone}
            onChange={(event) =>
              handleChange(
                "phone",
                event.target.value.replace(
                  /\D/g,
                  "",
                ),
              )
            }
            placeholder="10-digit mobile number"
            className={inputClass}
            aria-invalid={
              Boolean(errors.phone)
            }
          />

          {errors.phone && (
            <p className="mt-1 text-xs font-semibold text-red-500">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Address */}

        <div className="sm:col-span-2">
          <label
            htmlFor="address-line"
            className="text-sm font-bold text-[#29221b]"
          >
            Address *
          </label>

          <textarea
            id="address-line"
            value={formData.addressLine}
            onChange={(event) =>
              handleChange(
                "addressLine",
                event.target.value,
              )
            }
            placeholder="House / Flat / Street / Area"
            rows={3}
            className={`${inputClass} resize-none`}
            aria-invalid={
              Boolean(errors.addressLine)
            }
          />

          {errors.addressLine && (
            <p className="mt-1 text-xs font-semibold text-red-500">
              {errors.addressLine}
            </p>
          )}
        </div>

        {/* City */}

        <div>
          <label
            htmlFor="address-city"
            className="text-sm font-bold text-[#29221b]"
          >
            City *
          </label>

          <input
            id="address-city"
            type="text"
            value={formData.city}
            onChange={(event) =>
              handleChange(
                "city",
                event.target.value,
              )
            }
            placeholder="Enter city"
            className={inputClass}
            aria-invalid={
              Boolean(errors.city)
            }
          />

          {errors.city && (
            <p className="mt-1 text-xs font-semibold text-red-500">
              {errors.city}
            </p>
          )}
        </div>

        {/* State */}

        <div>
          <label
            htmlFor="address-state"
            className="text-sm font-bold text-[#29221b]"
          >
            State *
          </label>

          <input
            id="address-state"
            type="text"
            value={formData.state}
            onChange={(event) =>
              handleChange(
                "state",
                event.target.value,
              )
            }
            placeholder="Enter state"
            className={inputClass}
            aria-invalid={
              Boolean(errors.state)
            }
          />

          {errors.state && (
            <p className="mt-1 text-xs font-semibold text-red-500">
              {errors.state}
            </p>
          )}
        </div>

        {/* Pincode */}

        <div>
          <label
            htmlFor="address-pincode"
            className="text-sm font-bold text-[#29221b]"
          >
            PIN Code *
          </label>

          <input
            id="address-pincode"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={formData.pincode}
            onChange={(event) =>
              handleChange(
                "pincode",
                event.target.value.replace(
                  /\D/g,
                  "",
                ),
              )
            }
            placeholder="6-digit PIN code"
            className={inputClass}
            aria-invalid={
              Boolean(errors.pincode)
            }
          />

          {errors.pincode && (
            <p className="mt-1 text-xs font-semibold text-red-500">
              {errors.pincode}
            </p>
          )}
        </div>

        {/* Landmark */}

        <div>
          <label
            htmlFor="address-landmark"
            className="text-sm font-bold text-[#29221b]"
          >
            Landmark
            <span className="ml-1 font-normal text-gray-400">
              (Optional)
            </span>
          </label>

          <input
            id="address-landmark"
            type="text"
            value={formData.landmark}
            onChange={(event) =>
              handleChange(
                "landmark",
                event.target.value,
              )
            }
            placeholder="Nearby landmark"
            className={inputClass}
          />
        </div>

      </div>

      {/* Default checkbox */}

      <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-2xl bg-[#fffaf0] p-4">

        <input
          type="checkbox"
          checked={formData.isDefault}
          onChange={(event) =>
            handleChange(
              "isDefault",
              event.target.checked,
            )
          }
          className="h-4 w-4 accent-[#f59e0b]"
        />

        <span>
          <span className="block text-sm font-black text-[#29221b]">
            Set as default address
          </span>

          <span className="mt-0.5 block text-xs text-[#8c7a63]">
            Use this address automatically during checkout.
          </span>
        </span>

      </label>

      {/* Buttons */}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-orange-200 bg-white px-5 py-3 text-sm font-bold text-[#6b5b47] transition hover:bg-orange-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#ec4899] px-5 py-3 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <Save size={17} />

          {address
            ? "Update Address"
            : "Save Address"}
        </button>

      </div>
    </form>
  );
}

export default AddressForm;